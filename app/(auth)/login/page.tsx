"use client";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import Navbar from "@/components/global/navbar";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [redirectCountdown, setRedirectCountdown] = useState(0);
    const [redirectEmail, setRedirectEmail] = useState("");

    const router = useRouter()

    useEffect(() => {
        if (redirectCountdown <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setRedirectCountdown((current) => current - 1);
        }, 1000);

        return () => window.clearInterval(timer);
    }, [redirectCountdown]);

    useEffect(() => {
        if (redirectCountdown !== 0 || !redirectEmail) {
            return;
        }

        router.push(`/verify-email?email=${encodeURIComponent(redirectEmail)}`);
    }, [redirectCountdown, redirectEmail, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setRedirectCountdown(0);
        setRedirectEmail("");
        setIsLoading(true);
        const normalizedEmail = email.trim().toLowerCase();
        try {
            const precheckResponse = await fetch('/api/auth/precheck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalizedEmail, password }),
            });

            const precheckData = await precheckResponse.json();

            if (!precheckResponse.ok) {
                setError(precheckData.message || 'Sign in failed. Please try again.');

                if (precheckData.needsVerification && precheckData.email) {
                    setRedirectEmail(precheckData.email);
                    setRedirectCountdown(3);
                }

                setIsLoading(false);
                return;
            }

            const res = await signIn('credentials', { redirect: false, email: normalizedEmail, password })

            setIsLoading(false);

            if (res && (res as any).ok) {
                router.push('/dashboard')
                return;
            }

            const errorCode = (res as any)?.error;
            setError(errorCode || 'Sign in failed. Please try again.');
        } catch (error) {
            setIsLoading(false);
            setError('Sign in failed. Please try again.');
        }
    };

    return (
        <div style={{ backgroundColor: "var(--background)" }}>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--background)" }}>
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--heading)" }}>
                            Welcome back
                        </h1>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            Sign in to continue your market intelligence journey.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium" style={{ color: "#dc2626" }}>
                                {error}
                            </p>
                            {redirectCountdown > 0 && (
                                <p className="text-xs mt-2" style={{ color: "#b91c1c" }}>
                                    Redirecting to email verification in {redirectCountdown} second{redirectCountdown === 1 ? "" : "s"}...
                                </p>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs font-semibold block mb-2" style={{ color: "var(--heading)" }}>
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: "var(--border)", color: "var(--heading)", backgroundColor: "white" }}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold" style={{ color: "var(--heading)" }}>
                                    Password
                                </label>
                                <button type="button" className="text-xs font-semibold hover:opacity-75 transition" style={{ color: "var(--primary)" }}>
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: "var(--border)", color: "var(--heading)", backgroundColor: "white" }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-75 transition"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" style={{ color: "var(--text-secondary)" }} /> : <Eye className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-2.5 flex items-center justify-center gap-2"
                            style={{ backgroundColor: "var(--primary)" }}
                            disabled={isLoading}
                        >
                            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : "Sign in"}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" style={{ backgroundColor: "var(--background)" }}>
                            <div className="w-full border-t" style={{ borderColor: "var(--border)" }}></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2" style={{ backgroundColor: "var(--background)", color: "var(--text-secondary)" }}>
                                or continue with
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            className="w-full py-2.5 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 hover:opacity-75 transition"
                            style={{ borderColor: "var(--border)", color: "var(--heading)", backgroundColor: "white" }}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>


                    </div>

                    <p className="text-center text-xs mt-6" style={{ color: "var(--text-secondary)" }}>
                        Don't have an account?{" "}
                        <a href="/register" className="font-semibold hover:opacity-75 transition" style={{ color: "var(--primary)" }}>
                            Sign up
                        </a>
                    </p>

                    <div className="mt-8 pt-6 border-t flex items-center justify-center gap-2" style={{ borderColor: "var(--border)" }}>
                        <Lock className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            Your data is secure. We never sell your information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

