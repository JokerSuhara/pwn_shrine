export const PWN_TYPES = [
	"stack",
	"heap",
	"fmt",
	"uaf",
	"race",
	"sandbox",
	"integer",
	"other",
] as const;

export const PWN_STATUSES = ["pending", "local", "remote", "archived"] as const;

export type PwnType = (typeof PWN_TYPES)[number];
export type PwnStatus = (typeof PWN_STATUSES)[number];

export type CheckinLevel = 0 | 1 | 2 | 3 | 4;

export const pwnTypeLabels: Record<PwnType, string> = {
	stack: "栈溢出",
	heap: "堆利用",
	fmt: "格式化字符串",
	uaf: "UAF",
	race: "竞争条件",
	sandbox: "沙箱逃逸",
	integer: "整数漏洞",
	other: "其他",
};

export const pwnStatusLabels: Record<PwnStatus, string> = {
	pending: "未开始",
	local: "本地通过",
	remote: "远程通过",
	archived: "已归档",
};

export const pwnStatusClasses: Record<PwnStatus, string> = {
	pending:
		"bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60 border-black/10 dark:border-white/10",
	local:
		"bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200 border-emerald-500/20 dark:border-emerald-300/20",
	remote:
		"bg-cyan-500/10 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-200 border-cyan-500/20 dark:border-cyan-300/20",
	archived:
		"bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200 border-amber-500/20 dark:border-amber-300/20",
};

export const checkinLevelLabels: Record<CheckinLevel, string> = {
	0: "未学习",
	1: "看资料",
	2: "本地调试",
	3: "打通题目",
	4: "总结沉淀",
};

export const checkinLevelClasses: Record<CheckinLevel, string> = {
	0: "bg-black/[0.04] dark:bg-white/[0.08]",
	1: "bg-emerald-200 dark:bg-emerald-950/80",
	2: "bg-emerald-300 dark:bg-emerald-800",
	3: "bg-emerald-500 dark:bg-emerald-600",
	4: "bg-emerald-700 dark:bg-emerald-400",
};

export function formatDifficulty(difficulty: number): string {
	return "★".repeat(difficulty) + "☆".repeat(Math.max(0, 5 - difficulty));
}
