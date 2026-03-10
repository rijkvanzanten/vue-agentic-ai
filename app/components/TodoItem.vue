<script setup lang="ts">
import type { Todo } from "~/composables/useTodos";

const props = defineProps<{
	todo: Todo;
}>();

const emit = defineEmits<{
	toggle: [id: string];
	"update-title": [id: string, title: string];
	delete: [id: string];
}>();

const editing = ref(false);
const editTitle = ref("");

function startEditing() {
	editTitle.value = props.todo.title;
	editing.value = true;
}

function finishEditing() {
	if (!editing.value) return;
	editing.value = false;
	const trimmed = editTitle.value.trim();
	if (trimmed && trimmed !== props.todo.title) {
		emit("update-title", props.todo.id, trimmed);
	}
}
</script>

<template>
	<div class="flex items-center gap-2 group py-1">
		<UCheckbox :model-value="todo.completed" @update:model-value="emit('toggle', todo.id)" />

		<template v-if="editing">
			<UInput
				v-model="editTitle"
				autofocus
				class="flex-1"
				@blur="finishEditing"
				@keydown.enter="finishEditing"
				@keydown.escape="editing = false"
			/>
		</template>
		<template v-else>
			<span
				class="flex-1 cursor-pointer"
				:class="{ 'line-through text-muted': todo.completed }"
				@dblclick="startEditing"
			>
				{{ todo.title }}
			</span>
		</template>

		<UButton
			:id="'delete-todo-' + todo.id"
			icon="i-lucide-trash-2"
			color="neutral"
			variant="ghost"
			size="xs"
			class="opacity-0 group-hover:opacity-100 transition-opacity"
			@click="emit('delete', todo.id)"
		/>
	</div>
</template>
