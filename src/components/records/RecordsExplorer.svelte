<script lang="ts">
import { getRecordUrlBySlug } from "@utils/url-utils";
import { onMount } from "svelte";
import {
	formatDifficulty,
	type PwnStatus,
	type PwnType,
	pwnStatusClasses,
	pwnStatusLabels,
	pwnTypeLabels,
} from "@/lib/pwn";

type RecordItem = {
	slug: string;
	title: string;
	description: string;
	published: string;
	type: PwnType;
	difficulty: number;
	status: PwnStatus;
	libc?: string;
	tags: string[];
	category?: string | null;
};

type RecordSectionId =
	| "stack"
	| "heap"
	| "kernel"
	| "iot"
	| "cve"
	| "vm"
	| "heterogeneous"
	| "web-pwn"
	| "awd";

type RecordSection = {
	id: RecordSectionId;
	display: string;
	abbr: string;
	description: string;
	keywords: string[];
};

export let records: RecordItem[] = [];
let initialTag = "";
let initialCategory = "";
let uncategorizedOnly = false;
let activeSection: RecordSectionId = "stack";

const sections: RecordSection[] = [
	{
		id: "stack",
		display: "栈-Stack",
		abbr: "STK",
		description: "栈迁移、ROP、ret2libc、栈溢出模型。",
		keywords: ["stack", "栈", "rop", "ret2", "canary", "srop"],
	},
	{
		id: "heap",
		display: "堆-Heap",
		abbr: "HEAP",
		description: "ptmalloc、tcache、UAF、堆风水与利用链。",
		keywords: ["heap", "堆", "uaf", "tcache", "fastbin", "unsorted", "glibc"],
	},
	{
		id: "kernel",
		display: "内核-Kernal",
		abbr: "KERN",
		description: "内核态漏洞、驱动、提权与隔离绕过。",
		keywords: ["kernel", "kernal", "内核", "driver", "lkm", "root"],
	},
	{
		id: "iot",
		display: "嵌入式-IoT",
		abbr: "IOT",
		description: "固件、路由器、设备侧二进制与环境复现。",
		keywords: ["iot", "嵌入式", "firmware", "router", "设备", "固件"],
	},
	{
		id: "cve",
		display: "漏洞-CVE",
		abbr: "CVE",
		description: "真实漏洞复现、补丁 diff 与利用路径整理。",
		keywords: ["cve", "漏洞", "diff", "patch", "n-day", "0day"],
	},
	{
		id: "vm",
		display: "虚拟机-VM",
		abbr: "VM",
		description: "QEMU、VMware、VirtualBox、虚拟化逃逸。",
		keywords: ["vm", "虚拟机", "qemu", "vmware", "virtualbox", "escape"],
	},
	{
		id: "heterogeneous",
		display: "异构-MIPS...",
		abbr: "ARCH",
		description: "MIPS、ARM、RISC-V 等异构架构题型。",
		keywords: ["mips", "arm", "aarch64", "riscv", "risc-v", "异构", "arch"],
	},
	{
		id: "web-pwn",
		display: "Web-Pwn",
		abbr: "WEB",
		description: "Web 与二进制交叉利用、服务侧联动场景。",
		keywords: ["web-pwn", "webpwn", "web", "cgi", "php", "node"],
	},
	{
		id: "awd",
		display: "AWD/AWDP",
		abbr: "AWD",
		description: "攻防赛补丁、流量分析、自动化与应急脚本。",
		keywords: ["awd", "awdp", "攻防", "defense", "patch", "流量"],
	},
];

function normalizedText(record: RecordItem): string {
	return [
		record.title,
		record.description,
		record.type,
		record.category ?? "",
		...(record.tags ?? []),
	]
		.join(" ")
		.toLowerCase();
}

function matchesSection(record: RecordItem, section: RecordSection): boolean {
	const text = normalizedText(record);
	if (section.id === "stack" && record.type === "stack") return true;
	if (section.id === "heap" && ["heap", "uaf"].includes(record.type)) return true;
	return section.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function matchesArchiveFilters(record: RecordItem) {
	if (initialTag && !record.tags.includes(initialTag)) return false;
	if (initialCategory && record.category !== initialCategory) return false;
	if (uncategorizedOnly && record.category) return false;
	return true;
}

onMount(() => {
	const params = new URLSearchParams(window.location.search);
	initialTag = params.get("tag") ?? "";
	initialCategory = params.get("category") ?? "";
	uncategorizedOnly = params.get("uncategorized") === "true";
	const section = params.get("section") as RecordSectionId | null;
	if (section && sections.some((item) => item.id === section)) {
		activeSection = section;
	}
});

$: filteredByArchive = records.filter(matchesArchiveFilters);
$: sectionCounts = Object.fromEntries(
	sections.map((section) => [
		section.id,
		filteredByArchive.filter((record) => matchesSection(record, section)).length,
	]),
) as Record<RecordSectionId, number>;
$: activeSectionConfig =
	sections.find((section) => section.id === activeSection) ?? sections[0];
$: visibleRecords = filteredByArchive.filter((record) =>
	matchesSection(record, activeSectionConfig),
);
$: totalCategorized = sections.reduce(
	(total, section) => total + sectionCounts[section.id],
	0,
);
</script>

<section class="mx-auto flex max-w-6xl flex-col gap-4">
	<div class="card-base overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] transition-[box-shadow,background-color] duration-150 ease-out dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
		<div class="border-b border-black/10 px-5 py-5 dark:border-white/10 md:px-6">
			<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div class="min-w-0">
					<div class="text-xs font-semibold uppercase tracking-[0.12em] text-30">Records</div>
					<h1 class="mt-1 text-balance text-3xl font-bold text-90 md:text-4xl">Pwn 笔记库</h1>
					<p class="mt-2 max-w-2xl text-pretty text-sm text-50">
						按学习方向拆分笔记板块，先建立索引结构，再逐步沉淀题解、模型和复盘。
					</p>
				</div>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
					<div class="rounded-lg bg-black/[0.025] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:bg-white/[0.03] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
						<div class="text-xs uppercase tracking-[0.08em] text-30">总数</div>
						<div class="mt-1 text-xl font-bold tabular-nums text-90">{filteredByArchive.length}</div>
					</div>
					<div class="rounded-lg bg-black/[0.025] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:bg-white/[0.03] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
						<div class="text-xs uppercase tracking-[0.08em] text-30">板块</div>
						<div class="mt-1 text-xl font-bold tabular-nums text-90">{sections.length}</div>
					</div>
					<div class="col-span-2 rounded-lg bg-black/[0.025] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:bg-white/[0.03] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] sm:col-span-1">
						<div class="text-xs uppercase tracking-[0.08em] text-30">已归类</div>
						<div class="mt-1 text-xl font-bold tabular-nums text-90">{totalCategorized}</div>
					</div>
				</div>
			</div>
		</div>

		<div
			class="p-4"
			style="display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));"
		>
			{#each sections as section}
				<button
					type="button"
					class={`group min-h-36 rounded-lg p-4 text-left transition-[background-color,box-shadow,scale] duration-150 ease-out active:scale-[0.96] ${
						activeSection === section.id
							? "bg-[var(--primary)]/10 shadow-[0_0_0_1px_var(--primary),0_1px_2px_-1px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_var(--primary)]"
							: "bg-black/[0.02] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] hover:bg-black/[0.035] dark:bg-white/[0.025] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] dark:hover:bg-white/[0.04]"
					}`}
					on:click={() => (activeSection = section.id)}
					aria-pressed={activeSection === section.id}
				>
					<div class="flex items-start justify-between gap-3">
						<div>
							<div class="text-xs font-semibold uppercase tracking-[0.1em] text-30">{section.abbr}</div>
							<h2 class="mt-1 text-balance text-xl font-bold text-90">{section.display}</h2>
						</div>
						<div class="rounded-full bg-black/[0.04] px-2.5 py-1 text-xs font-semibold tabular-nums text-50 dark:bg-white/[0.06]">
							{sectionCounts[section.id]}
						</div>
					</div>
					<p class="mt-3 text-pretty text-sm leading-6 text-50">{section.description}</p>
				</button>
			{/each}
		</div>
	</div>

	<div class="card-base overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
		<div class="flex flex-col gap-2 border-b border-black/10 px-5 py-4 dark:border-white/10 md:flex-row md:items-center md:justify-between md:px-6">
			<div>
				<div class="text-xs font-semibold uppercase tracking-[0.12em] text-30">Current Section</div>
				<h2 class="mt-1 text-balance text-2xl font-bold text-90">{activeSectionConfig.display}</h2>
			</div>
			<div class="rounded-full bg-black/[0.04] px-3 py-1.5 text-sm font-medium tabular-nums text-50 dark:bg-white/[0.06]">
				{visibleRecords.length} entries
			</div>
		</div>

		<div class="divide-y divide-black/10 dark:divide-white/10">
			{#if visibleRecords.length > 0}
				{#each visibleRecords as record}
					<a
						href={getRecordUrlBySlug(record.slug)}
						class="block px-5 py-4 transition-[background-color] duration-150 ease-out hover:bg-[var(--btn-card-bg-hover)] active:bg-[var(--btn-card-bg-active)] md:px-6"
					>
						<div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
							<div class="min-w-0">
								<h3 class="break-words text-xl font-bold text-90">{record.title}</h3>
								{#if record.description}
									<p class="mt-1 text-pretty text-sm leading-6 text-50">{record.description}</p>
								{/if}
							</div>
							<div class="shrink-0 text-sm tabular-nums text-30">{record.published}</div>
						</div>
						<div class="mt-3 flex flex-wrap gap-2">
							<span class="rounded-md bg-[var(--primary)]/10 px-3 py-1 text-sm font-medium text-[var(--primary)]">
								{pwnTypeLabels[record.type]}
							</span>
							<span class={`rounded-md border px-3 py-1 text-sm font-medium ${pwnStatusClasses[record.status]}`}>
								{pwnStatusLabels[record.status]}
							</span>
							<span class="rounded-md bg-black/[0.04] px-3 py-1 text-sm tabular-nums text-50 dark:bg-white/[0.08]">
								{formatDifficulty(record.difficulty)}
							</span>
							{#if record.libc}
								<span class="rounded-md bg-black/[0.04] px-3 py-1 text-sm text-50 dark:bg-white/[0.08]">
									libc {record.libc}
								</span>
							{/if}
						</div>
					</a>
				{/each}
			{:else}
				<div class="px-5 py-10 text-center md:px-6">
					<div class="mx-auto h-10 w-10 rounded-full bg-black/[0.04] dark:bg-white/[0.06]"></div>
					<div class="mt-3 text-lg font-semibold text-90">该板块暂未收录笔记</div>
					<p class="mx-auto mt-1 max-w-md text-pretty text-sm leading-6 text-50">
						板块结构已预留，后续添加对应标签、分类或题解后会自动出现在这里。
					</p>
				</div>
			{/if}
		</div>
	</div>
</section>
