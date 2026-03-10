export interface Todo {
	id: string;
	title: string;
	completed: boolean;
}

export type TodoFilter = "all" | "active" | "completed";

const filter = ref<TodoFilter>("all");
const todos = ref<Todo[]>([]);

let initialized = false;

async function fetchTodos() {
	todos.value = await $fetch<Todo[]>("/api/todos");
}

export function useTodos() {
	if (!initialized) {
		initialized = true;
		fetchTodos();
	}

	const filteredTodos = computed(() => {
		switch (filter.value) {
			case "active":
				return todos.value.filter((t) => !t.completed);
			case "completed":
				return todos.value.filter((t) => t.completed);
			default:
				return todos.value;
		}
	});

	async function addTodo(title: string): Promise<Todo> {
		const todo = await $fetch<Todo>("/api/todos", {
			method: "POST",
			body: { title },
		});
		await fetchTodos();
		return todo;
	}

	async function toggleTodo(id: string): Promise<Todo | undefined> {
		const todo = await $fetch<Todo>(`/api/todos/${id}`, { method: "PATCH", body: {} });
		await fetchTodos();
		return todo;
	}

	async function deleteTodo(id: string): Promise<boolean> {
		await $fetch(`/api/todos/${id}`, { method: "DELETE" });
		await fetchTodos();
		return true;
	}

	async function updateTodoTitle(id: string, title: string): Promise<Todo | undefined> {
		const todo = await $fetch<Todo>(`/api/todos/${id}`, {
			method: "PATCH",
			body: { title },
		});
		await fetchTodos();
		return todo;
	}

	return {
		todos: readonly(todos),
		filteredTodos,
		filter,
		refresh: fetchTodos,
		addTodo,
		toggleTodo,
		deleteTodo,
		updateTodoTitle,
	};
}
