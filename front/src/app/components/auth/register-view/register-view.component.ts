import {Component, OnInit} from "@angular/core";
import {FormBuilder} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";

@Component({
	selector: "app-register-view",
	templateUrl: "./register-view.component.html",
	styleUrls: ["./register-view.component.css"]
})
export class RegisterViewComponent implements OnInit {

	registerForm;
	error;

	constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router) {
		this.registerForm = this.formBuilder.group({
			username: "",
			password: ""
		});
	}

	ngOnInit() {
	}

	async onSubmit(data) {
		this.http.post("api/auth/register", data, {headers: {csrf: "ok"}}).subscribe((response: any) => {
			if(response.status === "OK")
				this.router.navigate(["login"]);
			else
				this.error = "Error: " + response.status;
		}, (error) => {
			this.error = "Error " + error.status;
			console.error(error);
		});
	}
}
