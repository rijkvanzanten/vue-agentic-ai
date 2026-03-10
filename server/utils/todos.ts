export interface Todo {
	id: string;
	title: string;
	completed: boolean;
}

const todos: Todo[] = [
	{ id: crypto.randomUUID(), title: "Learn about agentic AI patterns", completed: false },
	{ id: crypto.randomUUID(), title: "Build a demo app", completed: false },
	{ id: crypto.randomUUID(), title: "Prepare keynote slides", completed: true },
];

export function listTodos(): Todo[] {
	return todos;
}

export function getTodo(id: string): Todo | undefined {
	return todos.find((t) => t.id === id);
}

export function addTodo(title: string): Todo {
	const todo: Todo = { id: crypto.randomUUID(), title, completed: false };
	todos.push(todo);
	return todo;
}

export function toggleTodo(id: string): Todo | undefined {
	const todo = todos.find((t) => t.id === id);
	if (todo) todo.completed = !todo.completed;
	return todo;
}

export function updateTodoTitle(id: string, title: string): Todo | undefined {
	const todo = todos.find((t) => t.id === id);
	if (todo) todo.title = title;
	return todo;
}

export function deleteTodo(id: string): boolean {
	const index = todos.findIndex((t) => t.id === id);
	if (index === -1) return false;
	todos.splice(index, 1);
	return true;
}
