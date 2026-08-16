import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "pm" | "user" | null;

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
};

const RoleContext = createContext<RoleContextValue>({ role: null, setRole: () => {} });

const STORAGE_KEY = "projectyar-role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "pm" || stored === "user") setRoleState(stored);
  }, []);

  const setRole = (next: Role) => {
    setRoleState(next);
    if (next) localStorage.setItem(STORAGE_KEY, next);
    else localStorage.removeItem(STORAGE_KEY);
  };

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}