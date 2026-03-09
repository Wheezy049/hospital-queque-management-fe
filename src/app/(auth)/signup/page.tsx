"use client";
import Image from "next/image";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMe } from "@/lib/hooks/auth/useMe";
import { useRegister } from "@/lib/hooks/auth/useRegister";
import Link from "next/link";

function SignupPage() {
    const router = useRouter();
    const { data: user, isLoading } = useMe();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");


    const registerMutation = useRegister();

    const isDisabled = useMemo(
        () => registerMutation.isPending || !name.trim() || !email.trim() || !password.trim(),
        [registerMutation.isPending, name, email, password]
    );

    const errorMessage =
        registerMutation.error instanceof Error
            ? registerMutation.error.message
            : null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        registerMutation.mutate(
            {
                name,
                email: email.trim().toLowerCase(),
                password,
            },
            {
                onError: (err: Error) => {
                    toast.error(err.message || "Signup failed")
                },
            }
        )
    }

    useEffect(() => {
        if (isLoading) return
        if (!user) return

        toast.success("Signup successful")
        if (user.role === "PATIENT") {
            router.replace("/patient")
        }
    }, [user, isLoading, router])

    return (
        <div className="relative h-full bg-background my-10">
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
                            <CardTitle className="text-2xl font-semibold text-foreground">Register Patient</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Create account to manage appointments and queue status.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={registerMutation.isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@hospital.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={registerMutation.isPending}
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
                                        disabled={registerMutation.isPending}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        disabled={registerMutation.isPending}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
                            </div>

                            <Button type="submit" className="w-full rounded-xl" disabled={isDisabled}>
                                {registerMutation.isPending ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Signing up...
                                    </span>
                                ) : (
                                    "Sign up"
                                )}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account? <Link href="/login" className="text-primary hover:underline">
                                    Log in
                                </Link>
                            </p>
                            <p className="text-center text-xs text-muted-foreground">
                                By signing up, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default SignupPage;