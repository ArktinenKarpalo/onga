import {Component, OnInit} from "@angular/core";
import {FormBuilder} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {UserService} from "../../../services/user.service";

@Component({
	selector: "app-login-view",
	templateUrl: "./login-view.component.html",
	styleUrls: ["./login-view.component.css"]
})
export class LoginViewComponent implements OnInit {

	loginForm;
	error;

	constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router, private user: UserService) {
		this.loginForm = this.formBuilder.group({
			username: "",
			password: ""
		});
	}

	ngOnInit() {
	}

	async onSubmit(data) {
		const error = await this.user.login(data.username, data.password);
		if(error)
			this.error = error;
	}
}
