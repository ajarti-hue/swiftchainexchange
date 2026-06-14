import { Link } from "react-router-dom";
import { MessageCircle, Phone, Shield, MapPin, Mail } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-10 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <img src={logo} alt="SwiftChain Exchange" className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-display text-base font-bold text-card-foreground">SwiftChain Exchange</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Ghana's trusted desk for crypto, Perfect Money and gift card trades. Cedis in,
            cedis out — verified by real humans.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Shield size={12} className="text-emerald-500" />
            <span>Insured · Encrypted · KYC-aligned</span>
          </div>
        </div>

        {/* Platform */}
        <div>
          <h4 className="font-display text-sm font-bold text-card-foreground mb-3">Platform</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link to="/crypto" className="hover:text-foreground transition-colors">Trade Crypto</Link></li>
            <li><Link to="/gift-card" className="hover:text-foreground transition-colors">Trade Gift Cards</Link></li>
            <li><Link to="/account" className="hover:text-foreground transition-colors">My Account</Link></li>
            <li><Link to="/security" className="hover:text-foreground transition-colors">Security Center</Link></li>
            <li><a href="https://whatsapp.com/channel/0029Vb7LE6T89ingo3wmca3s" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">WhatsApp Channel</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-display text-sm font-bold text-card-foreground mb-3">Legal</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            <li><Link to="/aml-policy" className="hover:text-foreground transition-colors">AML Policy</Link></li>
            <li><Link to="/kyc-policy" className="hover:text-foreground transition-colors">KYC Verification</Link></li>
            <li><Link to="/risk-disclosure" className="hover:text-foreground transition-colors">Risk Disclosure</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display text-sm font-bold text-card-foreground mb-3">Get in touch</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin size={12} className="text-primary mt-0.5 shrink-0" />
              <span>Accra, Greater Accra Region, Ghana</span>
            </li>
            <li>
              <a href="tel:+233555098098" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone size={12} className="text-primary" /> +233 555 098 098
              </a>
            </li>
            <li>
              <a href="mailto:ajartisanvista@gmail.com" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail size={12} className="text-primary" /> ajartisanvista@gmail.com
              </a>
            </li>
            <li>
              <a href="https://wa.me/233555098098" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 rounded-lg bg-[hsl(142_70%_45%)] px-3 py-2 text-[11px] font-semibold text-white hover:opacity-90">
                <MessageCircle size={12} /> Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground text-center sm:text-left">
          © {new Date().getFullYear()} SwiftChain Exchange. All rights reserved. Trading digital assets involves risk.
        </p>
        <p className="text-[11px] text-muted-foreground">
          Operating in Ghana 🇬🇭 · Aligned with Bank of Ghana digital-asset guidance
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
