import {Injectable} from "@angular/core";
import {UserService} from "./user.service";
import {BehaviorSubject} from "rxjs";
import Album from "../types/album";
import Track from "../types/track";
import {Router} from "@angular/router";

@Injectable({
	providedIn: "root"
})
export class SearchService {

	public filtered_albums = new BehaviorSubject<Array<Album>>([]);
	public filtered_tracks = new BehaviorSubject<Array<Track>>([]);
	public current_search = "";

	constructor(private user: UserService, private router: Router) {
		user.tracks.subscribe((data) => {
			this.filtered_tracks.next(this.filter_tracks(data, this.current_search));
		});
		user.albums.subscribe((data) => {
			this.filtered_albums.next(this.filter_albums(data, this.current_search));
		});
	}

	private filter_albums(albums: Album[], search: string, album_ids: Set<number> = new Set()): Album[] {
		return albums.filter((val: Album) => {
			if(val.artist.toLowerCase().includes(search) ||
				val.name.toLowerCase().includes(search) ||
				album_ids.has(val.id))
				return true;
		});
	}

	private filter_tracks(albums: Track[], search: string): Track[] {
		return albums.filter((val: Track) => {
			if(val.composer.toLowerCase().includes(search) ||
				val.artist.toLowerCase().includes(search) ||
				val.name.toLowerCase().includes(search))
				return true;
		});
	}

	public search(s: string) {
		this.router.navigate([""]);
		s = s.toLowerCase();
		this.current_search = s;
		this.filtered_tracks.next(this.filter_tracks(this.user.tracks.getValue(), s));
		const album_ids = new Set<number>();
		for(let track of this.filtered_tracks.getValue()) {
			album_ids.add(track.album_id);
		}
		this.filtered_albums.next(this.filter_albums(this.user.albums.getValue(), s, album_ids));
	}
}
