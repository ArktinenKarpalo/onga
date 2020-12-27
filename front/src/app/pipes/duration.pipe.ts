import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
	name: "duration"
})
export class DurationPipe implements PipeTransform {

	transform(value: any, ...args: any[]): string {
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
		let formatted = input.toString();
		while(formatted.length < 2)
			formatted = "0" + input;
		return formatted;
	}
}
