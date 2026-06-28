import { afterNavigate } from '$app/navigation';

class NavigationTracker {
	hasPreviousSession = $state(false);
	cameFromPhotoDetail = $state(false);

	init() {
		afterNavigate(({ from }) => {
			if (from) {
				this.hasPreviousSession = true;
			}
			this.cameFromPhotoDetail = from?.route?.id === '/photo/[id]';
		});
	}
}

export const navigationTracker = new NavigationTracker();
