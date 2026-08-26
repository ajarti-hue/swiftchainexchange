import { AlertTriangle, MessageCircle, X } from "lucide-react";
import { useState } from "react";

const ConstructionBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="sticky top-14 z-40 w-full border-b border-amber-500/20 bg-amber-500/10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle size={16} className="shrink-0" />
          <span className="font-medium">
            We're still building out the website. For the fastest help with any order, rate, or booking, reach us on WhatsApp.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://wa.me/233555098098"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[hsl(142_70%_45%)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
          >
            <MessageCircle size={12} /> WhatsApp
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-md p-1 text-amber-700/70 dark:text-amber-300/70 hover:bg-amber-500/20"
            aria-label="Dismiss notice"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConstructionBanner;
