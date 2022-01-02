import {Pipe, PipeTransform} from "@angular/core";

/**
 * Transform duration given as seconds to mm:ss or hh:mm:ss if hh > 0
 */
@Pipe({
	name: "duration"
})
export class DurationPipe implements PipeTransform {

	transform(value: any): string {
		let duration = Math.floor(Number.parseFloat(value));
		let duration_formatted = this.two_digits((duration % 60)); // seconds
		duration = Math.floor(duration / 60);
		duration_formatted = this.two_digits(duration % 60) + ":" + duration_formatted; // minutes
		duration = Math.floor(duration / 60);
		if(duration > 0)
			duration_formatted = duration + ":" + duration_formatted; // hours
		return duration_formatted;
	}

	two_digits(input: number): string {
		return input.toString().padStart(2, "0")
	}
}
