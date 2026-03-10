import {
	streamText,
	convertToModelMessages,
	jsonSchema,
	stepCountIs,
	type UIMessage,
	tool,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

interface ClientToolDefinition {
	name: string;
	description: string;
	inputSchema: Record<string, unknown>;
}

export default defineLazyEventHandler(async () => {
	return defineEventHandler(async (event) => {
		const {
			messages,
			context,
			clientTools = [],
		} = await readBody<{
			messages: UIMessage[];
			context?: Record<string, unknown>;
			clientTools?: ClientToolDefinition[];
		}>(event);

		const systemPrompt = buildSystemPrompt(context);

		const clientToolDefinitions = Object.fromEntries(
			clientTools.map(
				(t) =>
					[
						t.name,
						tool({ description: t.description, inputSchema: jsonSchema(t.inputSchema) }),
					] as const,
			),
		);

		const result = streamText({
			model: anthropic("claude-sonnet-4-20250514"),
			system: systemPrompt,
			messages: await convertToModelMessages(messages),
			tools: {
				create_todo: tool({
					description:
						"Create a new todo item. Use this when the user asks you to add, create, or make a new todo.",
					inputSchema: z.object({
						title: z.string().describe("The title of the todo to create"),
					}),
					execute: async ({ title }) => {
						const todo = addTodo(title);
						return { status: "success", message: `Created todo: ${todo.title}`, todo };
					},
				}),
				toggle_todo: tool({
					description:
						"Toggle a todo's completion status. Use this to mark a todo as done/complete or to mark it as not done/incomplete.",
					inputSchema: z.object({
						id: z.string().describe("The ID of the todo to toggle"),
						title: z.string().describe("The title of the todo (for confirmation)"),
					}),
					execute: async ({ id }) => {
						const todo = toggleTodo(id);
						if (!todo) return { status: "error", message: "Todo not found" };
						return {
							status: "success",
							message: `${todo.completed ? "Completed" : "Uncompleted"}: ${todo.title}`,
							todo,
						};
					},
				}),
				list_todos: tool({
					description:
						"List all current todos with their titles and completion status. Use when the user asks what's on their list.",
					inputSchema: z.object({}),
					execute: async () => {
						const todos = listTodos();
						return {
							status: "success",
							todos: todos.map((t) => ({ id: t.id, title: t.title, completed: t.completed })),
						};
					},
				}),
				...clientToolDefinitions,
			},
			stopWhen: stepCountIs(5),
		});

		return result.toUIMessageStreamResponse();
	});
});

function buildSystemPrompt(context?: Record<string, unknown>): string {
	let prompt = `You are a helpful AI assistant embedded in a todo app. You can help users manage their todos and demonstrate how the UI works.

You have two modes of operation:
1. **Direct action**: Use create_todo, toggle_todo, delete_todo, list_todos to directly manage todos.
2. **UI demonstration**: Use open_create_dialog, type_text, click_save to visually walk the user through the UI step by step.

When the user asks you to "show" or "demonstrate" how to do something, use UI demonstration mode.
When the user asks you to do something directly (create, mark as done, delete), use direct action mode.

For delete_todo, always confirm with the user before proceeding — the client will show a confirmation prompt.

Be concise in your responses. After performing actions, briefly confirm what you did.`;

	if (context && Object.keys(context).length > 0) {
		prompt += `\n\nCurrent UI state:\n${JSON.stringify(context, null, 2)}`;
		prompt += `\n\nUse this context to make smart decisions. For example, if the dialog is already open, skip the open_create_dialog step. Only use UI-driving tools (type_text, click_save) if they appear in availableUITools — they are only available when the relevant UI component is mounted.`;
	}

	return prompt;
}
