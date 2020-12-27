import {Component, Inject, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../services/user.service";
import Album from "../../../types/album";
import Track from "../../../types/track";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {MusicService} from "../../../services/music.service";

@Component({
	selector: "app-album-view",
	templateUrl: "./album-view.component.html",
	styleUrls: ["./album-view.component.css"]
})
export class AlbumViewComponent implements OnInit {

	tracks: Track[] = [];
	album_id = -1;
	album?: Album;
	duration = 0;

	constructor(private router: Router, private route: ActivatedRoute, public user: UserService, private dialog: MatDialog, public music: MusicService) {
		this.album_id = Number.parseInt(this.route.snapshot.paramMap.get("id"));
		user.albums.subscribe(albums => {
			this.album = albums.find((album) => album.id == this.album_id);
			if(this.album == undefined && user.albums_loaded)
				router.navigate([""]);
		});
		user.tracks.subscribe(tracks => {
			this.duration = 0;
			this.tracks = tracks.filter((track) => track.album_id == this.album_id);
			this.tracks.forEach((track: Track) => {
				this.duration += Number.parseInt(track.duration);
			});
		});
	}

	deleteAlbumConfirm() {
		this.dialog.open(AlbumDeleteDialog, {data: this.album});
	}

	ngOnInit() {
	}

}

@Component({
	selector: "album-delete-dialog",
	templateUrl: "album-delete-dialog.html"
})
export class AlbumDeleteDialog {
	constructor(@Inject(MAT_DIALOG_DATA) public data: Album, public user: UserService) {
	}
}