import { defineComponent } from 'vue';
import { mapStores } from 'pinia';

import { getMousePosition } from '@/utils/nodeViewUtils';
import { useUIStore } from '@/stores/ui.store';
import { useDeviceSupport } from 'n8n-design-system';

export const moveNodeWorkflow = defineComponent({
	data() {
		return {
			moveLastPosition: [0, 0],
		};
	},
	computed: {
		...mapStores(useUIStore),
	},
	methods: {
		moveWorkflow(e: MouseEvent) {
			const offsetPosition = this.uiStore.nodeViewOffsetPosition;

			const [x, y] = getMousePosition(e);

			const nodeViewOffsetPositionX = offsetPosition[0] + (x - this.moveLastPosition[0]);
			const nodeViewOffsetPositionY = offsetPosition[1] + (y - this.moveLastPosition[1]);
			this.uiStore.nodeViewOffsetPosition = [nodeViewOffsetPositionX, nodeViewOffsetPositionY];

			// Update the last position
			this.moveLastPosition[0] = x;
			this.moveLastPosition[1] = y;
		},
		mouseDownMoveWorkflow(e: MouseEvent, moveButtonPressed: boolean) {
			const deviceSupport = useDeviceSupport();

			if (!deviceSupport.isCtrlKeyPressed(e) && !moveButtonPressed) {
				// We only care about it when the ctrl key is pressed at the same time.
				// So we exit when it is not pressed.
				return;
			}

			if (this.uiStore.isActionActive('dragActive')) {
				// If a node does currently get dragged we do not activate the selection
				return;
			}

			// Prevent moving canvas on anything but middle button
			if (e.button !== 1) {
				this.uiStore.nodeViewMoveInProgress = true;
			}

			const [x, y] = getMousePosition(e);

			this.moveLastPosition[0] = x;
			this.moveLastPosition[1] = y;

			// @ts-ignore
			this.$el.addEventListener('mousemove', this.mouseMoveNodeWorkflow);
		},
		mouseUpMoveWorkflow(e: MouseEvent) {
			if (!this.uiStore.nodeViewMoveInProgress) {
				// If it is not active return directly.
				// Else normal node dragging will not work.
				return;
			}

			// @ts-ignore
			this.$el.removeEventListener('mousemove', this.mouseMoveNodeWorkflow);

			this.uiStore.nodeViewMoveInProgress = false;

			// Nothing else to do. Simply leave the node view at the current offset
		},
		mouseMoveNodeWorkflow(e: MouseEvent) {
			// @ts-ignore
			if (e.target && !e.target.id.includes('node-view')) {
				return;
			}

			if (this.uiStore.isActionActive('dragActive')) {
				return;
			}

			// Signal that moving canvas is active if middle button is pressed and mouse is moved
			if (e.buttons === 4) {
				this.uiStore.nodeViewMoveInProgress = true;
			}

			if (e.buttons === 0) {
				// Mouse button is not pressed anymore so stop selection mode
				// Happens normally when mouse leave the view pressed and then
				// comes back unpressed.
				// @ts-ignore
				this.mouseUp(e);
				return;
			}

			this.moveWorkflow(e);
		},
	},
});
