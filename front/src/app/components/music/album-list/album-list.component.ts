import {Component, Input, OnInit} from "@angular/core";
import Album from "../../../types/album";
import {Router} from "@angular/router";
import {MusicService} from "../../../services/music.service";

@Component({
	selector: "app-album-list",
	templateUrl: "./album-list.component.html",
	styleUrls: ["./album-list.component.css"]
})
export class AlbumListComponent implements OnInit {
	@Input() albums: Album[];

	constructor(private router: Router, public music: MusicService) {
	}

	ngOnInit() {
	}

	sortAlbums(albums: Album[]) {
		return albums.sort((a: Album, b: Album): number => {
			if(a.last_played == b.last_played)
				return 0;
			else if(a.last_played > b.last_played)
				return -1;
			else
				return 1;
		})
	}

	viewAlbum(album: Album) {
		this.router.navigate(["Album/" + album.id]);
	}
}
