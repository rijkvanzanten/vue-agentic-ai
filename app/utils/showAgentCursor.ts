export interface AgentCursorOptions {
	click?: boolean;
}

interface Position {
	x: number;
	y: number;
}

let lastPosition: Position | null = null;
let currentAnimation: Animation | null = null;

const CURSOR_SVG = `<svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M19 1L19 20L13.5 14.5L8.5 23L5 21.5L10 12.5L2 12.5L19 1Z" fill="black" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const CLICK_RING_DURATION = 400;
const GLOW_STYLE_ID = "agent-cursor-glow-styles";

function ensureGlowStyles(): void {
	if (document.getElementById(GLOW_STYLE_ID)) return;
	const style = document.createElement("style");
	style.id = GLOW_STYLE_ID;
	style.textContent = `
		@keyframes agent-cursor-rainbow {
			0% { filter: drop-shadow(0 0 6px oklch(0.75 0.15 0)) drop-shadow(0 0 12px oklch(0.65 0.2 0)); }
			16% { filter: drop-shadow(0 0 6px oklch(0.75 0.15 60)) drop-shadow(0 0 12px oklch(0.65 0.2 60)); }
			33% { filter: drop-shadow(0 0 6px oklch(0.75 0.15 120)) drop-shadow(0 0 12px oklch(0.65 0.2 120)); }
			50% { filter: drop-shadow(0 0 6px oklch(0.75 0.15 180)) drop-shadow(0 0 12px oklch(0.65 0.2 180)); }
			66% { filter: drop-shadow(0 0 6px oklch(0.75 0.15 240)) drop-shadow(0 0 12px oklch(0.65 0.2 240)); }
			83% { filter: drop-shadow(0 0 6px oklch(0.75 0.15 300)) drop-shadow(0 0 12px oklch(0.65 0.2 300)); }
			100% { filter: drop-shadow(0 0 6px oklch(0.75 0.15 360)) drop-shadow(0 0 12px oklch(0.65 0.2 360)); }
		}
	`;
	document.head.appendChild(style);
}

function isInViewport(rect: DOMRect): boolean {
	return (
		rect.top < window.innerHeight &&
		rect.bottom > 0 &&
		rect.left < window.innerWidth &&
		rect.right > 0 &&
		rect.width > 0 &&
		rect.height > 0
	);
}

function createCursorElement(pos: Position): HTMLElement {
	ensureGlowStyles();
	const el = document.createElement("div");
	el.innerHTML = CURSOR_SVG;
	el.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		z-index: 9999;
		pointer-events: none;
		transform: translate(${pos.x}px, ${pos.y}px);
		will-change: transform;
		animation: agent-cursor-rainbow 2s linear infinite;
	`;
	return el;
}

function playClickRings(pos: Position): Promise<void> {
	const styleId = "agent-cursor-ring-styles";

	if (!document.getElementById(styleId)) {
		const style = document.createElement("style");
		style.id = styleId;
		style.textContent = `
			@keyframes agent-cursor-ring {
				0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
				100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
			}
		`;
		document.head.appendChild(style);
	}

	const rings: HTMLElement[] = [];
	const delays = [0, 100, 200];

	for (const delay of delays) {
		const ring = document.createElement("div");
		ring.style.cssText = `
			position: fixed;
			top: ${pos.y}px;
			left: ${pos.x}px;
			width: 40px;
			height: 40px;
			border-radius: 50%;
			border: 2px solid var(--ui-primary);
			pointer-events: none;
			z-index: 9999;
			animation: agent-cursor-ring ${CLICK_RING_DURATION}ms ${EASING} ${delay}ms both;
		`;
		document.body.appendChild(ring);
		rings.push(ring);
	}

	return new Promise((resolve) => {
		const totalDuration = CLICK_RING_DURATION + delays[delays.length - 1]!;
		setTimeout(() => {
			for (const ring of rings) {
				ring.remove();
			}
			resolve();
		}, totalDuration);
	});
}

export async function showAgentCursor(
	target: string,
	speed: number,
	options?: AgentCursorOptions,
): Promise<void> {
	const el = document.querySelector(target);
	if (!el) return;

	const rect = el.getBoundingClientRect();
	if (!isInViewport(rect)) return;

	if (currentAnimation) {
		currentAnimation.finish();
		currentAnimation = null;
	}

	const startPos: Position = lastPosition ?? {
		x: window.innerWidth / 2,
		y: window.innerHeight / 2,
	};

	const endPos: Position = {
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2,
	};

	const tipOffset: Position = { x: 19, y: 1 };
	const tipPos: Position = {
		x: endPos.x - tipOffset.x,
		y: endPos.y - tipOffset.y,
	};

	const cursor = createCursorElement(startPos);
	document.body.appendChild(cursor);

	if (speed > 0) {
		const animation = cursor.animate(
			[
				{ transform: `translate(${startPos.x}px, ${startPos.y}px)` },
				{ transform: `translate(${tipPos.x}px, ${tipPos.y}px)` },
			],
			{ duration: speed, easing: EASING, fill: "forwards" },
		);

		currentAnimation = animation;
		await animation.finished;
		currentAnimation = null;
	} else {
		cursor.style.transform = `translate(${tipPos.x}px, ${tipPos.y}px)`;
	}

	lastPosition = tipPos;

	if (options?.click) {
		await playClickRings(endPos);
	}

	cursor.remove();
}
