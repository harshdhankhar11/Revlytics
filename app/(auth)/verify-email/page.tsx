"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2, CheckCircle, AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/global/navbar";

export default function VerifyEmailPage() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [initialSent, setInitialSent] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    useEffect(() => {
        const sendInitialCode = async () => {
            if (!email || initialSent) {
                return;
            }

            setIsLoading(true);
            setError("");

            try {
                const response = await fetch("/api/auth/send-verification-email", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, mode: "initial" }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || "Failed to send verification email");
                    setIsLoading(false);
                    return;
                }

                setSuccess(data.sent === false ? "Verification code already sent. Check your inbox." : "Verification email sent! Check your inbox.");
                setInitialSent(true);
                setResendCooldown(60);
            } catch (err) {
                setError("An error occurred. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        sendInitialCode();
    }, [email, initialSent]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email || !otp) {
            setError("Please enter your email and OTP");
            return;
        }

        if (otp.length !== 6) {
            setError("OTP must be 6 digits");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to verify OTP");
                setIsLoading(false);
                return;
            }

            setSuccess("Email verified successfully! Redirecting to login...");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            setError("An error occurred. Please try again later.");
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email) {
            setError("Please enter your email");
            return;
        }

        setIsResending(true);
        setError("");

        try {
            const response = await fetch("/api/auth/send-verification-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, mode: "resend" }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to resend OTP");
                setIsResending(false);
                return;
            }

            setSuccess("Verification email resent! Check your inbox.");
            setResendCooldown(60);
            setIsResending(false);
        } catch (err) {
            setError("An error occurred. Please try again later.");
            setIsResending(false);
        }
    };

    return (
        <div style={{ backgroundColor: "var(--background)" }}>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--background)" }}>
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
                            >
                                <Mail className="w-8 h-8" style={{ color: "var(--primary)" }} />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--heading)" }}>
                            Verify Your Email
                        </h1>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {isLoading ? "Sending your verification code..." : "We've sent a 6-digit code to your email address"}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#dc2626" }} />
                            <p className="text-sm font-medium" style={{ color: "#dc2626" }}>
                                {error}
                            </p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#16a34a" }} />
                            <p className="text-sm font-medium" style={{ color: "#16a34a" }}>
                                {success}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                        <div>
                            <label className="text-xs font-semibold block mb-2" style={{ color: "var(--heading)" }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: "var(--border)", color: "var(--heading)", backgroundColor: "white" }}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold block mb-2" style={{ color: "var(--heading)" }}>
                                Verification Code
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                    setOtp(value);
                                }}
                                placeholder="000000"
                                maxLength={6}
                                className="w-full px-4 py-3 rounded-lg border text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: "var(--border)", color: "var(--heading)", backgroundColor: "white", fontFamily: "'Courier New', monospace" }}
                                required
                            />
                            <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                                Enter the 6-digit code from your email
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-2.5 flex items-center justify-center gap-2"
                            style={{ backgroundColor: "var(--primary)" }}
                            disabled={isLoading || otp.length !== 6}
                        >
                            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</> : "Verify Email"}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                        <p className="text-center text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                            Didn't receive the code?
                        </p>
                        <button
                            onClick={handleResendOTP}
                            disabled={isResending || resendCooldown > 0}
                            className="w-full py-2.5 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 hover:opacity-75 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ borderColor: "var(--primary)", color: "var(--primary)", backgroundColor: "transparent" }}
                        >
                            {isResending ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
                            ) : resendCooldown > 0 ? (
                                <>
                                    <RotateCw className="w-4 h-4" />
                                    Resend in {resendCooldown}s
                                </>
                            ) : (
                                <>
                                    <RotateCw className="w-4 h-4" />
                                    Resend Code
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-xs mt-8" style={{ color: "var(--text-secondary)" }}>
                        Wrong email?{" "}
                        <a href="/register" className="font-semibold hover:opacity-75 transition" style={{ color: "var(--primary)" }}>
                            Sign up again
                        </a>
                    </p>

                    <div className="mt-8 pt-6 border-t flex items-center justify-center gap-2" style={{ borderColor: "var(--border)" }}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            This code expires in 10 minutes
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
