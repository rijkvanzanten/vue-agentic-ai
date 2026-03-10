<script setup lang="ts">
import { z } from "zod";

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
	create: [title: string];
}>();

const formRef = useTemplateRef<InstanceType<typeof import("./TodoCreateForm.vue").default>>("form");
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
		open.value = true;
		return { status: "success", message: "Opened create dialog" };
	},
});
</script>

<template>
	<UModal
		v-model:open="open"
		title="Create todo"
		:close="{
			onClick: () => {
				open = false;
			},
		}"
	>
		<template #body>
			<TodoCreateForm ref="form" v-model:open="open" @create="emit('create', $event)" />
		</template>
	</UModal>
</template>
