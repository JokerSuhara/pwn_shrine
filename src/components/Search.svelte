<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { getRecordUrlBySlug, url } from "@utils/url-utils.ts";
import { onMount } from "svelte";
import type { SearchResult } from "@/global";

export let standalone = false;

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let isSearching = false;
let pagefindLoaded = false;
let initialized = false;

$: panelId = standalone ? "search-page-panel" : "search-panel";
$: barId = standalone ? "search-page-bar" : "search-bar";

const fakeResult: SearchResult[] = [
	{
		url: getRecordUrlBySlug("demo-chall-pwn100"),
		meta: {
			title: "babyheap：从 unsorted bin 到 __free_hook",
		},
		excerpt:
			"开发模式下搜索使用模拟数据。构建站点后可测试真实的 Pagefind 搜索。",
	},
	{
		url: url("/records/"),
		meta: {
			title: "浏览笔记页",
		},
		excerpt: "按漏洞类型筛选笔记，并在列表中查看题目元数据。",
	},
];

const togglePanel = () => {
	const panel = document.getElementById(panelId);
	panel?.classList.toggle("float-panel-closed");
};

const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
	const panel = document.getElementById(panelId);
	if (!panel || !isDesktop) return;

	if (show) {
		panel.classList.remove("float-panel-closed");
	} else {
		panel.classList.add("float-panel-closed");
	}
};

const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
	if (!keyword) {
		setPanelVisibility(false, isDesktop);
		result = [];
		return;
	}

	if (!initialized) {
		return;
	}

	isSearching = true;

	try {
		let searchResults: SearchResult[] = [];

		if (import.meta.env.PROD && pagefindLoaded && window.pagefind) {
			const response = await window.pagefind.search(keyword);
			searchResults = await Promise.all(
				response.results.map((item) => item.data()),
			);
		} else if (import.meta.env.DEV) {
			searchResults = fakeResult;
		} else {
			searchResults = [];
			console.error("生产环境中未加载 Pagefind。");
		}

		result = searchResults;
		setPanelVisibility(result.length > 0, isDesktop);
	} catch (error) {
		console.error("搜索出错:", error);
		result = [];
		setPanelVisibility(false, isDesktop);
	} finally {
		isSearching = false;
	}
};

onMount(() => {
	const initializeSearch = () => {
		initialized = true;
		pagefindLoaded =
			typeof window !== "undefined" &&
			!!window.pagefind &&
			typeof window.pagefind.search === "function";
		console.log("Pagefind 初始化状态:", pagefindLoaded);
		if (keywordDesktop) search(keywordDesktop, true);
		if (keywordMobile) search(keywordMobile, false);
	};

	if (import.meta.env.DEV) {
		console.log("开发模式下 Pagefind 不可用，使用模拟数据。");
		initializeSearch();
	} else {
		document.addEventListener("pagefindready", () => {
			console.log("已收到 Pagefind ready 事件。");
			initializeSearch();
		});
		document.addEventListener("pagefindloaderror", () => {
			console.warn("已收到 Pagefind 加载失败事件，搜索能力将受限。");
			initializeSearch();
		});

		// 兜底逻辑：事件未触发或脚本执行时 Pagefind 已加载
		setTimeout(() => {
			if (!initialized) {
				console.log("兜底初始化：超时后启动搜索。");
				initializeSearch();
			}
		}, 2000);
	}
});

$: if (initialized && keywordDesktop) {
	(async () => {
		await search(keywordDesktop, true);
	})();
}

$: if (initialized && keywordMobile) {
	(async () => {
		await search(keywordMobile, false);
	})();
}
</script>

<div
	id={barId}
	class:hidden={standalone}
	class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10"
>
	<Icon
		icon="material-symbols:search"
		class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"
	/>
	<input
		placeholder={i18n(I18nKey.search)}
		bind:value={keywordDesktop}
		on:focus={() => search(keywordDesktop, true)}
		class="transition-all pl-10 text-sm bg-transparent outline-0
         h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
	/>
</div>

<button
	on:click={togglePanel}
	aria-label="搜索面板"
	id="search-switch"
	class:hidden={standalone}
	class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90"
>
	<Icon icon="material-symbols:search" class="text-[1.25rem]" />
</button>

<div
	id={panelId}
	class:float-panel-closed={!standalone}
	class={`search-panel ${
		standalone
			? "card-base relative w-full p-5 md:p-6"
			: "float-panel absolute md:w-[30rem] top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2"
	}`}
>
	{#if standalone}
		<div class="mb-5">
			<div class="text-sm uppercase tracking-[0.08em] text-50">搜索</div>
			<h1 class="text-90 text-3xl md:text-4xl font-bold mt-2">搜索笔记</h1>
		</div>
	{/if}

	<div
		id={standalone ? "search-page-bar-inside" : "search-bar-inside"}
		class={`flex relative transition-all items-center h-11 rounded-xl bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06] dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10 ${
			standalone ? "" : "lg:hidden"
		}`}
	>
		<Icon
			icon="material-symbols:search"
			class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"
		/>
		{#if standalone}
			<input
				placeholder={i18n(I18nKey.search)}
				bind:value={keywordDesktop}
				class="pl-10 absolute inset-0 text-sm bg-transparent outline-0 focus:w-60 text-black/50 dark:text-white/50"
			/>
		{:else}
			<input
				placeholder={i18n(I18nKey.search)}
				bind:value={keywordMobile}
				class="pl-10 absolute inset-0 text-sm bg-transparent outline-0 focus:w-60 text-black/50 dark:text-white/50"
			/>
		{/if}
	</div>

	{#if standalone && keywordDesktop && !isSearching && result.length === 0}
		<div class="mt-4 text-50">没有匹配的笔记。</div>
	{/if}
	{#each result as item}
		<a
			href={item.url}
			class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
       rounded-xl text-lg px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]"
		>
			<div class="transition text-90 inline-flex font-bold group-hover:text-[var(--primary)]">
				{item.meta.title}<Icon
					icon="fa6-solid:chevron-right"
					class="transition text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]"
				/>
			</div>
			<div class="transition text-sm text-50">
				{@html item.excerpt}
			</div>
		</a>
	{/each}
</div>

<style>
	input:focus {
		outline: 0;
	}
	.search-panel {
		max-height: calc(100vh - 100px);
		overflow-y: auto;
	}
</style>
