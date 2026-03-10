export default defineEventHandler(async (event) => {
	const { title } = await readBody<{ title: string }>(event);
	return addTodo(title);
});
