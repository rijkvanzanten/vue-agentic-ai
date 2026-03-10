<script setup lang="ts">
import { z } from "zod";

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
	create: [title: string];
}>();

const { setContext } = useUiContext();

watch(open, (isOpen) => {
	setContext("dialogOpen", isOpen);
});

defineTool({
	name: "open_create_dialog",
	description:
		"Open the create todo dialog in the UI. Use this when demonstrating how to create a todo visually.",
	parameters: z.object({}),
	async execute() {
		await showAgentCursor("#add-todo", 1500, { click: true });
		open.value = true;
		return { status: "success", message: "Opened create dialog" };
	},
});
</script>

<template>
	<UModal
		v-model:open="open"
		title="Create todo"
		portal="#todo-panel-portal"
		:ui="{
			overlay: '!absolute',
			content: '!absolute',
		}"
		:close="{
			onClick: () => {
				open = false;
			},
		}"
	>
		<template #body>
			<TodoCreateForm v-model:open="open" @create="emit('create', $event)" />
		</template>
	</UModal>
</template>
