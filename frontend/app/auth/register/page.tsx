"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAuth } from "../../../components/auth-context";
import { getLocalUsers, saveLocalUsers } from "../../../lib/local-users";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"creator" | "learner">("learner");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const users = getLocalUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        setError("An account with this email already exists. Try logging in instead.");
        return;
      }

      const newUser = {
        id: `${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        password,
        role
      };
      saveLocalUsers([...users, newUser]);

      // Log the user in immediately after registration
      setAuth({
        token: "local-auth",
        userId: newUser.id,
        role: newUser.role,
        name: newUser.name
      });
      router.push("/feed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#020617] p-6 shadow-xl">
        <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-sm text-slate-300 mb-6">
          Join as a learner or creator and start building micro-courses.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium mb-1">Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
          </div>
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
            <p className="text-[11px] text-slate-500 mt-1">
              At least 6 characters. Use something you&apos;ll remember.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Role</label>
            <select
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm"
              value={role}
              onChange={e => setRole(e.target.value as "creator" | "learner")}
            >
              <option value="learner">Learner</option>
              <option value="creator">Creator</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>
        <p className="mt-4 text-xs text-slate-400 text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-accent underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}


