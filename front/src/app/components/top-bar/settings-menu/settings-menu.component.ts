import {Component, OnInit, ViewChild} from "@angular/core";
import Cookies from "js-cookie";
import {MatExpansionPanel} from "@angular/material/expansion";
import {UserService} from "../../../services/user.service";

@Component({
	selector: "app-settings-menu",
	templateUrl: "./settings-menu.component.html",
	styleUrls: ["./settings-menu.component.css"]
})
export class SettingsMenuComponent implements OnInit {
	Cookies = Cookies;

	@ViewChild(MatExpansionPanel) settingsExpand: MatExpansionPanel;

	constructor(public user: UserService) {
	}

	ngOnInit(): void {
	}

}
