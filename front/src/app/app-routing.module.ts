import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";

import {LoginViewComponent} from "./components/auth/login-view/login-view.component";
import {RegisterViewComponent} from "./components/auth/register-view/register-view.component";
import {AlbumViewComponent} from "./components/music/album-view/album-view.component";
import {MusicViewComponent} from "./components/music/music-view/music-view.component";
import {MainComponent} from "./components/main/main.component";

const routes: Routes = [
	{
		path: "", component: MainComponent, children:
			[
				{path: "", component: MusicViewComponent},
				{path: "Album/:id", component: AlbumViewComponent}
			]
	},
	{path: "login", component: LoginViewComponent},
	{path: "register", component: RegisterViewComponent},
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
	exports: [RouterModule]
})

export class AppRoutingModule {
}
