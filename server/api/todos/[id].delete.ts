export default defineEventHandler((event) => {
	const id = getRouterParam(event, "id")!;
	const deleted = deleteTodo(id);
	if (!deleted) throw createError({ statusCode: 404, message: "Todo not found" });
	return { deleted: true };
});
