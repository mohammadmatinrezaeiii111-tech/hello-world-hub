import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/pm/agent")({
  staticData: { sitemap: false },
  beforeLoad: () => {
    throw redirect({ to: "/pm/settings/integrations" });
  },
});
