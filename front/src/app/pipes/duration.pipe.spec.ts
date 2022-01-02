import {DurationPipe} from "./duration.pipe";

describe("Duration pipe", () => {
	let pipe;
	beforeEach(() => {
		pipe = new DurationPipe()
	})
	it("0.5 -> 00:00", () => {
		expect(pipe.transform(0.5)).toBe("00:00")
	})

	it("5 -> 00:05", () => {
		expect(pipe.transform(5)).toBe("00:05")
	})

	it("114 -> 01:54", () => {
		expect(pipe.transform(114)).toBe("01:54")
	})

	it("3600 -> 1:00:00", () => {
		expect(pipe.transform(3600)).toBe("1:00:00")
	})

	it("363714 -> 101:01:54", () => {
		expect(pipe.transform(363714)).toBe("101:01:54")
	})
})