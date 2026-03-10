<script setup lang="ts">
import { z } from "zod";

const open = defineModel<boolean>("open", { required: true });

const emit = defineEmits<{
	create: [title: string];
}>();

const title = ref("");
const titleInput = useTemplateRef<{ inputRef: HTMLInputElement }>("titleInput");

function focusTitle() {
	titleInput.value?.inputRef?.focus();
}

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
	name: "focus_title_field",
	description:
		"Focus the title input field in the create todo dialog. Use after opening the dialog when demonstrating the UI.",
	parameters: z.object({}),
	async execute() {
		focusTitle();
		return { status: "success", message: "Focused title field" };
	},
});

defineTool({
	name: "type_text",
	description:
		"Type text into the focused input field with a visible typing animation. Use when demonstrating how to enter a todo title.",
	parameters: z.object({
		text: z.string().describe("The text to type character by character"),
	}),
	async execute(args) {
		const text = args.text as string;
		setTitle("");
		for (const char of text) {
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
		save();
		return { status: "success", message: "Clicked save" };
	},
});

onMounted(() => {
	nextTick(() => titleInput.value?.inputRef?.focus());
});

defineExpose({ focusTitle, setTitle, save, currentTitle: computed(() => title.value) });
</script>

<template>
	<form class="space-y-4" @submit.prevent="save">
		<UInput ref="titleInput" v-model="title" placeholder="What needs to be done?" autofocus />
		<div class="flex justify-end gap-2">
			<UButton label="Cancel" color="neutral" variant="outline" @click="open = false" />
			<UButton label="Save" type="submit" :disabled="!title.trim()" />
		</div>
	</form>
</template>
