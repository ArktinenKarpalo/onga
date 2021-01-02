import {Component, HostListener, OnInit} from "@angular/core";
import {MusicService, repeat, states} from "../../../services/music.service";
import {UserService} from "../../../services/user.service";

@Component({
	selector: "app-music-player",
	templateUrl: "./music-player.component.html",
	styleUrls: ["./music-player.component.css"]
})
export class MusicPlayerComponent implements OnInit {
	states = states;
	repeat = repeat;

	shareClipboard = "Click to copy link to the current track into clipboard";

	@HostListener("document:keypress", ["$event"])
	handleKeyboardEvent(event: KeyboardEvent) {
		if(event.code == "Space") {
			event.preventDefault();
			this.music.toggle();
		} else if(event.code == "KeyM") {
			if(this.music.current_audio.volume == 0) {
				this.music.setVolume(100);
			} else {
				this.music.setVolume(0);
			}
		}
	}

	constructor(public user: UserService, public music: MusicService) {
	}

	ngOnInit() {
	}

	copyToClipboard() {
		this.shareClipboard = "Link copied!";
		setTimeout(() => this.shareClipboard = "Click to copy link to the current track into clipboard", 1050);
	}
}
