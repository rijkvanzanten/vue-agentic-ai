<script setup lang="ts">
import type { TodoFilter } from "~/composables/useTodos";

const filter = defineModel<TodoFilter>({ required: true });

const options: { label: string; value: TodoFilter }[] = [
	{ label: "All", value: "all" },
	{ label: "Active", value: "active" },
	{ label: "Completed", value: "completed" },
];
</script>

<template>
	<div class="inline-flex">
		<UButton
			v-for="option in options"
			:key="option.value"
			:label="option.label"
			:variant="filter === option.value ? 'solid' : 'outline'"
			color="neutral"
			size="xs"
			@click="filter = option.value"
		/>
	</div>
</template>
