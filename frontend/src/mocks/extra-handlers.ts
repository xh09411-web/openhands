import { http, HttpResponse } from "msw";
import {
  DirectConversationInfo,
  toV1ConversationPage,
} from "#/api/agent-server-adapter";
import type { GitUser } from "#/types/git";

const now = Date.now();

const APP_CONVERSATIONS: DirectConversationInfo[] = [
  {
    id: "1",
    title: "My New Project",
    created_at: new Date(now).toISOString(),
    updated_at: new Date(now).toISOString(),
    execution_status: "waiting_for_confirmation",
  },
  {
    id: "2",
    title: "Repo Testing",
    created_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    execution_status: "idle",
    agent: {
      llm: {
        model: "openhands/claude-opus-4-5-20251101",
      },
    },
  },
];

const GIT_USER: GitUser = {
  id: "99",
  login: "octocat",
  avatar_url: "https://github.com/images/error/octocat_happy.gif",
  company: "Acme",
  name: "The Octocat",
  email: "octocat@acme.org",
};

export const EXTRA_HANDLERS = [
  http.get("/api/v1/app-conversations/search", ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const items = APP_CONVERSATIONS.slice(0, limit);

    return HttpResponse.json(
      toV1ConversationPage({ items, next_page_id: null }),
    );
  }),

  http.get("/api/v1/users/git-info", () => HttpResponse.json(GIT_USER)),
];
