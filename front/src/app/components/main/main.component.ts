import {Component, OnInit} from "@angular/core";
import {MusicService} from "../../services/music.service";

@Component({
	selector: "app-main",
	templateUrl: "./main.component.html",
	styleUrls: ["./main.component.css"],
	providers: [MusicService]
})
export class MainComponent implements OnInit {

	constructor() {
	}

	ngOnInit(): void {
	}

}
