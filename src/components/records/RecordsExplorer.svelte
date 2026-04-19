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

export let records: RecordItem[] = [];
let initialTag = "";
let initialCategory = "";
let uncategorizedOnly = false;

let activeType: PwnType | "" = "";

const allTypes = Object.keys(pwnTypeLabels) as PwnType[];

function toggleType(nextType: PwnType) {
	activeType = activeType === nextType ? "" : nextType;
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
});

$: filteredByArchive = records.filter(matchesArchiveFilters);
$: visibleRecords = activeType
	? filteredByArchive.filter((record) => record.type === activeType)
	: filteredByArchive;
$: typeCounts = allTypes.map((type) => ({
	type,
	count: filteredByArchive.filter((record) => record.type === type).length,
}));
</script>

<section class="flex flex-col gap-4">
	<div class="card-base p-5 md:p-6">
		<div class="flex flex-col gap-4">
			<div>
				<div class="text-sm uppercase tracking-[0.08em] text-50">Records</div>
				<h1 class="text-90 text-3xl md:text-4xl font-bold mt-2">Pwn Notes Library</h1>
				<p class="text-50 mt-2">
					Browse writeups by type, keep the metadata consistent, and make review
					fast.
				</p>
			</div>
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
				<div class="rounded-lg border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4">
					<div class="text-xs uppercase tracking-[0.08em] text-30">Total</div>
					<div class="text-2xl font-bold text-90 mt-2">{filteredByArchive.length}</div>
				</div>
				{#each typeCounts.slice(0, 3) as item}
					<div class="rounded-lg border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4">
						<div class="text-xs uppercase tracking-[0.08em] text-30">
							{pwnTypeLabels[item.type]}
						</div>
						<div class="text-2xl font-bold text-90 mt-2">{item.count}</div>
					</div>
				{/each}
			</div>
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					class={`rounded-lg px-4 py-2 text-sm font-medium transition border ${
						activeType === ""
							? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
							: "border-black/10 dark:border-white/10 text-50 hover:text-[var(--primary)]"
					}`}
					on:click={() => (activeType = "")}
				>
					All
				</button>
				{#each typeCounts as item}
					<button
						type="button"
						class={`rounded-lg px-4 py-2 text-sm font-medium transition border ${
							activeType === item.type
								? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
								: "border-black/10 dark:border-white/10 text-50 hover:text-[var(--primary)]"
						}`}
						on:click={() => toggleType(item.type)}
					>
						{pwnTypeLabels[item.type]} <span class="text-30">({item.count})</span>
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-4">
		{#if visibleRecords.length > 0}
			{#each visibleRecords as record}
				<a
					href={getRecordUrlBySlug(record.slug)}
					class="card-base block p-5 md:p-6 hover:bg-[var(--btn-card-bg-hover)] active:bg-[var(--btn-card-bg-active)]"
				>
					<div class="flex flex-col gap-4">
						<div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
							<div class="min-w-0">
								<h2 class="text-90 text-2xl font-bold break-words">{record.title}</h2>
								<p class="text-50 mt-2">{record.description}</p>
							</div>
							<div class="shrink-0 text-sm text-30">{record.published}</div>
						</div>
						<div class="flex flex-wrap gap-2">
							<span class="rounded-md bg-[var(--primary)]/10 px-3 py-1 text-sm font-medium text-[var(--primary)]">
								{pwnTypeLabels[record.type]}
							</span>
							<span class="rounded-md border px-3 py-1 text-sm font-medium {pwnStatusClasses[record.status]}">
								{pwnStatusLabels[record.status]}
							</span>
							<span class="rounded-md bg-black/[0.04] dark:bg-white/[0.08] px-3 py-1 text-sm text-50">
								{formatDifficulty(record.difficulty)}
							</span>
							{#if record.libc}
								<span class="rounded-md bg-black/[0.04] dark:bg-white/[0.08] px-3 py-1 text-sm text-50">
									libc {record.libc}
								</span>
							{/if}
						</div>
					</div>
				</a>
			{/each}
		{:else}
			<div class="card-base p-6 text-50">No records match the current filter.</div>
		{/if}
	</div>
</section>
