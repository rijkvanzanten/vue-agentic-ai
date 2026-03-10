export interface UiContextState {
	dialogOpen: boolean;
	currentFilter: "all" | "active" | "completed";
	todoCount: number;
	activeTodoCount: number;
	completedTodoCount: number;
}

const context = ref<UiContextState>({
	dialogOpen: false,
	currentFilter: "all",
	todoCount: 0,
	activeTodoCount: 0,
	completedTodoCount: 0,
});

export function useUiContext() {
	function setContext<K extends keyof UiContextState>(key: K, value: UiContextState[K]) {
		context.value = { ...context.value, [key]: value };
	}

	return {
		context: readonly(context),
		setContext,
	};
}
