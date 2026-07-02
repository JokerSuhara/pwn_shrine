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

const weekLabels = ["一", "二", "三", "四", "五", "六", "日"];

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
$: calendarRows = Math.max(1, Math.ceil(cells.length / 7));
</script>

<section class="card-base mx-auto max-w-5xl p-4">
	<div class="flex flex-col gap-3">
		<div class="relative flex flex-col items-center gap-3 text-center md:min-h-10">
			<div class="w-full">
				<div class="text-sm uppercase tracking-[0.08em] text-50">本月打卡</div>
				<h1 class="text-90 mt-1.5 text-balance text-2xl font-bold tabular-nums md:text-3xl">{monthLabel}</h1>
			</div>
			<div class="flex items-center justify-center gap-2 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2">
				<button
					type="button"
					class="btn-regular h-10 w-10 rounded-lg transition-transform duration-150 ease-out active:scale-[0.96]"
					on:click={() => shiftMonth(-1)}
					aria-label="上个月"
				>
					←
				</button>
				<button
					type="button"
					class="btn-regular h-10 w-10 rounded-lg transition-transform duration-150 ease-out active:scale-[0.96]"
					on:click={() => shiftMonth(1)}
					aria-label="下个月"
				>
					→
				</button>
			</div>
		</div>

		<div class="flex flex-col gap-3">
			<div
				class="checkin-calendar mx-auto grid"
				style={`
					--checkin-rows: ${calendarRows};
					--checkin-gap: 0.5rem;
					--checkin-label-height: 1rem;
					--checkin-cell: min(
						calc((100vw - 7rem) / 7),
						calc((100dvh - 17.5rem - var(--checkin-label-height) - 3rem) / var(--checkin-rows)),
						5.75rem
					);
					gap: var(--checkin-gap);
					grid-template-columns: repeat(7, var(--checkin-cell));
				`}
			>
				{#each weekLabels as label}
					<div class="flex h-4 items-center justify-center text-xs font-medium uppercase tracking-[0.08em] text-30">
						{label}
					</div>
				{/each}

				{#if hydrated}
					{#each cells as cell}
						<button
							type="button"
							class={`flex aspect-square items-center justify-center rounded border border-black/5 transition-transform duration-150 ease-out active:scale-[0.96] dark:border-white/10 ${checkinLevelClasses[cell.level]}`}
							class:opacity-40={!cell.inCurrentMonth}
							on:click={() => updateLevel(cell.date, cell.level)}
							aria-label={`${cell.date}: ${checkinLevelLabels[cell.level]}`}
							title={`${cell.date}: ${checkinLevelLabels[cell.level]}`}
						>
							<span class="text-xs font-medium text-black/70 dark:text-white/80">
								{cell.day}
							</span>
						</button>
					{/each}
				{/if}
			</div>

			<div class="grid grid-cols-1 gap-2 md:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
				<div class="rounded-lg border border-black/5 bg-black/[0.02] p-2.5 dark:border-white/10 dark:bg-white/[0.03]">
					<div class="text-xs uppercase tracking-[0.08em] text-30">打卡天数</div>
					<div class="mt-1 text-lg font-bold tabular-nums text-90">{summary.activeDays}</div>
				</div>
				<div class="rounded-lg border border-black/5 bg-black/[0.02] p-2.5 dark:border-white/10 dark:bg-white/[0.03]">
					<div class="text-xs uppercase tracking-[0.08em] text-30">深度总分</div>
					<div class="mt-1 text-lg font-bold tabular-nums text-90">{summary.totalScore}</div>
				</div>
				<div class="rounded-lg border border-black/5 bg-black/[0.02] p-2.5 dark:border-white/10 dark:bg-white/[0.03]">
					<div class="text-xs uppercase tracking-[0.08em] text-30">日均深度</div>
					<div class="mt-1 text-lg font-bold tabular-nums text-90">{summary.averageScore}</div>
				</div>

				<div class="flex flex-wrap items-center gap-1.5 rounded-lg bg-black/[0.02] px-2.5 py-1 dark:bg-white/[0.03]">
					{#each [0, 1, 2, 3, 4] as level}
						<div class="flex items-center gap-2">
							<div class={`h-2.5 w-2.5 rounded-sm ${checkinLevelClasses[level as CheckinLevel]}`}></div>
							<span class="text-xs text-50">{checkinLevelLabels[level as CheckinLevel]}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
