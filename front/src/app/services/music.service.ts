import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import Cookies from "js-cookie"
import Track from "../types/track";
import {UserService} from "./user.service";
import {randomInt} from "../utils";
import Album from "../types/album";

export enum states {
	PLAYING,
	PAUSED,
	LOADING
}

export enum repeat {
	NO,
	ALL,
	ONE
}

@Injectable()
export class MusicService {
	play_queue = [];
	play_history = [];

	repeating: repeat = repeat.NO;
	shuffle: Boolean = false;

	current_track: Track | undefined = undefined;

	state = states.PAUSED;

	current_audio: HTMLAudioElement = new Audio(undefined);

	constructor(private user: UserService, private http: HttpClient) {
		this.current_audio.volume = Cookies.get("volume") || 1.0;
		this.current_audio.onerror = (ev) => {
			console.error("Audio error: ", ev);
		};
		this.current_audio.onended = (ev) => {
			this.user.track_played(this.current_track);
			if(this.repeating == repeat.ONE) {
				this.current_audio.currentTime = 0;
				this.current_audio.play();
			} else {
				this.next();
			}
		};
		this.current_audio.addEventListener("timeupdate", ev => {
			// Required for updates
		})
	}

	setVolume(volume: number) {
		this.current_audio.volume = volume / 100.0;
		Cookies.set("volume", volume / 100.0, {expires: (1 << 16)});
	}

	playAlbum(album: Album) {
		const tracks = this.user.tracks.getValue().filter((al) => al.album_id == album.id);
		this.setTrack(undefined);
		this.clear_queue();
		this.appendToQueue(...tracks.sort((a, b) => {
			if(Number.parseInt(a.disc_num) > Number.parseInt(b.disc_num))
				return 1;
			else if(Number.parseInt(a.disc_num) < Number.parseInt(b.disc_num))
				return -1;
			else
				return Number.parseInt(a.track_num) - Number.parseInt(b.track_num);
		}));
		this.next();
		this.user.album_played(album);
	}

	toggle() {
		if(this.state == states.PAUSED) {
			this.state = states.PLAYING;
			this.current_audio.play().catch(err => {
				console.error("play fail", err);
				this.next();
			});
		} else {
			this.state = states.PAUSED;
			this.current_audio.pause();
		}
	}

	appendToQueue(...tracks: Track[]) {
		this.play_queue.push(...tracks);
		this.play_queue = [...this.play_queue]
	}

	appendToQueueFront(...tracks: Track[]) {
		this.play_queue.unshift(...tracks);
		this.play_queue = [...this.play_queue]
	}

	setTrack(track: Track) {
		this.current_audio.pause();
		if(this.current_track != undefined) {
			this.play_history.push(this.current_track);
			this.play_history = [...this.play_history];
		}
		this.current_track = track;
		if(track == undefined) {
			this.current_audio.src = "";
			this.current_audio.load();
			this.state = states.PAUSED;
			return;
		}
		this.state = states.LOADING;

		const track_req_start = this.current_track;

		this.current_audio.src = "";
		this.current_audio.load();

		this.http.get("/api/music/track_file/" + this.user.selected_quality + "/" + this.current_track.id,
			{headers: {Authorization: Cookies.get("session")}}).subscribe((val: { path: string }) => {
			if(this.current_track == track_req_start) {
				this.current_audio.src = "files/" + val.path;
				this.current_audio.play();
				this.state = states.PLAYING;
			}
		}, err => {
			if(this.current_track == track_req_start)
				this.next();
			console.error(err);
		});
	}

	skipTo(offset: number) {
		this.shuffle = false;
		this.setTrack(undefined);
		if(offset > 0) {
			this.play_history = this.play_history.concat(this.play_queue.splice(0, offset - 1));
			this.play_queue = [...this.play_queue];
			this.next();
		} else {
			offset = -offset + 1;
			this.play_queue = this.play_history.splice(this.play_history.length - offset, offset).concat(this.play_queue);
			this.play_history = [...this.play_history];
			this.next();
		}
	}

	next() {
		if(this.play_queue.length == 0) {
			if(this.repeating == repeat.ALL) {
				this.setTrack(undefined);
				this.play_queue = this.play_history;
				this.play_history = [];
			}
		}
		if(this.play_queue.length == 0) {
			this.setTrack(undefined);
			return;
		}
		if(this.shuffle) {
			const random_index = randomInt(0, this.play_queue.length - 1);
			this.setTrack(this.play_queue.splice(random_index, 1)[0]);
			this.play_queue = [...this.play_queue]
		} else {
			this.setTrack(this.play_queue.splice(0, 1)[0]);
			this.play_queue = [...this.play_queue]
		}
	}

	previous() {
		const last = this.play_history.pop();
		this.play_history = [...this.play_history];
		if(last != undefined) {
			if(this.current_track != undefined) {
				this.play_queue.unshift(this.current_track);
				this.play_queue = [...this.play_queue]
				this.current_track = undefined;
			}
			this.setTrack(last);
		} else {
			console.error("Tried to set previous track, no previous track was found.");
		}
	}

	clear_queue() {
		this.play_queue = [];
		this.play_history = [];
	}

	ngOnDestroy() {
		this.current_audio.pause();
		this.current_audio.remove();
	}
}
