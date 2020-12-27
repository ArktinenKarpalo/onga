import {Component, OnInit, ViewChild} from "@angular/core";
import {MusicService, states} from "../../../../services/music.service";
import {MatExpansionPanel} from "@angular/material/expansion";
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";

@Component({
	selector: "app-playlist",
	templateUrl: "./playlist.component.html",
	styleUrls: ["./playlist.component.css"]
})
export class PlaylistComponent implements OnInit {
	states = states;
	@ViewChild(MatExpansionPanel) playlistExpand: MatExpansionPanel;

	@ViewChild(CdkVirtualScrollViewport) vs: CdkVirtualScrollViewport;

	constructor(public music: MusicService) {
	}

	ngOnInit() {
	}

	toNumber(s: string): number {
		return Number.parseInt(s);
	}
}
