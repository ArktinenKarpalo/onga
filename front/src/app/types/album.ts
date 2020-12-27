export default interface Album {
	id: number;
	name: string;
	artist: string;
	cover_path?: string;
	genre?: string;
	year?: string;
	last_played?: number
}