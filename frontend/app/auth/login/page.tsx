"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAuth } from "../../../components/auth-context";
import { getLocalUsers } from "../../../lib/local-users";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const users = getLocalUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!existing) {
        setError("No account with this email. Please sign up first.");
        return;
      }
      if (existing.password !== password) {
        setError("Incorrect password.");
        return;
      }

      setAuth({
        token: "local-auth",
        userId: existing.id,
        role: existing.role,
        name: existing.name
      });
      router.push("/feed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#020617] p-6 shadow-xl">
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-sm text-slate-300 mb-6">
          Log in to continue your bite-sized learning journey.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <p className="mt-4 text-xs text-slate-400 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-accent underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}


