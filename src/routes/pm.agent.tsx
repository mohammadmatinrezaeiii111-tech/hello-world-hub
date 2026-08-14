import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/pm/agent")({
  beforeLoad: () => {
    throw redirect({ to: "/pm/settings/integrations" });
  },
});
