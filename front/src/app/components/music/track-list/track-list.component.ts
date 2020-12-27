import {AfterViewInit, Component, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from "@angular/core";
import {MatTableDataSource} from "@angular/material/table";

import Track from "../../../types/track";
import {MatSort} from "@angular/material/sort";
import {MusicService} from "../../../services/music.service";
import {UserService} from "../../../services/user.service";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";

@Component({
	selector: "app-track-list",
	templateUrl: "./track-list.component.html",
	styleUrls: ["./track-list.component.css"]
})
export class TrackListComponent implements OnInit, AfterViewInit, OnChanges {

	@Input() tracks: Array<Track> = [];

	displayedColumns = ["num", "name", "artist", "duration", "menu"]

	dataSource = new MatTableDataSource<Track>();

	@ViewChild(MatSort) sort: MatSort;

	constructor(private user: UserService, public music: MusicService, public dialog: MatDialog) {
	}

	encoding_unavailable(idx) {
		return !(this.dataSource.connect().getValue()[idx].qualities.find(val =>
			(val.quality == this.user.selected_quality && val.status == 2)) != undefined);
	}

	queueFrom(idx) {
		const sortedData: Track[] = this.dataSource.connect().getValue();
		this.music.setTrack(undefined);
		this.music.clear_queue();
		this.music.appendToQueue(...sortedData.slice(idx));
		this.music.next();
	}

	ngOnChanges(changes: SimpleChanges) {
		this.dataSource.data = this.tracks.sort((a, b) => {
			if(Number.parseInt(a.disc_num) > Number.parseInt(b.disc_num))
				return 1;
			else if(Number.parseInt(a.disc_num) < Number.parseInt(b.disc_num))
				return -1;
			else return Number.parseInt(a.track_num) - Number.parseInt(b.track_num);
		});
	}

	ngAfterViewInit() {
		this.dataSource.sort = this.sort;
		this.dataSource.sortingDataAccessor = ((data: Track, sortHeaderId) => {
			if(sortHeaderId === "num") {
				return (data.disc_num != undefined ? Number.parseInt(data.disc_num) * 1000 : 0) +
					(data.track_num != undefined ? Number.parseInt(data.track_num) : 0);
			} else if(sortHeaderId === "artist") {
				return data.artist;
			} else if(sortHeaderId === "duration") {
				return (data.duration != undefined ? Number.parseInt(data.duration) : 0);
			} else if(sortHeaderId === "name") {
				return data.name;
			} else if(sortHeaderId === "playcnt") {
				return data.play_cnt;
			}
		});
	}

	deleteTrackConfirm(track: Track) {
		this.dialog.open(TrackDeleteDialog, {data: track});
	}

	ngOnInit() {
	}

}

@Component({
	selector: "track-delete-dialog",
	templateUrl: "track-delete-dialog.html"
})
export class TrackDeleteDialog {
	constructor(@Inject(MAT_DIALOG_DATA) public data: Track, public user: UserService) {
	}
}