import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthProvider } from "../components/auth-context";
import { AuthPanel } from "../components/auth-panel";

export const metadata: Metadata = {
  title: "Bite-Sized Learning",
  description: "Short-form educational reels platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-[#020617]/90 backdrop-blur">
            <div className="flex items-center gap-4">
              <Link href="/feed" className="font-semibold tracking-tight text-lg">
                Bite-Sized Learning
              </Link>
              <nav className="hidden md:flex gap-4 text-sm text-slate-300">
                <Link href="/feed">Feed</Link>
                <Link href="/creator/upload">Creator Upload</Link>
                <Link href="/playlist">Playlist</Link>
              </nav>
            </div>
            <AuthPanel />
          </header>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}



