import {Pipe, PipeTransform} from "@angular/core";
import Track from "../types/track";

@Pipe({
	name: "trackTotalDuration"
})
export class TrackTotalDurationPipe implements PipeTransform {

	transform(value: Track[], ...args: unknown[]): number {
		return value.reduce((p, c) => p + Number.parseInt(c.duration), 0);
	}
}
