import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCryptoRates from "./tools/list-crypto-rates";
import listPaymentMethods from "./tools/list-payment-methods";
import getMyTrades from "./tools/get-my-trades";

// Build the OAuth issuer from the Supabase project ref so it matches the
// discovery document publisher (RFC 8414 §3.3). Vite inlines this literal at
// build time, keeping the entry import-safe.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "swift-trade-hub-mcp",
  title: "Swift Trade Hub",
  version: "0.1.0",
  instructions:
    "Tools for Swift Trade Hub — Ghana's crypto & gift-card trading desk. Use `list_crypto_rates` and `list_payment_methods` for public rate/payment info, and `get_my_trades` to read the signed-in customer's own orders.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCryptoRates, listPaymentMethods, getMyTrades],
});
