import type { CheckinLevel } from "@/lib/pwn";

export const CHECKIN_STORAGE_KEY = "pwn-shrine-checkins";

export type CheckinRecord = Record<string, CheckinLevel>;

export type CalendarCell = {
	date: string;
	day: number;
	inCurrentMonth: boolean;
	level: CheckinLevel;
};

export type MonthSummary = {
	activeDays: number;
	totalScore: number;
	averageScore: string;
};

export function formatMonthKey(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDateKey(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function parseCheckins(raw: string | null): CheckinRecord {
	if (!raw) return {};

	try {
		const parsed = JSON.parse(raw) as Record<string, number>;
		return Object.fromEntries(
			Object.entries(parsed).filter(
				([, value]) => Number.isInteger(value) && value >= 0 && value <= 4,
			),
		) as CheckinRecord;
	} catch {
		return {};
	}
}

export function readCheckins(): CheckinRecord {
	if (typeof localStorage === "undefined") return {};
	return parseCheckins(localStorage.getItem(CHECKIN_STORAGE_KEY));
}

export function writeCheckins(checkins: CheckinRecord) {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(checkins));
}

export function nextLevel(level: CheckinLevel): CheckinLevel {
	return ((level + 1) % 5) as CheckinLevel;
}

export function getMonthCells(
	viewDate: Date,
	checkins: CheckinRecord,
	startOfWeek = 1,
): CalendarCell[] {
	const year = viewDate.getFullYear();
	const month = viewDate.getMonth();
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);
	const leading = (firstDay.getDay() - startOfWeek + 7) % 7;
	const trailing = (startOfWeek + 6 - lastDay.getDay() + 7) % 7;

	const start = new Date(year, month, 1 - leading);
	const total = lastDay.getDate() + leading + trailing;

	return Array.from({ length: total }, (_, index) => {
		const current = new Date(start);
		current.setDate(start.getDate() + index);
		const key = formatDateKey(current);

		return {
			date: key,
			day: current.getDate(),
			inCurrentMonth: current.getMonth() === month,
			level: checkins[key] ?? 0,
		};
	});
}

export function getMonthSummary(
	viewDate: Date,
	checkins: CheckinRecord,
): MonthSummary {
	const year = viewDate.getFullYear();
	const month = viewDate.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	let activeDays = 0;
	let totalScore = 0;

	for (let day = 1; day <= daysInMonth; day++) {
		const key = formatDateKey(new Date(year, month, day));
		const level = checkins[key] ?? 0;
		if (level > 0) activeDays += 1;
		totalScore += level;
	}

	return {
		activeDays,
		totalScore,
		averageScore: (totalScore / daysInMonth).toFixed(1),
	};
}
