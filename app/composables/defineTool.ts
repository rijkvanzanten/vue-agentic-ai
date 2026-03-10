import type { ToolDefinition } from "~/stores/toolRegistry";

/**
 * Register a tool tied to component lifecycle.
 * Registers on mount, deregisters on unmount.
 */
export function defineTool(toolDef: ToolDefinition) {
	const { registerTool, deregisterTool } = useToolRegistryStore();

	onMounted(() => {
		registerTool(toolDef);
	});

	onUnmounted(() => {
		deregisterTool(toolDef.name);
	});
}
