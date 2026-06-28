<script lang="ts">
	import { goto } from '$app/navigation';
	import { signUp } from './register.remote';
	import { createForm } from '@tanstack/svelte-form';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { IconAperture, IconAlertCircle, IconLoader2 } from '@tabler/icons-svelte-runes';

	let serverError = $state('');

	const form = createForm(() => ({
		defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
		onSubmit: async ({ value }) => {
			serverError = '';
			if (value.password !== value.confirmPassword) {
				serverError = 'Passwords do not match';
				return;
			}
			try {
				await signUp({ name: value.name, email: value.email, password: value.password });
				goto('/darkroom/photos');
			} catch (err) {
				serverError = err instanceof Error ? err.message : 'Registration failed';
			}
		}
	}));

	const isSubmitting = form.useStore((s) => s.isSubmitting);
</script>

<svelte:head>
	<title>Sign Up · Darkroom</title>
</svelte:head>

<div class="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-4">
	<!-- Subtle ambient background -->
	<div class="pointer-events-none absolute inset-0 select-none">
		<div
			class="absolute top-[-20%] left-[10%] h-160 w-160 rounded-full bg-primary/8 blur-[120px]"
		></div>
		<div
			class="absolute right-[5%] bottom-[-10%] h-120 w-120 rounded-full bg-primary/5 blur-[100px]"
		></div>
	</div>

	<div class="relative w-full max-w-88">
		<!-- Wordmark -->
		<div class="mb-10 flex flex-col items-center gap-3">
			<div
				class="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-xs"
			>
				<IconAperture size={22} stroke={1.5} />
			</div>
			<div class="text-center">
				<h1 class="text-lg font-semibold tracking-tight text-foreground">Darkroom</h1>
				<p class="mt-0.5 text-xs text-muted-foreground">Create your account</p>
			</div>
		</div>

		<!-- Form card -->
		<div class="rounded-2xl bg-linear-to-b from-border/70 to-border/20 p-px">
			<div class="rounded-2xl bg-card/90 p-6 backdrop-blur-md">
				{#if serverError}
					<div
						class="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5"
					>
						<IconAlertCircle size={15} class="mt-px shrink-0 text-destructive" stroke={2} />
						<p class="text-xs leading-relaxed text-destructive">{serverError}</p>
					</div>
				{/if}

				<form
					onsubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					class="flex flex-col gap-4"
				>
					<form.Field name="name">
						{#snippet children(field)}
							<div class="flex flex-col gap-1.5">
								<label class="text-xs font-medium text-foreground" for={field.name}>Name</label>
								<Input
									id={field.name}
									type="text"
									value={field.state.value}
									onchange={(e) => field.handleChange(e.currentTarget.value)}
									onblur={field.handleBlur}
									required
									autocomplete="name"
									placeholder="Your name"
									class="h-9 text-sm"
								/>
							</div>
						{/snippet}
					</form.Field>

					<form.Field name="email">
						{#snippet children(field)}
							<div class="flex flex-col gap-1.5">
								<label class="text-xs font-medium text-foreground" for={field.name}>Email</label>
								<Input
									id={field.name}
									type="email"
									value={field.state.value}
									onchange={(e) => field.handleChange(e.currentTarget.value)}
									onblur={field.handleBlur}
									required
									autocomplete="email"
									placeholder="your@email.com"
									class="h-9 text-sm"
								/>
							</div>
						{/snippet}
					</form.Field>

					<form.Field name="password">
						{#snippet children(field)}
							<div class="flex flex-col gap-1.5">
								<label class="text-xs font-medium text-foreground" for={field.name}>Password</label>
								<Input
									id={field.name}
									type="password"
									value={field.state.value}
									onchange={(e) => field.handleChange(e.currentTarget.value)}
									onblur={field.handleBlur}
									required
									autocomplete="new-password"
									placeholder="••••••••"
									class="h-9 text-sm"
								/>
							</div>
						{/snippet}
					</form.Field>

					<form.Field name="confirmPassword">
						{#snippet children(field)}
							<div class="flex flex-col gap-1.5">
								<label class="text-xs font-medium text-foreground" for={field.name}
									>Confirm password</label
								>
								<Input
									id={field.name}
									type="password"
									value={field.state.value}
									onchange={(e) => field.handleChange(e.currentTarget.value)}
									onblur={field.handleBlur}
									required
									autocomplete="new-password"
									placeholder="••••••••"
									class="h-9 text-sm"
								/>
							</div>
						{/snippet}
					</form.Field>

					<Button
						type="submit"
						disabled={isSubmitting.current}
						class="mt-1 h-9 w-full gap-2 text-xs font-medium"
					>
						{#if isSubmitting.current}
							<IconLoader2 size={14} class="animate-spin" stroke={2} />
							Creating account…
						{:else}
							Create account
						{/if}
					</Button>
				</form>
			</div>
		</div>

		<p class="mt-5 text-center text-xs text-muted-foreground">
			Already have an account?<a
				href="/login"
				class="ml-1 font-medium text-foreground underline-offset-4 transition-colors hover:underline"
				>Sign in</a
			>
		</p>
	</div>
</div>
