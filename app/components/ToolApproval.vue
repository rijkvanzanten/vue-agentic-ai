<script setup lang="ts">
defineProps<{
	toolName: string;
	args: Record<string, unknown>;
}>();

const emit = defineEmits<{
	approve: [];
	decline: [];
}>();
</script>

<template>
	<div class="border border-ui rounded-lg p-3 my-2 space-y-2">
		<p class="text-sm font-medium">Confirm: {{ toolName }}</p>
		<p v-if="args.title" class="text-sm text-muted">Delete "{{ args.title }}"?</p>
		<div class="flex gap-2">
			<UButton label="Allow" size="xs" @click="emit('approve')" />
			<UButton label="Deny" size="xs" color="neutral" variant="outline" @click="emit('decline')" />
		</div>
	</div>
</template>
