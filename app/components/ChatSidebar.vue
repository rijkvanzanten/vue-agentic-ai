<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";

const emit = defineEmits<{
	close: [];
}>();

const { context: uiContext } = useUiContext();
const { render: renderMarkdown } = useMarkdown();
const toolRegistry = useToolRegistryStore();
const { tools, toolNames, toolSchemas } = storeToRefs(toolRegistry);
const { refresh: refreshTodos } = useTodos();

const input = ref("");

const pendingApprovals = reactive(
	new Map<
		string,
		{
			toolName: string;
			args: Record<string, unknown>;
			resolve: (value: unknown) => void;
		}
	>(),
);

const chat = new Chat({
	transport: new DefaultChatTransport({
		api: "/api/chat",
		body: () => ({
			context: {
				...uiContext.value,
				availableUITools: toolNames.value,
			},
			clientTools: toolSchemas.value,
		}),
	}),
	async onToolCall({ toolCall }) {
		const output = await handleToolCall(
			toolCall.toolName,
			toolCall.toolCallId,
			toolCall.input as Record<string, unknown>,
		);

		chat.addToolOutput({
			toolCallId: toolCall.toolCallId,
			output,
		});
	},
	onError(error) {
		console.error("Chat error:", error);
	},
	onFinish() {
		refreshTodos();
	},
	sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
});

async function handleToolCall(
	toolName: string,
	toolCallId: string,
	args: Record<string, unknown>,
): Promise<unknown> {
	const tool = tools.value.get(toolName);
	if (!tool) return { status: "error", message: `Unknown tool: ${toolName}` };

	if (tool.requiresApproval) {
		return new Promise<unknown>((resolve) => {
			pendingApprovals.set(toolCallId, { toolName, args, resolve });
		});
	}

	return await tool.execute(args);
}

async function handleApproval(toolCallId: string, approved: boolean) {
	const pending = pendingApprovals.get(toolCallId);
	if (!pending) return;

	pendingApprovals.delete(toolCallId);

	let output: unknown;

	if (approved) {
		const tool = tools.value.get(pending.toolName);
		if (tool) {
			output = await tool.execute(pending.args);
			refreshTodos();
		} else {
			output = { status: "error", message: `Unknown tool: ${pending.toolName}` };
		}
	} else {
		output = { status: "error", message: "User declined" };
	}

	pending.resolve(output);
}

function onSubmit() {
	const text = input.value.trim();
	if (!text) return;
	input.value = "";

	chat.clearError();
	chat.sendMessage({ text });
}

function isMessageStreaming(message: { id: string }): boolean {
	const status = chat.status;
	if (status !== "streaming") return false;
	const messages = chat.messages;
	const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
	return lastAssistant?.id === message.id;
}
</script>

<template>
	<UDashboardPanel id="chat" class="w-96" :default-size="30">
		<template #header>
			<div class="flex items-center justify-between w-full px-4 py-4">
				<h2 class="font-semibold">AI Chat</h2>
				<UButton
					icon="i-lucide-x"
					color="neutral"
					variant="ghost"
					size="xs"
					@click="emit('close')"
				/>
			</div>
		</template>

		<template #body>
			<UChatMessages :messages="chat.messages" :status="chat.status" should-auto-scroll>
				<template #content="{ message }">
					<template
						v-for="(part, index) in message.parts"
						:key="`${message.id}-${part.type}-${index}`"
					>
						<div
							v-if="part.type === 'text' && message.role === 'assistant'"
							class="prose prose-sm *:first:mt-0 *:last:mb-0 mt-2"
							v-html="renderMarkdown(part.text, isMessageStreaming(message))"
						/>
						<p v-else-if="part.type === 'text'" class="whitespace-pre-wrap">{{ part.text }}</p>

						<div
							v-else-if="
								part.type.startsWith('tool-') &&
								'toolCallId' in part &&
								pendingApprovals.has(part.toolCallId as string)
							"
							class="my-2"
						>
							<ToolApproval
								:tool-name="(part as any).toolName"
								:args="((part as any).input ?? {}) as Record<string, unknown>"
								@approve="handleApproval(part.toolCallId as string, true)"
								@decline="handleApproval(part.toolCallId as string, false)"
							/>
						</div>
					</template>
				</template>
			</UChatMessages>
		</template>

		<template #footer>
			<div class="p-4">
				<UChatPrompt
					v-model="input"
					:error="chat.error"
					placeholder="Ask the AI..."
					@submit="onSubmit"
				>
					<UChatPromptSubmit
						:status="chat.status"
						@stop="chat.stop()"
						@reload="chat.regenerate()"
					/>
				</UChatPrompt>
			</div>
		</template>
	</UDashboardPanel>
</template>
