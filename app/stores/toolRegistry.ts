import type { ZodType } from "zod";
import { toJSONSchema } from "zod/v4/core";

export interface ToolDefinition {
	name: string;
	description: string;
	parameters: ZodType;
	execute: (args: Record<string, unknown>) => Promise<unknown>;
	requiresApproval?: boolean;
}

export interface SerializedToolDefinition {
	name: string;
	description: string;
	inputSchema: Record<string, unknown>;
}

export const useToolRegistryStore = defineStore("tool-registry", () => {
	const tools = ref(new Map<string, ToolDefinition>());

	function registerTool(tool: ToolDefinition) {
		tools.value = new Map(tools.value).set(tool.name, tool);
	}

	function deregisterTool(name: string) {
		const next = new Map(tools.value);
		next.delete(name);
		tools.value = next;
	}

	const toolNames = computed(() => [...tools.value.keys()]);

	const toolSchemas = computed<SerializedToolDefinition[]>(() =>
		[...tools.value.values()].map((t) => ({
			name: t.name,
			description: t.description,
			inputSchema: toJSONSchema(toRaw(t.parameters)),
		})),
	);

	return {
		tools,
		toolNames,
		toolSchemas,
		registerTool,
		deregisterTool,
	};
});
