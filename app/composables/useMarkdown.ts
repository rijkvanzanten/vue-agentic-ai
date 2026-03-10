import { init, renderToHtml } from "md4x/wasm";

let ready = false;

const initPromise = init().then(() => {
	ready = true;
});

export function useMarkdown() {
	function render(markdown: string, streaming = false): string {
		if (!ready) return "";
		return renderToHtml(markdown, { heal: streaming });
	}

	return { render, ready: initPromise };
}
