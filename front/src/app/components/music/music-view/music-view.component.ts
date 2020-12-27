import {Component, OnInit} from "@angular/core";
import Album from "../../../types/album";
import {SearchService} from "../../../services/search.service";
import Track from "../../../types/track";

@Component({
	selector: "app-music-view",
	templateUrl: "./music-view.component.html",
	styleUrls: ["./music-view.component.css"]
})
export class MusicViewComponent implements OnInit {

	public albums: Array<Album> = [];
	tracks: Array<Track> = [];

	constructor(search: SearchService) {
		search.filtered_albums.subscribe(val => {
			this.albums = val;
		});
		search.filtered_tracks.subscribe(val => {
			if(search.current_search.length > 0)
				this.tracks = val;
			else
				this.tracks = [];
		})
	}

	ngOnInit() {
	}
}
