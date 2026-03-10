<script setup lang="ts">
import { z } from "zod";

const { todos, filteredTodos, filter, toggleTodo, deleteTodo, updateTodoTitle, refresh } =
	useTodos();
const { setContext } = useUiContext();

defineTool({
	name: "delete_todo",
	description:
		"Delete a todo item. This is destructive and requires user confirmation. Use when the user explicitly asks to delete or remove a todo.",
	parameters: z.object({
		id: z.string().describe("The ID of the todo to delete"),
		title: z.string().describe("The title of the todo (for confirmation)"),
	}),
	requiresApproval: true,
	async execute(args) {
		const id = args.id as string;
		await showAgentCursor(`#delete-todo-${id}`, 800, { click: true });
		await deleteTodo(id);
		return { status: "success", message: `Deleted todo` };
	},
});

watch(
	[todos, filter],
	([allTodos, currentFilter]) => {
		setContext("todoCount", allTodos.length);
		setContext("activeTodoCount", allTodos.filter((t) => !t.completed).length);
		setContext("completedTodoCount", allTodos.filter((t) => t.completed).length);
		setContext("currentFilter", currentFilter);
	},
	{ immediate: true },
);

async function handleToggle(id: string) {
	await toggleTodo(id);
}

async function handleDelete(id: string) {
	await deleteTodo(id);
}

async function handleUpdateTitle(id: string, title: string) {
	await updateTodoTitle(id, title);
}
</script>

<template>
	<div class="space-y-1">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold">Todos</h2>
			<TodoFilters v-model="filter" />
		</div>

		<p v-if="filteredTodos.length === 0" class="text-muted text-sm py-4 text-center">
			No {{ filter === "all" ? "" : filter }} todos
		</p>

		<TodoItem
			v-for="todo in filteredTodos"
			:key="todo.id"
			:todo="todo"
			@toggle="handleToggle"
			@update-title="handleUpdateTitle"
			@delete="handleDelete"
		/>
	</div>
</template>
