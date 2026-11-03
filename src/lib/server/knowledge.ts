/**
 * Self-hosted knowledge base — answers without any API key.
 * Used by /api/chat when no provider key is supplied.
 */
export interface Tone {
  name: "concise" | "balanced" | "detailed";
}

const TOPICS: { match: RegExp; title: string; body: string[] }[] = [
  {
    match: /grok\s*bot|grokbot|n\s*space|nspace/i,
    title: "Grok Bot / N Space",
    body: [
      "Grok Bot is the agent workspace behind this dashboard. N Space is the iOS liquid-glass shell around it: Discover, Projects, Repos, Search, Build.",
      "Projects are pulled live from GitHub on every request, each one keeps its own favicon and live URL, and tapping a project opens it inside the in-app browser.",
      "The Build tab talks to Gemini, OpenAI or DeepSeek with your own key, or falls back to this built-in engine with zero key."
    ]
  },
  {
    match: /visa|সার্বিয়|serbia|schengen|embassy|দূতাবাস/i,
    title: "Visa work",
    body: [
      "Visa cases live under World Vision Consultancy: Serbia, Moldova, Estonia, Lithuania, Malta, Montenegro, Morocco, Singapore, Malaysia, Saudi Arabia, UAE, Kuwait and Bahrain.",
      "Standard flow: collect passport and documents, fill the portal application, book the appointment, track status, then file the decision copy with the client.",
      "For Serbia the e-visa portal account is used; keep the request number with every note so status checks stay traceable."
    ]
  },
  {
    match: /deploy|vercel|domain|github|repo/i,
    title: "Deployments and repos",
    body: [
      "Every project is built first, then deployed to Vercel with a short project name, so the URL stays short and predictable.",
      "The same tree is pushed to GitHub under the account you gave me, one repo per project, source untouched unless you ask for a change.",
      "If a build was produced for an older Node runtime, the Vercel project is set to Node 22 instead of editing your code."
    ]
  },
  {
    match: /password|admin|staff|role|access/i,
    title: "Access",
    body: [
      "Admin password unlocks full access: hide, restore and manage every project, plus all keys and the MCP endpoint.",
      "Staff password unlocks the read-only view: browse projects, open live previews and chat with the agent."
    ]
  },
  {
    match: /mcp|api key|gemini|openai|deepseek|llm/i,
    title: "Keys and MCP",
    body: [
      "Keys live only on this device. Gemini, OpenAI and DeepSeek each get their own field, and the local AI server field points the agent at a machine on your own network.",
      "The MCP endpoint speaks JSON-RPC over HTTP with four tools: list_apps, get_app, repo_stats and chat.",
      "Without any key the built-in engine still answers, so the dashboard never goes silent."
    ]
  }
];

const shape = (text: string, tone: "concise" | "balanced" | "detailed") => {
  if (tone === "concise") return text.split(/(?<=\.)\s/)[0];
  if (tone === "detailed") return text;
  return text;
};

export function knowledgeAnswer(input: string, tone: "concise" | "balanced" | "detailed", context?: { repo?: string | null }) {
  const q = input.trim();
  const hit = TOPICS.find((t) => t.match.test(q));

  if (hit) {
    const lines = tone === "concise" ? hit.body.slice(0, 1) : hit.body;
    return `${hit.title}\n\n${lines.map((l) => `• ${l}`).join("\n")}`;
  }

  if (/^(hi|hello|hey|salam|আসসালাম|হ্যালো)/i.test(q)) {
    return tone === "concise" ? "Ready. Ask about a project, a deploy or a visa case." : "Ready. I can look at any project, explain a deploy, draft an application step or reason through a visa case. Ask away.";
  }

  if (/status|health|summary|কী আছে/i.test(q)) {
    return [
      "Workspace status",
      context?.repo ? `• Pinned: ${context.repo}` : "• No project pinned",
      "• Data source: live GitHub, refreshed every 60 seconds",
      "• Build engine: built-in knowledge (no key needed)",
      "• Previews: in-app browser, real site"
    ].join("\n");
  }

  return shape(
    `I can help with the workspace itself: projects and their live URLs, deploys, keys, access roles and visa cases. Ask in plain language, for example "which projects were pushed today" or "what is the Serbia e-visa flow".`,
    tone
  );
}
