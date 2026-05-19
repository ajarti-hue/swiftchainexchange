import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LogIn, UserPlus, Mail, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Enter your email", description: "Please enter your email address first.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "We sent you a password reset link." });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split("@")[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        // Trigger 6-digit OTP email in the background (don't block UX)
        supabase.auth
          .signInWithOtp({
            email,
            options: { shouldCreateUser: false, emailRedirectTo: window.location.origin },
          })
          .catch(() => {});

        toast({
          title: "Welcome to SwiftChain Exchange! 🎉",
          description: "We sent a 6-digit code to your email. Verify anytime from the banner.",
        });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast({ title: "Enter full code", description: "Please enter the 6-digit code from your email.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "signup",
      });
      if (error) throw error;
      toast({ title: "Account verified! ✅", description: "Welcome to SwiftChain X!" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Invalid code", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      toast({ title: "Code resent! 📧", description: "Check your email for a new verification code." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification Screen
  if (showOTP) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-lg px-4 py-8">
          <button onClick={() => setShowOTP(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Mail size={28} className="text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Verify Your Email</h1>
            <p className="text-sm text-muted-foreground mt-2">
              We sent a 6-digit verification code to
            </p>
            <p className="text-sm font-semibold text-primary mt-1">{email}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex flex-col items-center gap-6">
              <InputOTP maxLength={6} value={otpCode} onChange={(value) => setOtpCode(value)}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <Button className="w-full" onClick={handleVerifyOTP} disabled={loading || otpCode.length !== 6}>
                <ShieldCheck size={16} />
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Didn't receive the code?</p>
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Check your spam folder if you don't see the email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="text-center mb-8">
          <img src={logo} alt="SwiftChain X" className="mx-auto mb-4 h-16 w-16 rounded-xl object-cover shadow-[var(--shadow-card)]" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isForgotPassword ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isForgotPassword ? "Enter your email to receive a reset link" : isSignUp ? "Sign up to track your trades & rewards" : "Sign in to your SwiftChain X account"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="displayName" className="text-card-foreground">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-card-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1"
              />
            </div>
            {!isSignUp && !isForgotPassword && (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-card-foreground">Password</Label>
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="mt-1" />
              </div>
            )}
            {isSignUp && (
              <div>
                <Label htmlFor="password" className="text-card-foreground">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="mt-1" />
              </div>
            )}
            {isForgotPassword ? (
              <Button type="button" className="w-full" disabled={loading} onClick={handleForgotPassword}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            ) : (
              <Button type="submit" className="w-full" disabled={loading}>
                {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
                {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            )}
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={async () => {
              const { error } = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (error) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
              }
            }}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>

          <div className="mt-4 text-center space-y-1">
            {isForgotPassword ? (
              <button onClick={() => setIsForgotPassword(false)} className="text-sm text-primary hover:underline">
                Back to Sign In
              </button>
            ) : (
              <button onClick={() => { setIsSignUp(!isSignUp); setIsForgotPassword(false); }} className="text-sm text-primary hover:underline">
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Create one"}
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Creating an account is optional. You can still trade as a guest via WhatsApp.
        </p>
      </div>
    </div>
  );
};

export default Auth;
