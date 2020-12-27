import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import Cookies from "js-cookie"
import * as musicMetadata from "music-metadata-browser";
import {UserService} from "./user.service";

export interface Album_upload {
	name?: string;
	year?: number;
	composer?: string;
	genre?: Array<string>;
	artist?: string;
}

export interface Track_upload {
	name?: string;
	artist?: string;
	composer?: Array<string>;
	genre?: Array<string>;
	year?: number;
	track_num?: number;
	track_total?: number;
	duration?: number;
	disc_num?: number;
	disc_total?: number;
	file: File
}

@Injectable({
	providedIn: "root"
})
export class UploadService {
	upload_queue = 0
	uploads_processing = 0;
	uploading = 0;
	uploading_max = 3;

	uploads: FormData[] = []

	constructor(private httpClient: HttpClient, private user: UserService) {
	}

	async uploadFiles2(data: FileList) {
		this.uploads_processing++;
		const covers = new Map<string, Blob>(); // path to folder - cover file buffer
		const albums = new Map<string, Album_upload>(); // path to folder - Album
		const tracks = new Map<string, Array<Track_upload>>(); // path to folder - array of tracks
		// Parse metadata, covers etc.
		for(let i = 0; i < data.length; i++) {
			const file: File = data.item(i);
			// @ts-ignore
			const original_path: string = file.webkitRelativePath;
			const directory_path = original_path.substring(0, original_path.length - file.name.length);
			if(file.type.startsWith("audio/")) {
				let metadata;
				try {
					metadata = await musicMetadata.parseBlob(file);
				} catch(err) {
					continue;
				}
				if(!albums.has(directory_path)) {
					albums.set(directory_path, {
						name: metadata.common.album,
						year: metadata.common.year,
						genre: metadata.common.genre,
						artist: metadata.common.albumartist
					});
				}
				const track: Track_upload = {
					name: metadata.common.title,
					artist: metadata.common.artist,
					composer: metadata.common.composer,
					genre: metadata.common.genre,
					year: metadata.common.year,
					track_num: metadata.common.track.no || undefined,
					track_total: metadata.common.track.of || undefined,
					disc_num: metadata.common.disk.no || undefined,
					disc_total: metadata.common.disk.of || undefined,
					duration: metadata.format.duration,
					file: file
				};

				const track_list: Array<Track_upload> | undefined = tracks.get(directory_path);
				if(track_list === undefined) {
					tracks.set(directory_path, [track]);
				} else {
					track_list.push(track);
				}

				if(metadata.common.picture != undefined && metadata.common.picture.length > 0) {
					const cover = musicMetadata.selectCover(metadata.common.picture);
					covers.set(directory_path, new Blob([cover.data], {type: cover.format}));
				}
			} else if(file.type.startsWith("image/")) {
				if(!covers.has(directory_path) || file.name.toLowerCase().startsWith("cover."))
					covers.set(directory_path, file);
			}
		}
		for(let album of albums) {
			for(let i = 0; i < tracks.get(album[0]).length; i++) {
				const fd = new FormData();
				const track = tracks.get(album[0])[i];
				if(i == 0 && covers.has(album[0])) {
					fd.append("cover", covers.get(album[0]))
				}
				fd.append("file", track.file);
				delete track.file;
				fd.append("track", JSON.stringify(track));
				fd.append("album", JSON.stringify(album[1]));
				this.upload_queue++;
				this.uploads.push(fd);
				this.upload();
			}
		}
		this.uploads_processing--;
		this.user.should_refresh = true;
		window.onbeforeunload = () => "";
	}

	async runUploadWorker() {
		while(this.uploads.length > 0) {
			await (this.httpClient.post("api/music/upload2", this.uploads.pop(),
				{
					headers: {Authorization: Cookies.get("session")},
					responseType: "text"
				}).toPromise()
				.catch(e => console.error("Uploading failed ", e))
				.finally(() => this.upload_queue--));
		}
	}

	async upload() {
		while(this.uploading < this.uploading_max && this.uploads.length > 0) {
			this.uploading++;
			this.runUploadWorker().finally(() => this.uploading--);
		}
	}

}
