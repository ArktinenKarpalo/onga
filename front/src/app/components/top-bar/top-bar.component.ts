import {Component, OnInit} from "@angular/core";
import {SearchService} from "../../services/search.service";
import {UploadService} from "../../services/upload.service";
import Cookies from "js-cookie"
import {UserService} from "../../services/user.service";
import {Router} from "@angular/router";

@Component({
	selector: "app-top-bar",
	templateUrl: "./top-bar.component.html",
	styleUrls: ["./top-bar.component.css"]
})
export class TopBarComponent implements OnInit {
	Cookies = Cookies;

	constructor(public search: SearchService, public upload: UploadService, public user: UserService, public router: Router) {
	}

	ngOnInit() {
	}
}
