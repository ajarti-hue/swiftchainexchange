import { Link } from "react-router-dom";
import { MessageCircle, Phone, Shield, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Contact Section */}
      <div className="text-center mb-8">
        <h2 className="font-display text-xl font-bold text-card-foreground mb-2">Contact Us</h2>
        <p className="text-sm text-muted-foreground mb-5">Get in touch with us using any of these methods.</p>
        <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
          <a
            href="https://wa.me/233555098098"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-[hsl(142_70%_45%)] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all"
          >
            <MessageCircle size={16} />
            Chat on WhatsApp
          </a>
          <a
            href="tel:+233555098098"
            className="flex items-center gap-2 rounded-xl bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Phone size={16} />
            +233 555 098 098
          </a>
        </div>
      </div>

      {/* Trust & Security */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
        <Shield size={14} className="text-primary" />
        <span>All trades verified personally · Secure & insured exchanges · Data protected</span>
      </div>

      {/* Legal links */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
        <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        <span>·</span>
        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
        <span>·</span>
        <a href="https://wa.me/233555098098" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Support</a>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SwiftChain X. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
