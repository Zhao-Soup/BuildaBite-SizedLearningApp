"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "./auth-context";

export function AuthPanel() {
  const { token, name, role, clearAuth } = useAuth();

  if (token) {
    return (
      <div className="flex items-center gap-3 text-xs text-slate-200">
        <span className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-semibold">
            {name?.charAt(0).toUpperCase() ?? "U"}
          </span>
          <span className="flex flex-col">
            <span className="font-semibold text-sm">{name ?? "User"}</span>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">
              {role}
            </span>
          </span>
        </span>
        <Button variant="ghost" className="text-xs" onClick={clearAuth}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/auth/login">
        <Button variant="ghost" className="text-xs px-3">
          Log in
        </Button>
      </Link>
      <Link href="/auth/register">
        <Button variant="primary" className="text-xs px-3">
          Sign up
        </Button>
      </Link>
    </div>
  );
}



