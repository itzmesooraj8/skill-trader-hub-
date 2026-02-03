
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Check, KeyRound, Mail, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            // For demo, we just log them in
            if (isLogin) {
                login(email);
                toast.success("Welcome back!", {
                    description: "You have successfully logged in.",
                });
                navigate("/dashboard");
            } else {
                login(email);
                toast.success("Account created!", {
                    description: "Welcome to Skill Trader Hub.",
                });
                navigate("/dashboard");
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/5 blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="glass-elevated p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Top Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm" />

                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-4 left-4 text-white/40 hover:text-white"
                        onClick={() => navigate("/")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white mb-6 shadow-glow">
                            <span className="font-display font-black text-black text-lg">ST</span>
                        </div>
                        <h1 className="font-display text-3xl font-bold text-white mb-2">
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </h1>
                        <p className="text-white/40 text-sm">
                            {isLogin
                                ? "Enter your credentials to access your terminal"
                                : "Join the elite community of skill-based traders"}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-mono text-white/50 uppercase tracking-widest ml-1">Full Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-white transition-colors" />
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-mono text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-mono text-white/50 uppercase tracking-widest ml-1">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-white transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-mono text-sm"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-mono text-white/50 uppercase tracking-widest ml-1">Password</Label>
                            <div className="relative group">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-white transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-mono text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold rounded-xl mt-6 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    {isLogin ? "Sign In" : "Create Account"}
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Toggle */}
                    <div className="text-center mt-8">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            {isLogin ? "New to Skill Trader Hub?" : "Already have an account?"}
                            <span className="underline decoration-white/30 hover:decoration-white underline-offset-4">
                                {isLogin ? "Start Free" : "Sign In"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="flex justify-center gap-6 mt-8 text-xs text-white/20">
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Help</a>
                </div>
            </div>
        </div>
    );
}
