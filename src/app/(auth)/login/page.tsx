"use client";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { api } from "@/lib/api/endpoints";
import { setToken } from "@/lib/auth/token";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { refetchMe, user } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isDisabled = useMemo(() => loading || !email.trim() || !password.trim(), [loading, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      const msg = "Email and password are required.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!res?.token) throw new Error("No token returned from server.");

      setToken(res.token);

      await refetchMe();
      
      if (user?.role !== "ADMIN") {
        throw new Error("Access denied: Admins only.");
      }

      toast.success("Login successful");
      router.replace("/admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md border border-border/60 shadow-sm">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl border border-border bg-card grid place-items-center overflow-hidden">
              <Image src="/logo.png" alt="Hospital Queue Logo" width={44} height={44} className="object-contain" priority />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-foreground">Admin Login</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to manage appointments and patient queue
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@hospital.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </div>

              <Button type="submit" className="w-full rounded-xl" disabled={isDisabled}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">Authorized hospital staff only.</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
