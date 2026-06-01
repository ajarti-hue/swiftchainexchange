import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, ShieldCheck, X, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DISMISS_KEY = "scx_verify_banner_dismissed_at";

const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Load verified flag — trust Supabase's own confirmation OR our profile flag.
  useEffect(() => {
    if (!user) {
      setEmailVerified(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const supaConfirmed = Boolean((user as any).email_confirmed_at || (user as any).confirmed_at);
      const { data } = await supabase
        .from("profiles")
        .select("email_verified")
        .eq("user_id", user.id)
        .maybeSingle();
      const verified = supaConfirmed || Boolean(data?.email_verified);
      if (!cancelled) setEmailVerified(verified);
      // Auto-sync stale profile flag so future loads are instant.
      if (supaConfirmed && !data?.email_verified) {
        await supabase.from("profiles").update({ email_verified: true }).eq("user_id", user.id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Restore dismissal (per browser session)
  useEffect(() => {
    const ts = sessionStorage.getItem(DISMISS_KEY);
    if (ts) setDismissed(true);
  }, []);

  // Cooldown ticker for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = useCallback(
    async (silent = false) => {
      if (!user?.email) return;
      setResending(true);
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: user.email,
          options: { shouldCreateUser: false, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setCooldown(60);
        if (!silent) {
          toast({ title: "Code sent 📧", description: `We sent a 6-digit code to ${user.email}.` });
        }
      } catch (e: any) {
        toast({ title: "Could not send code", description: e.message, variant: "destructive" });
      } finally {
        setResending(false);
      }
    },
    [user, toast],
  );

  const handleOpen = async () => {
    setOpen(true);
    setCode("");
    if (cooldown === 0) await sendCode(true);
  };

  const handleVerify = async () => {
    if (!user?.email || code.length !== 6) return;
    setVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: user.email,
        token: code,
        type: "email",
      });
      if (error) throw error;

      await supabase
        .from("profiles")
        .update({ email_verified: true })
        .eq("user_id", user.id);

      setEmailVerified(true);
      setOpen(false);
      toast({
        title: "✅ Email verified!",
        description: "Welcome to SwiftChain Exchange.",
      });
    } catch (e: any) {
      toast({ title: "Invalid code", description: e.message, variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  if (!user || emailVerified !== false) return null;

  return (
    <>
      {!dismissed && (
        <div className="sticky top-0 z-40 w-full border-b border-amber-300/50 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800/60">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
            <AlertTriangle size={18} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="flex-1 text-xs sm:text-sm text-amber-900 dark:text-amber-100">
              <span className="font-semibold">Verify your email</span>
              <span className="hidden sm:inline">
                {" "}
                — we sent a 6-digit code to{" "}
                <span className="font-mono font-semibold">{user.email}</span>.
              </span>
            </p>
            <Button
              size="sm"
              onClick={handleOpen}
              className="h-8 bg-amber-600 text-white hover:bg-amber-700"
            >
              <ShieldCheck size={14} /> Verify Now
            </Button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="rounded-md p-1 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/50"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Mail className="text-primary" size={22} />
            </div>
            <DialogTitle className="text-center">Verify your email</DialogTitle>
            <DialogDescription className="text-center">
              Enter the 6-digit code we sent to{" "}
              <span className="font-semibold text-foreground">{user.email}</span>. The code expires
              in 15 minutes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-5 py-2">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={verifying || code.length !== 6}
            >
              {verifying ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
              {verifying ? "Verifying…" : "Verify"}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              Didn't get it?{" "}
              <button
                onClick={() => sendCode(false)}
                disabled={resending || cooldown > 0}
                className="font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending…" : "Resend code"}
              </button>
            </div>

            <p className="text-center text-[11px] text-muted-foreground border-t border-border pt-3 w-full">
              Or click the verification link in your email instead.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailVerificationBanner;
