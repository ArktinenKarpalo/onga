export default interface Track {
	id: number;
	name: string;
	artist: string;
	composer?: string;
	genre?: string;
	year?: string;
	duration?: string;
	track_num?: string;
	disc_num?: string;
	album_id: number;
	play_cnt: number;
	qualities: [{ quality: number, status: number }]
}