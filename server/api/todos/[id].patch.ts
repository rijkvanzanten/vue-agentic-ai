export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id")!;
	const body = await readBody<{ completed?: boolean; title?: string }>(event);

	if (body.title !== undefined) {
		const todo = updateTodoTitle(id, body.title);
		if (!todo) throw createError({ statusCode: 404, message: "Todo not found" });
		return todo;
	}

	const todo = toggleTodo(id);
	if (!todo) throw createError({ statusCode: 404, message: "Todo not found" });
	return todo;
});
