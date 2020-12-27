import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";

import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./components/app/app.component";
import {LoginViewComponent} from "./components/auth/login-view/login-view.component";
import {ReactiveFormsModule} from "@angular/forms";
import {RegisterViewComponent} from "./components/auth/register-view/register-view.component";
import {MusicViewComponent} from "./components/music/music-view/music-view.component";
import {MusicUploadComponent} from "./components/top-bar/music-upload/music-upload.component";
import {AlbumListComponent} from "./components/music/album-list/album-list.component";
import {TrackDeleteDialog, TrackListComponent} from "./components/music/track-list/track-list.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatTableModule} from "@angular/material/table";
import {AlbumDeleteDialog, AlbumViewComponent} from "./components/music/album-view/album-view.component";
import {DurationPipe} from "./pipes/duration.pipe";
import {MatSortModule} from "@angular/material/sort";
import {MusicPlayerComponent} from "./components/music/music-player/music-player.component";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {PlaylistComponent} from "./components/music/music-player/playlist/playlist.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {TopBarComponent} from "./components/top-bar/top-bar.component";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {PlayProgressComponent} from "./components/music/music-player/play-progress/play-progress.component";
import {MatDialogModule} from "@angular/material/dialog";
import {SettingsMenuComponent} from "./components/top-bar/settings-menu/settings-menu.component";
import {MatRadioModule} from "@angular/material/radio";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSliderModule} from "@angular/material/slider";
import {TrackTotalDurationPipe} from "./pipes/track-total-duration.pipe";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {MainComponent} from './components/main/main.component';

@NgModule({
	declarations: [
		AppComponent,
		LoginViewComponent,
		RegisterViewComponent,
		MusicViewComponent,
		MusicUploadComponent,
		AlbumListComponent,
		TrackListComponent,
		AlbumViewComponent,
		DurationPipe,
		MusicPlayerComponent,
		PlaylistComponent,
		TopBarComponent,
		PlayProgressComponent,
		TrackDeleteDialog,
		AlbumDeleteDialog,
		SettingsMenuComponent,
		TrackTotalDurationPipe,
		MainComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
		MatTableModule,
		MatSortModule,
		MatMenuModule,
		MatIconModule,
		MatButtonModule,
		MatExpansionModule,
		MatToolbarModule,
		MatFormFieldModule,
		MatInputModule,
		ScrollingModule,
		MatProgressSpinnerModule,
		MatDialogModule,
		MatRadioModule,
		MatButtonToggleModule,
		MatTooltipModule,
		MatSliderModule,
		ClipboardModule
	],
	entryComponents: [TrackDeleteDialog],
	bootstrap: [AppComponent]
})
export class AppModule {
}
