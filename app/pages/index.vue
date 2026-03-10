<script setup lang="ts">
const { addTodo } = useTodos();
const dialogOpen = ref(false);
const chatOpen = ref(false);

async function handleCreate(title: string) {
	await addTodo(title);
}
</script>

<template>
	<UDashboardGroup class="h-dvh">
		<UDashboardPanel :ui="{ body: 'relative' }">
			<template #body>
				<div class="max-w-2xl mx-auto w-full py-6 px-4">
					<div class="flex items-center justify-between mb-6">
						<h1 class="text-2xl font-bold">Agentic Todo</h1>
						<div class="flex gap-2">
							<UButton
								id="add-todo"
								label="Add todo"
								icon="i-lucide-plus"
								@click="dialogOpen = true"
							/>
							<UButton
								:icon="chatOpen ? 'i-lucide-panel-right-close' : 'i-lucide-message-square'"
								color="neutral"
								variant="outline"
								@click="chatOpen = !chatOpen"
							/>
						</div>
					</div>

					<TodoList />
				</div>

				<div id="todo-panel-portal" class="absolute inset-0 pointer-events-none [&>*]:pointer-events-auto" />
			</template>
		</UDashboardPanel>

		<ChatSidebar v-if="chatOpen" @close="chatOpen = false" />

		<TodoCreateDialog v-model:open="dialogOpen" @create="handleCreate" />
	</UDashboardGroup>
</template>
