import {Component, OnInit, ViewChild} from "@angular/core";
import {MusicService, states} from "../../../../services/music.service";
import {DurationPipe} from "../../../../pipes/duration.pipe";

@Component({
	selector: "app-play-progress",
	templateUrl: "./play-progress.component.html",
	styleUrls: ["./play-progress.component.css"]
})
export class PlayProgressComponent implements OnInit {
	states = states;

	@ViewChild("playProgressBar") playProgressBar;
	@ViewChild("playSkipProgress") playSkipProgress;
	@ViewChild("playProgressBarFillSkip") playProgressBarFillSkip;
	durationPipe: DurationPipe;

	showSkipProgress = false;

	constructor(public music: MusicService) {
		this.durationPipe = new DurationPipe();
	}

	ngOnInit(): void {
	}

	setProgress(ev) {
		const p = ev.offsetX / this.playProgressBar.nativeElement.clientWidth;
		this.music.current_audio.currentTime = p * this.music.current_audio.duration;
	}

	hoverProgress(ev) {
		if(this.music.current_audio.readyState >= 1 && this.music.current_audio.duration > 0) {
			this.showSkipProgress = true;

			const p = ev.offsetX / ev.view.innerWidth;
			this.playSkipProgress.nativeElement.textContent = this.durationPipe.transform(p * this.music.current_audio.duration);
			this.playSkipProgress.nativeElement.style.left = ev.layerX - this.playSkipProgress.nativeElement.clientWidth / 2 + "px";
			this.playSkipProgress.nativeElement.style.top =
				this.playProgressBar.nativeElement.offsetTop -
				this.playSkipProgress.nativeElement.clientHeight - 5 + "px";
			this.playProgressBarFillSkip.nativeElement.style.width = p * 100 + "%";
		}
	}
}
