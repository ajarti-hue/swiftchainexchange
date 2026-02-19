import { Link } from "react-router-dom";
import { MessageCircle, Phone, Shield } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card mt-8">
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Contact */}
      <div className="mb-6 text-center">
        <p className="text-sm font-medium text-card-foreground mb-3">Contact us directly</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="https://wa.me/233555098098"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
          <a
            href="tel:+233555098098"
            className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Phone size={16} />
            +233 555 098 098
          </a>
        </div>
      </div>

      {/* Trust badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
        <Shield size={14} />
        <span>All trades verified personally · Secure & insured exchanges</span>
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
