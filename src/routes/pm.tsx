import { createFileRoute } from "@tanstack/react-router";
import { PmShell } from "@/components/pm/PmShell";

export const Route = createFileRoute("/pm")({
  component: PmShell,
});