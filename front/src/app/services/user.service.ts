import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import Cookies from "js-cookie"
import {BehaviorSubject} from "rxjs";
import Album from "../types/album";
import Track from "../types/track";

@Injectable({
	providedIn: "root"
})

export class UserService {
	selected_quality = Cookies.get("quality") || 1;
	albums = new BehaviorSubject<Array<Album>>([]);
	tracks = new BehaviorSubject<Array<Track>>([]);
	albums_loaded = false;
	should_refresh = false;

	constructor(private http: HttpClient, private router: Router) {
		this.getData();
	}

	setQuality(quality: "1" | "2" | undefined) {
		if(quality) {
			this.selected_quality = Number.parseInt(quality);
			Cookies.set("quality", this.selected_quality, {expires: (1 << 16)});
		}
	}

	getData() {
		this.should_refresh = false;
		if(Cookies.get("session") == undefined && !window.location.href.endsWith("/register")) {
			this.router.navigate(["login"]);
			return;
		}

		this.http.get("api/music/albums", {headers: new HttpHeaders({Authorization: Cookies.get("session")})}).subscribe((response) => {
			this.albums_loaded = true;
			// @ts-ignore
			this.albums.next(response);

		}, (error) => {
			if(error.error instanceof ErrorEvent) {
				console.error("Error: " + error.error.message);
			} else {
				if(error.status == 403) {
					this.router.navigate(["login"]);
				} else {
					console.error("Returned " + error.status);
					console.error(error);
				}
			}
		})

		this.http.get("api/music/tracks", {headers: new HttpHeaders({Authorization: Cookies.get("session")})}).subscribe((response) => {
			// @ts-ignore
			this.tracks.next(response);
		}, (error) => {
			if(error.error instanceof ErrorEvent) {
				console.error("Error: " + error.error.message);
			} else {
				if(error.status == 403) {
					this.router.navigate(["login"]);
				} else {
					console.error("Returned " + error.status);
					console.error(error);
				}
			}
		})
	}

	async delete_track(track: Track) {
		this.http.delete("api/music/track/" + track.id,
			{headers: new HttpHeaders({Authorization: Cookies.get("session")})})
			.subscribe((response: any) => {
				this.tracks.next(this.tracks.getValue().filter((tr: Track) => {
					return (tr != track);
				}));
			}, error => {
				console.error(error);
			});
	}

	async delete_album(album: Album) {
		this.http.delete("api/music/album/" + album.id,
			{headers: new HttpHeaders({Authorization: Cookies.get("session")})})
			.subscribe((response: any) => {
				this.albums.next(this.albums.getValue().filter((al: Album) => {
					return (al != album);
				}));
			}, error => {
				console.error(error);
			});
	}

	async track_played(track: Track) {
		track.play_cnt++;
		this.http.post("api/music/track/" + track.id + "/played", {},
			{headers: new HttpHeaders({Authorization: Cookies.get("session")})})
			.toPromise().catch(err => console.error(err));
	}

	async album_played(album: Album) {
		const albums = this.albums.getValue();
		this.albums.getValue().find(al => al.id == album.id)
			.last_played = new Date().getTime();
		this.albums.next(albums);
		this.http.post("api/music/album/" + album.id + "/played", {},
			{headers: new HttpHeaders({Authorization: Cookies.get("session")})})
			.toPromise().catch(err => console.error(err));
	}

	// Resolves with string with error message that should be shown to user
	async login(username: string, password: string) {
		return new Promise<void | string>((res) => {
			this.http.post("api/auth/login", {username, password}, {headers: {csrf: ""}}).subscribe((response: any) => {
				if(response.status === "OK") {
					this.getData();
					this.router.navigate([""]);
					res();
				} else {
					res("Error: " + response.status);
				}
			}, (error) => {
				res("Error " + error.status);
			});
		});

	}

	logout() {
		this.http.post("api/auth/logout", {}, {headers: new HttpHeaders({Authorization: Cookies.get("session")})}).subscribe(() => {
			this.albums.next([]);
			this.tracks.next([]);
			this.router.navigate(["login"]);
		}, (error) => {
			if(error.error instanceof ErrorEvent) {
				console.error("Error: " + error.statuerror.error.message);
			} else {
				console.error("While attempting to log out, received: " + error.status);
				console.error(error);
			}
		})
	}
}
