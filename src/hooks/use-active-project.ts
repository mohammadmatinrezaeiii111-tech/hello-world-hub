import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProjectByCode, getActiveProject, setActiveProject, type Project } from "@/lib/project";

/**
 * پروژه فعال: ابتدا از حافظه مرورگر خوانده می‌شود و سپس اطلاعات آن
 * (نام پروژه و نام مدیر پروژه) به‌صورت داینامیک از پایگاه‌داده تازه‌سازی می‌شود.
 */
export function useActiveProject() {
  const [cached, setCached] = useState<Project | null>(null);

  useEffect(() => {
    setCached(getActiveProject());
  }, []);

  const code = cached?.project_code ?? null;

  const query = useQuery({
    queryKey: ["active-project", code],
    queryFn: () => fetchProjectByCode(code as string),
    enabled: Boolean(code),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data) setActiveProject(query.data);
  }, [query.data]);

  return {
    project: query.data ?? cached,
    isLoading: Boolean(code) && query.isPending,
  };
}
