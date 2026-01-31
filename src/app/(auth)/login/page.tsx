"use client";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isDisabled = useMemo(() => {
    return loading || !email.trim() || !password.trim();
  }, [loading, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      toast.error("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Login failed");
      }

      // ✅ Make sure your /api/auth/login returns { token, user }
      // Example: { token: "...", user: { id, name, email, role } }
      if (!data?.token) throw new Error("No token returned from server");

      // ✅ Admin-only gate
      if (data?.user?.role !== "ADMIN") {
        throw new Error("Access denied: Admins only.");
      }

      // Store token (OK for now; cookie is better in production)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful");
      router.replace("/dashboard");
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border border-border/60 shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h items-center justify-center overflow-hidden">
            <Image
              src="/logo.png"
              alt="Hospital Queue Logo"
              width={100}
              height={100}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold">
              Admin Login
            </CardTitle>
            <CardDescription>
              Sign in to manage appointments and queues
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={isDisabled}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Authorized hospital staff only.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
