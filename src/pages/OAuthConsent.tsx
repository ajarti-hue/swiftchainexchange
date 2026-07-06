import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.jpeg";

// Supabase's auth-js beta OAuth namespace typing isn't published yet; wrap it locally.
type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthNs }).oauth;

function safeNext(path: string) {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => { active = false; };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) { setBusy(false); return setError(error.message); }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); return setError("No redirect returned by the authorization server."); }
    window.location.href = safeNext(target) === "/" && target.startsWith("http") ? target : target;
  }

  if (error) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-xl border border-destructive/40 bg-card p-6 text-sm">
          <h1 className="font-display text-xl font-bold text-foreground mb-2">Authorization error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }
  if (!details) {
    return <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted-foreground">Loading authorization request…</main>;
  }

  const clientName = details.client?.name ?? details.client?.client_name ?? "an app";

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <div className="text-center mb-6">
        <img src={logo} alt="SwiftChain X" className="mx-auto h-14 w-14 rounded-xl object-cover" />
        <h1 className="mt-3 font-display text-2xl font-bold text-foreground">Connect {clientName}</h1>
        <p className="text-sm text-muted-foreground mt-1">Allow {clientName} to use SwiftChain X tools on your behalf.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-start gap-3 text-sm">
          <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            {clientName} will be able to read your SwiftChain X trade history and public rate/payment
            information as you. It cannot change your account or move funds.
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={() => decide(true)} disabled={busy}>Approve</Button>
          <Button className="flex-1" variant="outline" onClick={() => decide(false)} disabled={busy}>Deny</Button>
        </div>
      </div>
    </main>
  );
}
