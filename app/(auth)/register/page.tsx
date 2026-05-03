"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Loader2, Check } from "lucide-react";
import { Button } from "../../../components/ui/button";
import Navbar from "@/components/global/navbar";

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
}

const getPasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengths: PasswordStrength[] = [
        { score: 0, label: "", color: "" },
        { score: 1, label: "Weak", color: "#ef4444" },
        { score: 2, label: "Fair", color: "#f97316" },
        { score: 3, label: "Good", color: "#eab308" },
        { score: 4, label: "Strong", color: "#84cc16" },
        { score: 5, label: "Very Strong", color: "#22c55e" },
    ];

    return strengths[score];
};

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const router = useRouter();
    const passwordStrength = getPasswordStrength(password);

    const validateForm = (): boolean => {
        if (!fullName.trim()) {
            setError("Full name is required");
            return false;
        }
        if (!email.trim()) {
            setError("Email is required");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address");
            return false;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return false;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return false;
        }
        if (!agreedToTerms) {
            setError("You must agree to the Terms of Service and Privacy Policy");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: fullName,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration failed. Please try again.");
                setIsLoading(false);
                return;
            }

            setSuccess("Account created successfully! Redirecting to verify your email...");
            setTimeout(() => {
                router.push(`/verify-email?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch (err) {
            setError("An error occurred. Please try again later.");
            setIsLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: "var(--background)" }}>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--background)" }}>
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--heading)" }}>
                            Create your account
                        </h1>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            Join thousands of businesses using Revlytics for market intelligence.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium" style={{ color: "#dc2626" }}>
                                {error}
                            </p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-medium flex items-center gap-2" style={{ color: "#16a34a" }}>
                                <Check className="w-4 h-4" />
                                {success}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold block mb-2" style={{ color: "var(--heading)" }}>
                                Full name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: "var(--border)", color: "var(--heading)", backgroundColor: "white" }}
                                    required
                                />
                            </div>
                        </div>

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
                            <label className="text-xs font-semibold block mb-2" style={{ color: "var(--heading)" }}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
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
                            {password && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="h-1.5 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${(passwordStrength.score / 5) * 100}%`,
                                                    backgroundColor: passwordStrength.color,
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                        Use at least 8 characters with uppercase, lowercase, numbers, and symbols.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-semibold block mb-2" style={{ color: "var(--heading)" }}>
                                Confirm password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition"
                                    style={{ borderColor: "var(--border)", color: "var(--heading)", backgroundColor: "white" }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-75 transition"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" style={{ color: "var(--text-secondary)" }} /> : <Eye className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", border: "1px solid" }}>
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded cursor-pointer"
                                style={{ accentColor: "var(--primary)" }}
                                required
                            />
                            <label htmlFor="terms" className="text-xs leading-relaxed cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                                I agree to the{" "}
                                <a href="#" className="font-semibold hover:opacity-75 transition" style={{ color: "var(--primary)" }}>
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a href="#" className="font-semibold hover:opacity-75 transition" style={{ color: "var(--primary)" }}>
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-2.5 flex items-center justify-center gap-2"
                            style={{ backgroundColor: "var(--primary)" }}
                            disabled={isLoading}
                        >
                            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</> : "Create account"}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" style={{ backgroundColor: "var(--background)" }}>
                            <div className="w-full border-t" style={{ borderColor: "var(--border)" }}></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2" style={{ backgroundColor: "var(--background)", color: "var(--text-secondary)" }}>
                                or sign up with
                            </span>
                        </div>
                    </div>

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

                    <p className="text-center text-xs mt-6" style={{ color: "var(--text-secondary)" }}>
                        Already have an account?{" "}
                        <a href="/login" className="font-semibold hover:opacity-75 transition" style={{ color: "var(--primary)" }}>
                            Sign in
                        </a>
                    </p>

                    <div className="mt-8 pt-6 border-t flex items-center justify-center gap-2" style={{ borderColor: "var(--border)" }}>
                        <Lock className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            Your data is encrypted and secure
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
