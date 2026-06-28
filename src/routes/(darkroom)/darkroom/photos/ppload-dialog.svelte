<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { IconUpload, IconLoader2, IconX } from '@tabler/icons-svelte-runes';
	import ExifReader from 'exifreader';
	import type { PageData } from './$types';

	type Photo = PageData['photos'][number];

	let {
		open = $bindable(false),
		onUploadComplete
	}: { open: boolean; onUploadComplete: (photo: Photo) => void } = $props();

	interface ParsedExif {
		width: number;
		height: number;
		make?: string;
		model?: string;
		lens?: string;
		focalLength?: number;
		aperture?: string;
		iso?: number;
		shutterSpeed?: string;
		takenAt?: string;
	}

	interface FileEntry {
		id: string;
		file: File;
		preview: string;
		exif: ParsedExif;
		status: 'pending' | 'uploading' | 'done' | 'error';
		error?: string;
	}

	const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

	async function parseExif(file: File): Promise<ParsedExif> {
		const buffer = await file.arrayBuffer();
		let tags: ExifReader.Tags | null = null;
		try {
			tags = ExifReader.load(buffer);
		} catch {
			/* no EXIF or unsupported format */
		}
		if (!tags) {
			const bmp = await createImageBitmap(file);
			return {
				width: bmp.width,
				height: bmp.height
			};
		}

		let width = 0;
		let height = 0;
		const w = tags['PixelXDimension']?.value ?? tags['ImageWidth']?.value;
		const h = tags['PixelYDimension']?.value ?? tags['ImageLength']?.value;
		if (w && h) {
			width = typeof w === 'number' ? w : parseInt(String(w), 10);
			height = typeof h === 'number' ? h : parseInt(String(h), 10);
		}
		if (!width || !height) {
			const bmp = await createImageBitmap(file);
			width = bmp.width;
			height = bmp.height;
			bmp.close();
		}

		const focalDesc = tags['FocalLength']?.description;
		const focalMatch = focalDesc?.match(/(\d+(?:\.\d+)?)/);
		const focalLength = focalMatch ? Math.round(Number(focalMatch[1])) : undefined;

		const dtRaw = tags['DateTimeOriginal']?.description;
		let takenAt: string | undefined;
		if (dtRaw) {
			const normalized = dtRaw.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
			const d = new Date(normalized);
			if (!isNaN(d.getTime())) takenAt = d.toISOString();
		}

		const isoRaw = tags['ISOSpeedRatings']?.value;
		const iso = isoRaw != null ? parseInt(String(isoRaw), 10) || undefined : undefined;

		return {
			width,
			height,
			make: tags['Make']?.description,
			model: tags['Model']?.description,
			lens: tags['LensModel']?.description,
			focalLength,
			aperture: tags['FNumber']?.description,
			iso,
			shutterSpeed: tags['ExposureTime']?.description,
			takenAt
		};
	}

	let fileEntries = $state<FileEntry[]>([]);
	let uploading = $state(false);
	let dragOver = $state(false);
	let fileInput = $state<HTMLInputElement | undefined>();

	let pendingCount = $derived(fileEntries.filter((f) => f.status === 'pending').length);

	function setEntryStatus(id: string, status: FileEntry['status'], error?: string) {
		const idx = fileEntries.findIndex((f) => f.id === id);
		if (idx >= 0) {
			fileEntries[idx] = { ...fileEntries[idx], status, error };
		}
	}

	async function addFiles(list: FileList | File[]) {
		for (const file of Array.from(list)) {
			if (!ALLOWED_TYPES.includes(file.type)) continue;
			const preview = URL.createObjectURL(file);
			const exif = await parseExif(file);
			fileEntries = [
				...fileEntries,
				{ id: crypto.randomUUID(), file, preview, exif, status: 'pending' }
			];
		}
	}

	function removeEntry(id: string) {
		const entry = fileEntries.find((f) => f.id === id);
		if (entry) URL.revokeObjectURL(entry.preview);
		fileEntries = fileEntries.filter((f) => f.id !== id);
	}

	function retryEntry(id: string) {
		setEntryStatus(id, 'pending', undefined);
	}

	function closeUploadDialog() {
		if (uploading) return;
		fileEntries.forEach((f) => URL.revokeObjectURL(f.preview));
		fileEntries = [];
		open = false;
	}

	async function uploadAll() {
		uploading = true;

		for (const entry of [...fileEntries]) {
			if (entry.status !== 'pending') continue;
			setEntryStatus(entry.id, 'uploading');

			try {
				const fd = new FormData();
				fd.append('file', entry.file);
				fd.append('exif', JSON.stringify(entry.exif));

				const res = await fetch('/darkroom/photos', { method: 'POST', body: fd });
				if (res.ok) {
					const photo = (await res.json()) as Omit<Photo, 'tags'>;
					onUploadComplete({ ...photo, tags: [] } as Photo);
					setEntryStatus(entry.id, 'done');
				} else {
					const err = await res.json().catch(() => ({}));
					setEntryStatus(
						entry.id,
						'error',
						(err as { message?: string }).message ?? 'Upload failed'
					);
				}
			} catch {
				setEntryStatus(entry.id, 'error', 'Network error');
			}
		}

		uploading = false;

		if (fileEntries.every((f) => f.status === 'done')) {
			fileEntries.forEach((f) => URL.revokeObjectURL(f.preview));
			fileEntries = [];
			open = false;
		} else {
			fileEntries = fileEntries.filter((f) => f.status !== 'done');
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}
	function handleDragLeave() {
		dragOver = false;
	}
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
	}

	function exifSummary(exif: ParsedExif): string {
		return [
			exif.aperture,
			exif.shutterSpeed,
			exif.iso ? `ISO ${exif.iso}` : undefined,
			exif.focalLength ? `${exif.focalLength}mm` : undefined
		]
			.filter(Boolean)
			.join(' · ');
	}

	$effect(() => {
		if (!open && !uploading && fileEntries.length > 0) {
			fileEntries.forEach((f) => URL.revokeObjectURL(f.preview));
			fileEntries = [];
		}
	});
</script>

<Dialog.Root
	{open}
	onOpenChange={(v: boolean) => {
		if (!v) closeUploadDialog();
		else open = true;
	}}
>
	<Dialog.Content class="flex h-[90dvh] flex-col sm:h-auto sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Upload photos</Dialog.Title>
			<Dialog.Description>
				Drag & drop or click to select. EXIF metadata is read locally before upload.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-1 flex-col overflow-y-auto">
			{#if fileEntries.length === 0}
				<!-- Drop zone -->
				<div
					role="button"
					tabindex="0"
					class="flex h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors {dragOver
						? 'border-primary bg-primary/5'
						: 'border-border hover:border-primary/40 hover:bg-muted/30'}"
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					ondrop={handleDrop}
					onclick={() => fileInput?.click()}
					onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
				>
					<div class="flex size-11 items-center justify-center rounded-xl bg-muted/60">
						<IconUpload size={20} stroke={1.5} class="text-muted-foreground" />
					</div>
					<div class="text-center">
						<p class="text-sm font-medium text-foreground">Drop photos here</p>
						<p class="mt-0.5 text-xs text-muted-foreground">JPEG, PNG, WebP, AVIF · max 100 MB</p>
					</div>
				</div>
			{:else}
				<!-- File list -->
				<div class="max-h-[380px] space-y-2 overflow-y-auto pr-1">
					{#each fileEntries as entry (entry.id)}
						<div
							class="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2 {entry.status ===
							'error'
								? 'border-destructive/30 bg-destructive/5'
								: ''}"
						>
							<!-- Thumbnail -->
							<div class="size-14 shrink-0 overflow-hidden rounded-md bg-muted">
								<img src={entry.preview} alt="" class="size-full object-cover" />
							</div>

							<!-- Info -->
							<div class="min-w-0 flex-1 text-xs">
								<p class="truncate font-medium text-foreground">{entry.file.name}</p>
								<p class="text-muted-foreground">
									{entry.exif.width}×{entry.exif.height}{entry.exif.model
										? ` · ${entry.exif.model}`
										: ''}
								</p>
								{#if exifSummary(entry.exif)}
									<p class="text-muted-foreground/80">{exifSummary(entry.exif)}</p>
								{/if}
								{#if entry.error}
									<p class="text-destructive">{entry.error}</p>
								{/if}
							</div>

							<!-- Status / action -->
							<div class="shrink-0">
								{#if entry.status === 'uploading'}
									<IconLoader2 size={15} class="animate-spin text-muted-foreground" />
								{:else if entry.status === 'done'}
									<span class="text-[11px] text-green-600 dark:text-green-400">Done</span>
								{:else if entry.status === 'error'}
									<button
										onclick={() => retryEntry(entry.id)}
										class="text-[11px] text-destructive hover:underline"
									>
										Retry
									</button>
								{:else}
									<button
										onclick={() => removeEntry(entry.id)}
										disabled={uploading}
										aria-label="Remove"
										class="text-muted-foreground hover:text-foreground disabled:opacity-40"
									>
										<IconX size={14} />
									</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>

				{#if !uploading}
					<button
						onclick={() => fileInput?.click()}
						class="w-full rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/20"
					>
						+ Add more photos
					</button>
				{/if}
			{/if}
		</div>

		<!-- Hidden file input -->
		<input
			bind:this={fileInput}
			type="file"
			accept="image/jpeg,image/png,image/webp,image/avif"
			multiple
			class="hidden"
			onchange={(e) => e.currentTarget.files && addFiles(e.currentTarget.files)}
		/>

		<Dialog.Footer>
			<Button variant="outline" onclick={closeUploadDialog} disabled={uploading}>Cancel</Button>
			{#if fileEntries.length > 0}
				<Button onclick={uploadAll} disabled={uploading || pendingCount === 0}>
					{#if uploading}
						<IconLoader2 size={14} class="animate-spin" />
						Uploading…
					{:else}
						<IconUpload size={14} />
						Upload {pendingCount}
						{pendingCount === 1 ? 'photo' : 'photos'}
					{/if}
				</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
