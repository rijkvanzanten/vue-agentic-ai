# Guiding Agentic AI with Vue and Pinia

Companion demo app for the [Vue.js Amsterdam 2026](https://vuejs.amsterdam/) talk by [Rijk van Zanten](https://rijk.nyc).

This todo app demonstrates two approaches to agentic AI in Vue applications:

- **Background agent**: AI calls server tools directly to get work done (e.g. bulk operations)
- **Foreground chat**: AI interacts with the UI on the client, showing the user what's happening step by step

## How It Works

### Tool Registration via Component Lifecycle

Components register tools when they mount and deregister when they unmount. This means the AI can only ever "see" tools that correspond to what's currently on screen.

```ts
// In any component
defineTool({
	name: "open_create_dialog",
	description: "Open the create todo dialog",
	execute: () => (dialog.value = true),
});
```

Under the hood, `defineTool` hooks into `onMounted` / `onUnmounted` to manage a Pinia-based tool registry.

### Architecture

```
User prompt
  → Vercel AI SDK streams to Claude
  → Model decides: server tool or client tool?
  → Server tool: executes on the backend, returns result
  → Client tool: executes in the browser (opens modals, types text, clicks buttons)
  → Result fed back to model for next step
```

**Server tools** (always available): `create_todo`, `toggle_todo`, `list_todos`

**Client tools** (available when their component is mounted): `open_create_dialog`, `type_text`, `click_save`, `delete_todo`

### UI Context

A `useUiContext` composable feeds the current UI state (open dialogs, active filters, todo counts) into the system prompt so the model knows what's on screen before deciding which tools to call.

## Tech Stack

- [Nuxt](https://nuxt.com/) + [Vue 3](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/) for tool registry state
- [Vercel AI SDK](https://ai-sdk.dev/) + [Claude](https://anthropic.com/) for the LLM layer
- [Nuxt UI](https://ui.nuxt.com/) + [Tailwind CSS](https://tailwindcss.com/)
- [Zod](https://zod.dev/) for tool parameter schemas

## Setup

```sh
pnpm install
```

Create a `.env` file with your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Start the dev server:

```sh
pnpm dev
```

## Key Files

| File                              | What it does                                                    |
| --------------------------------- | --------------------------------------------------------------- |
| `app/composables/defineTool.ts`   | Composable to register/deregister tools on mount/unmount        |
| `app/stores/toolRegistry.ts`      | Pinia store holding registered tools and serialized schemas     |
| `app/composables/useUiContext.ts` | Provides current UI state as context for the AI                 |
| `app/components/ChatSidebar.vue`  | Chat UI, tool execution, and approval flow                      |
| `server/api/chat.ts`              | Server endpoint that streams AI responses with tool definitions |
| `app/utils/showAgentCursor.ts`    | Animated cursor effect for foreground tool interactions         |

## License

MIT
