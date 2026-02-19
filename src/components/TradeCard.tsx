import { ReactNode } from "react";

interface TradeCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const TradeCard = ({ icon, title, description, onClick }: TradeCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-xl bg-card p-6 text-left shadow-[var(--shadow-card)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[var(--shadow-button)] border border-border"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <h3 className="mb-1 font-display text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
};

export default TradeCard;
