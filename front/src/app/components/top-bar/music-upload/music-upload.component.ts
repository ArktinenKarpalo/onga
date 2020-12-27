import {Component, OnInit} from "@angular/core";
import Cookies from "js-cookie"
import {UploadService} from "../../../services/upload.service";
import {UserService} from "../../../services/user.service";

@Component({
	selector: "app-music-upload",
	templateUrl: "./music-upload.component.html",
	styleUrls: ["./music-upload.component.css"]
})
export class MusicUploadComponent implements OnInit {
	Cookies = Cookies;

	constructor(public user: UserService, public upload: UploadService) {
	}

	ngOnInit() {
	}

}
