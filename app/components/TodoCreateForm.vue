<script setup lang="ts">
import { z } from "zod";

const open = defineModel<boolean>("open", { required: true });

const emit = defineEmits<{
	create: [title: string];
}>();

const title = ref("");
const titleInput = useTemplateRef<{ inputRef: HTMLInputElement }>("titleInput");

function setTitle(text: string) {
	title.value = text;
}

function save() {
	const trimmed = title.value.trim();
	if (!trimmed) return;
	emit("create", trimmed);
	open.value = false;
}

defineTool({
	name: "type_text",
	description:
		"Type text into the focused input field with a visible typing animation. Use when demonstrating how to enter a todo title.",
	parameters: z.object({
		text: z.string().describe("The text to type character by character"),
	}),
	async execute(args) {
		const text = args.text as string;
		await showAgentCursor("#todo-title-input", 600, { click: true });
		setTitle("");
		for (const char of text) {
			await new Promise((resolve) => setTimeout(resolve, 40 + Math.random() * 80));
			setTitle(title.value + char);
		}
		return { status: "success", message: `Typed: ${text}` };
	},
});

defineTool({
	name: "click_save",
	description:
		"Click the save button in the create todo dialog. Use as the final step when demonstrating todo creation.",
	parameters: z.object({}),
	async execute() {
		await showAgentCursor("#save-todo", 800, { click: true });
		save();
		return { status: "success", message: "Clicked save" };
	},
});

onMounted(() => {
	nextTick(() => titleInput.value?.inputRef?.focus());
});

defineExpose({ setTitle, save, currentTitle: computed(() => title.value) });
</script>

<template>
	<form class="space-y-4" @submit.prevent="save">
		<UInput id="todo-title-input" ref="titleInput" v-model="title" class="w-full" placeholder="What needs to be done?" autofocus />
		<div class="flex justify-end gap-2">
			<UButton label="Cancel" color="neutral" variant="outline" @click="open = false" />
			<UButton id="save-todo" label="Save" type="submit" :disabled="!title.trim()" />
		</div>
	</form>
</template>
