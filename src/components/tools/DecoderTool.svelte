<script lang="ts">
import Icon from "@iconify/svelte";

type ToolMode = "xor" | "base";
type ByteFormat = "text" | "hex";
type BaseMode = "base16" | "base32" | "base58" | "base64" | "base64url";

type DecodeResult = {
	text: string;
	hex: string;
	error: string;
};

let activeTool: ToolMode = "xor";
let xorInput = "";
let xorKey = "";
let xorInputFormat: ByteFormat = "text";
let xorKeyFormat: ByteFormat = "text";
let baseInput = "";
let baseMode: BaseMode = "base64";

const baseModes: { id: BaseMode; label: string; hint: string }[] = [
	{ id: "base16", label: "Base16", hint: "Hex" },
	{ id: "base32", label: "Base32", hint: "RFC 4648" },
	{ id: "base58", label: "Base58", hint: "Bitcoin" },
	{ id: "base64", label: "Base64", hint: "Standard" },
	{ id: "base64url", label: "Base64URL", hint: "URL Safe" },
];

function textToBytes(value: string): number[] {
	return Array.from(new TextEncoder().encode(value));
}

function bytesToText(bytes: number[]): string {
	return new TextDecoder("utf-8", { fatal: false }).decode(Uint8Array.from(bytes));
}

function bytesToHex(bytes: number[]): string {
	return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
}

function hexToBytes(value: string): number[] {
	const normalized = value.replace(/0x/gi, "").replace(/[\s:_-]/g, "");
	if (!normalized) return [];
	if (normalized.length % 2 !== 0) {
		throw new Error("Hex 长度必须为偶数。");
	}
	if (!/^[0-9a-f]+$/i.test(normalized)) {
		throw new Error("Hex 输入只能包含 0-9 / a-f。");
	}
	const bytes: number[] = [];
	for (let index = 0; index < normalized.length; index += 2) {
		bytes.push(Number.parseInt(normalized.slice(index, index + 2), 16));
	}
	return bytes;
}

function readBytes(value: string, format: ByteFormat): number[] {
	return format === "hex" ? hexToBytes(value) : textToBytes(value);
}

function decodeXor(): DecodeResult {
	try {
		if (!xorInput) return { text: "", hex: "", error: "" };
		const inputBytes = readBytes(xorInput, xorInputFormat);
		const keyBytes = readBytes(xorKey, xorKeyFormat);
		if (keyBytes.length === 0) {
			return { text: "", hex: "", error: "请输入 XOR key。" };
		}
		const output = inputBytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]);
		return {
			text: bytesToText(output),
			hex: bytesToHex(output),
			error: "",
		};
	} catch (error) {
		return {
			text: "",
			hex: "",
			error: error instanceof Error ? error.message : "XOR 解码失败。",
		};
	}
}

function base64ToBytes(value: string, urlSafe = false): number[] {
	let normalized = value.replace(/\s/g, "");
	if (urlSafe) {
		normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
	}
	normalized = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
	const binary = atob(normalized);
	return Array.from(binary, (char) => char.charCodeAt(0));
}

function base32ToBytes(value: string): number[] {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
	const normalized = value.toUpperCase().replace(/[\s=]/g, "");
	let buffer = 0;
	let bits = 0;
	const output: number[] = [];

	for (const char of normalized) {
		const index = alphabet.indexOf(char);
		if (index < 0) {
			throw new Error("Base32 输入只能包含 A-Z 和 2-7。");
		}
		buffer = (buffer << 5) | index;
		bits += 5;
		if (bits >= 8) {
			bits -= 8;
			output.push((buffer >> bits) & 0xff);
		}
	}

	return output;
}

function base58ToBytes(value: string): number[] {
	const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
	const normalized = value.replace(/\s/g, "");
	let decoded = 0n;

	for (const char of normalized) {
		const index = alphabet.indexOf(char);
		if (index < 0) {
			throw new Error("Base58 输入包含非法字符。");
		}
		decoded = decoded * 58n + BigInt(index);
	}

	const bytes: number[] = [];
	while (decoded > 0n) {
		bytes.unshift(Number(decoded & 0xffn));
		decoded >>= 8n;
	}

	for (const char of normalized) {
		if (char !== "1") break;
		bytes.unshift(0);
	}

	return bytes;
}

function decodeBase(): DecodeResult {
	try {
		if (!baseInput) return { text: "", hex: "", error: "" };
		const output =
			baseMode === "base16"
				? hexToBytes(baseInput)
				: baseMode === "base32"
					? base32ToBytes(baseInput)
					: baseMode === "base58"
						? base58ToBytes(baseInput)
						: base64ToBytes(baseInput, baseMode === "base64url");
		return {
			text: bytesToText(output),
			hex: bytesToHex(output),
			error: "",
		};
	} catch (error) {
		return {
			text: "",
			hex: "",
			error: error instanceof Error ? error.message : "Base 解码失败。",
		};
	}
}

$: xorResult = decodeXor();
$: baseResult = decodeBase();
$: currentResult = activeTool === "xor" ? xorResult : baseResult;
</script>

<section class="mx-auto flex max-w-6xl flex-col gap-4">
	<div class="card-base overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] transition-[box-shadow,background-color] duration-150 ease-out dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
		<div class="border-b border-black/10 px-5 py-5 dark:border-white/10 md:px-6">
			<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div class="min-w-0">
					<div class="text-xs font-semibold uppercase tracking-[0.12em] text-30">Tools</div>
					<h1 class="mt-1 text-balance text-3xl font-bold text-90 md:text-4xl">Pwn 辅助工具</h1>
					<p class="mt-2 max-w-2xl text-pretty text-sm leading-6 text-50">
						轻量级本地解码器，适合题解过程中的快速验证。
					</p>
				</div>
				<div class="grid grid-cols-2 gap-2">
					<div class="rounded-lg bg-black/[0.025] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:bg-white/[0.03] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
						<div class="text-xs uppercase tracking-[0.08em] text-30">模块</div>
						<div class="mt-1 text-xl font-bold tabular-nums text-90">2</div>
					</div>
					<div class="rounded-lg bg-black/[0.025] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:bg-white/[0.03] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
						<div class="text-xs uppercase tracking-[0.08em] text-30">Base</div>
						<div class="mt-1 text-xl font-bold tabular-nums text-90">{baseModes.length}</div>
					</div>
				</div>
			</div>
		</div>

		<div class="border-b border-black/10 px-4 py-3 dark:border-white/10 md:px-5">
			<div class="flex w-full flex-wrap gap-2">
				<button
					type="button"
					class={`min-h-10 rounded-lg px-4 text-sm font-semibold transition-[background-color,box-shadow,scale] duration-150 ease-out active:scale-[0.96] ${
						activeTool === "xor"
							? "bg-[var(--primary)]/10 text-[var(--primary)] shadow-[0_0_0_1px_var(--primary)]"
							: "bg-black/[0.025] text-50 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] hover:bg-black/[0.04] dark:bg-white/[0.03] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] dark:hover:bg-white/[0.05]"
					}`}
					aria-pressed={activeTool === "xor"}
					on:click={() => (activeTool = "xor")}
				>
					XOR 解密
				</button>
				<button
					type="button"
					class={`min-h-10 rounded-lg px-4 text-sm font-semibold transition-[background-color,box-shadow,scale] duration-150 ease-out active:scale-[0.96] ${
						activeTool === "base"
							? "bg-[var(--primary)]/10 text-[var(--primary)] shadow-[0_0_0_1px_var(--primary)]"
							: "bg-black/[0.025] text-50 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] hover:bg-black/[0.04] dark:bg-white/[0.03] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] dark:hover:bg-white/[0.05]"
					}`}
					aria-pressed={activeTool === "base"}
					on:click={() => (activeTool = "base")}
				>
					常见 Base 解密
				</button>
			</div>
		</div>

		<div class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.85fr)]">
			<div class="min-w-0 border-b border-black/10 p-4 dark:border-white/10 md:p-5 lg:border-b-0 lg:border-r">
				{#if activeTool === "xor"}
					<div class="grid gap-4">
						<div class="grid gap-3 md:grid-cols-2">
							<label class="grid gap-2">
								<span class="text-xs font-semibold uppercase tracking-[0.12em] text-30">Input Format</span>
								<select
									bind:value={xorInputFormat}
									class="h-10 rounded-lg bg-black/[0.025] px-3 text-sm text-90 outline-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] transition-[background-color,box-shadow] duration-150 ease-out focus:shadow-[0_0_0_1px_var(--primary)] dark:bg-white/[0.03] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]"
								>
									<option value="text">Text</option>
									<option value="hex">Hex</option>
								</select>
							</label>
							<label class="grid gap-2">
								<span class="text-xs font-semibold uppercase tracking-[0.12em] text-30">Key Format</span>
								<select
									bind:value={xorKeyFormat}
									class="h-10 rounded-lg bg-black/[0.025] px-3 text-sm text-90 outline-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] transition-[background-color,box-shadow] duration-150 ease-out focus:shadow-[0_0_0_1px_var(--primary)] dark:bg-white/[0.03] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]"
								>
									<option value="text">Text</option>
									<option value="hex">Hex</option>
								</select>
							</label>
						</div>

						<label class="grid gap-2">
							<span class="text-xs font-semibold uppercase tracking-[0.12em] text-30">Ciphertext</span>
							<textarea
								bind:value={xorInput}
								spellcheck="false"
								placeholder="输入需要 XOR 的文本或 hex..."
								class="min-h-40 resize-y rounded-lg bg-black/[0.025] p-3 font-mono text-sm leading-6 text-90 outline-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] transition-[background-color,box-shadow] duration-150 ease-out placeholder:text-black/30 focus:shadow-[0_0_0_1px_var(--primary)] dark:bg-white/[0.03] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] dark:placeholder:text-white/30"
							></textarea>
						</label>

						<label class="grid gap-2">
							<span class="text-xs font-semibold uppercase tracking-[0.12em] text-30">XOR Key</span>
							<input
								bind:value={xorKey}
								spellcheck="false"
								placeholder="输入 key..."
								class="h-11 rounded-lg bg-black/[0.025] px-3 font-mono text-sm text-90 outline-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] transition-[background-color,box-shadow] duration-150 ease-out placeholder:text-black/30 focus:shadow-[0_0_0_1px_var(--primary)] dark:bg-white/[0.03] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] dark:placeholder:text-white/30"
							/>
						</label>
					</div>
				{:else}
					<div class="grid gap-4">
						<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
							{#each baseModes as mode}
								<button
									type="button"
									class={`min-h-14 rounded-lg px-3 text-left transition-[background-color,box-shadow,scale] duration-150 ease-out active:scale-[0.96] ${
										baseMode === mode.id
											? "bg-[var(--primary)]/10 text-[var(--primary)] shadow-[0_0_0_1px_var(--primary)]"
											: "bg-black/[0.025] text-50 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] hover:bg-black/[0.04] dark:bg-white/[0.03] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] dark:hover:bg-white/[0.05]"
									}`}
									aria-pressed={baseMode === mode.id}
									on:click={() => (baseMode = mode.id)}
								>
									<span class="block text-sm font-semibold">{mode.label}</span>
									<span class="mt-0.5 block text-xs text-30">{mode.hint}</span>
								</button>
							{/each}
						</div>

						<label class="grid gap-2">
							<span class="text-xs font-semibold uppercase tracking-[0.12em] text-30">Encoded Input</span>
							<textarea
								bind:value={baseInput}
								spellcheck="false"
								placeholder="输入 Base 编码内容..."
								class="min-h-64 resize-y rounded-lg bg-black/[0.025] p-3 font-mono text-sm leading-6 text-90 outline-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] transition-[background-color,box-shadow] duration-150 ease-out placeholder:text-black/30 focus:shadow-[0_0_0_1px_var(--primary)] dark:bg-white/[0.03] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] dark:placeholder:text-white/30"
							></textarea>
						</label>
					</div>
				{/if}
			</div>

			<div class="min-w-0 bg-black/[0.015] p-4 dark:bg-white/[0.02] md:p-5">
				<div class="mb-3 flex items-center justify-between gap-3">
					<div class="min-w-0">
						<div class="text-xs font-semibold uppercase tracking-[0.12em] text-30">Output</div>
						<h2 class="mt-1 text-balance text-xl font-bold text-90">解码结果</h2>
					</div>
					<Icon icon="material-symbols:output-rounded" class="shrink-0 text-[1.35rem] text-30" />
				</div>

				{#if currentResult.error}
					<div class="mb-3 rounded-lg bg-[oklch(0.70_0.10_0)]/10 p-3 text-sm font-medium leading-6 text-[oklch(0.45_0.14_20)] shadow-[inset_0_0_0_1px_rgba(190,18,60,0.18)] dark:bg-[oklch(0.70_0.10_0)]/15 dark:text-[oklch(0.82_0.10_20)]">
						{currentResult.error}
					</div>
				{/if}

				<label class="grid gap-2">
					<span class="text-xs font-semibold uppercase tracking-[0.12em] text-30">Text</span>
					<textarea
						readonly
						value={currentResult.text}
						spellcheck="false"
						placeholder="输出文本..."
						class="min-h-40 resize-y rounded-lg bg-[var(--codeblock-bg)] p-3 font-mono text-sm leading-6 text-white/80 outline-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] placeholder:text-white/30"
					></textarea>
				</label>

				<label class="mt-4 grid gap-2">
					<span class="text-xs font-semibold uppercase tracking-[0.12em] text-30">Hex</span>
					<textarea
						readonly
						value={currentResult.hex}
						spellcheck="false"
						placeholder="输出 hex..."
						class="min-h-28 resize-y rounded-lg bg-[var(--codeblock-bg)] p-3 font-mono text-sm leading-6 text-white/80 outline-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] placeholder:text-white/30"
					></textarea>
				</label>
			</div>
		</div>
	</div>
</section>
