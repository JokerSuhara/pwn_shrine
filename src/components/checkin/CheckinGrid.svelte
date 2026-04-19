<script lang="ts">
import { onMount } from "svelte";
import {
	type CheckinLevel,
	checkinLevelClasses,
	checkinLevelLabels,
} from "@/lib/pwn";
import {
	type CheckinRecord,
	formatMonthKey,
	getMonthCells,
	getMonthSummary,
	nextLevel,
	readCheckins,
	writeCheckins,
} from "./checkin-store";

const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

let viewDate = new Date();
let checkins: CheckinRecord = {};
let hydrated = false;

function shiftMonth(step: number) {
	viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + step, 1);
}

function updateLevel(dateKey: string, currentLevel: CheckinLevel) {
	checkins = {
		...checkins,
		[dateKey]: nextLevel(currentLevel),
	};
	writeCheckins(checkins);
}

onMount(() => {
	checkins = readCheckins();
	viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
	hydrated = true;
});

$: cells = getMonthCells(viewDate, checkins);
$: summary = getMonthSummary(viewDate, checkins);
$: monthLabel = formatMonthKey(viewDate);
</script>

<section class="card-base p-5 md:p-6">
	<div class="flex flex-col gap-5">
		<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div>
				<div class="text-sm uppercase tracking-[0.08em] text-50">Monthly Check-in</div>
				<h1 class="text-90 text-3xl md:text-4xl font-bold mt-2">{monthLabel}</h1>
				<p class="text-50 mt-2 max-w-2xl">
					Click a day to cycle through study depth from 0 to 4. Data is stored in
					your browser.
				</p>
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="btn-regular rounded-lg h-11 w-11 active:scale-95"
					on:click={() => shiftMonth(-1)}
					aria-label="Previous month"
				>
					←
				</button>
				<button
					type="button"
					class="btn-regular rounded-lg h-11 w-11 active:scale-95"
					on:click={() => shiftMonth(1)}
					aria-label="Next month"
				>
					→
				</button>
			</div>
		</div>

		<div class="grid grid-cols-7 gap-2 md:gap-3">
			{#each weekLabels as label}
				<div class="text-xs font-medium text-30 text-center uppercase tracking-[0.08em]">
					{label}
				</div>
			{/each}

			{#if hydrated}
				{#each cells as cell}
					<button
						type="button"
						class={`aspect-square rounded-md border border-black/5 dark:border-white/10 transition active:scale-95 ${checkinLevelClasses[cell.level]}`}
						class:opacity-40={!cell.inCurrentMonth}
						on:click={() => updateLevel(cell.date, cell.level)}
						aria-label={`${cell.date}: ${checkinLevelLabels[cell.level]}`}
						title={`${cell.date}: ${checkinLevelLabels[cell.level]}`}
					>
						<span class="text-xs md:text-sm font-medium text-black/70 dark:text-white/80">
							{cell.day}
						</span>
					</button>
				{/each}
			{/if}
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
			<div class="rounded-lg border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4">
				<div class="text-xs uppercase tracking-[0.08em] text-30">Active Days</div>
				<div class="text-2xl font-bold text-90 mt-2">{summary.activeDays}</div>
			</div>
			<div class="rounded-lg border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4">
				<div class="text-xs uppercase tracking-[0.08em] text-30">Depth Score</div>
				<div class="text-2xl font-bold text-90 mt-2">{summary.totalScore}</div>
			</div>
			<div class="rounded-lg border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4">
				<div class="text-xs uppercase tracking-[0.08em] text-30">Daily Average</div>
				<div class="text-2xl font-bold text-90 mt-2">{summary.averageScore}</div>
			</div>
		</div>

		<div class="flex flex-wrap gap-2">
			{#each [0, 1, 2, 3, 4] as level}
				<div class="flex items-center gap-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2">
					<div class={`h-3 w-3 rounded-sm ${checkinLevelClasses[level as CheckinLevel]}`}></div>
					<span class="text-sm text-50">{checkinLevelLabels[level as CheckinLevel]}</span>
				</div>
			{/each}
		</div>
	</div>
</section>
