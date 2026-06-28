<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { IconAperture, IconPhoto, IconTag } from '@tabler/icons-svelte-runes';

	let { children } = $props();

	const navLibrary = [{ href: '/darkroom/photos', label: 'Photos', icon: IconPhoto }];

	const navOrganize = [{ href: '/darkroom/tags', label: 'Tags', icon: IconTag }];

	function isActive(href: string): boolean {
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}
</script>

<Sidebar.Provider>
	<Sidebar.Root collapsible="icon">
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="lg" tooltipContent="Lensy">
						{#snippet child({ props })}
							<a href="/darkroom" {...props}>
								<div class="flex size-8 shrink-0 items-center justify-center rounded-lg">
									<IconAperture size={16} />
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-semibold tracking-tight">Lensy</span>
									<span class="truncate text-xs text-muted-foreground">Darkroom</span>
								</div>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>

		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Library</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each navLibrary as item (item.href)}
							{@const Icon = item.icon}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={isActive(item.href)} tooltipContent={item.label}>
									{#snippet child({ props })}
										<a href={item.href} {...props}>
											<Icon size={16} />
											<span>{item.label}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>

			<Sidebar.Group>
				<Sidebar.GroupLabel>Organize</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each navOrganize as item (item.href)}
							{@const Icon = item.icon}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={isActive(item.href)} tooltipContent={item.label}>
									{#snippet child({ props })}
										<a href={item.href} {...props}>
											<Icon size={16} />
											<span>{item.label}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>

		<Sidebar.Rail />
	</Sidebar.Root>

	<Sidebar.Inset>
		<header
			class="flex h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/95 px-4 backdrop-blur md:hidden"
		>
			<Sidebar.Trigger class="-ml-2" />
			<div class="flex items-center gap-2">
				<IconAperture size={16} />
				<span class="text-sm font-medium tracking-tight">Darkroom</span>
			</div>
		</header>
		<div class="flex flex-1 flex-col overflow-auto">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
