import { useState, useEffect } from "react";
import { Star, Send, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  tradeType: string;
}

const SEED_REVIEWS: Review[] = [
  {
    id: "1",
    name: "Kwame A.",
    rating: 5,
    comment: "Traded my Amazon gift card in under 10 minutes. Best rates I've found anywhere. Will definitely come back!",
    date: "2026-02-28",
    tradeType: "Gift Card",
  },
  {
    id: "2",
    name: "Ama B.",
    rating: 5,
    comment: "Sold USDT quickly and got paid instantly. Very professional and trustworthy service.",
    date: "2026-02-25",
    tradeType: "Crypto",
  },
  {
    id: "3",
    name: "Yaw M.",
    rating: 4,
    comment: "Great experience buying Bitcoin. The WhatsApp support made everything easy to follow.",
    date: "2026-02-20",
    tradeType: "Crypto",
  },
  {
    id: "4",
    name: "Efua K.",
    rating: 5,
    comment: "I've done 5 trades so far and earned bonus rewards. SwiftChain X is my go-to for gift cards!",
    date: "2026-03-01",
    tradeType: "Gift Card",
  },
];

const STORAGE_KEY = "swiftchain_reviews";

const getReviews = (): Review[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return [...SEED_REVIEWS, ...JSON.parse(stored)];
  } catch {}
  return SEED_REVIEWS;
};

const StarRating = ({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={16}
        className={`${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"} ${onChange ? "cursor-pointer" : ""}`}
        onClick={() => onChange?.(s)}
      />
    ))}
  </div>
);

const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>(getReviews);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [tradeType, setTradeType] = useState("Gift Card");

  const handleSubmit = () => {
    if (!name.trim() || !comment.trim()) return;
    const newReview: Review = {
      id: Date.now().toString(),
      name: name.trim().slice(0, 50),
      rating,
      comment: comment.trim().slice(0, 300),
      date: new Date().toISOString().split("T")[0],
      tradeType,
    };
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const userReviews = stored ? JSON.parse(stored) : [];
      userReviews.push(newReview);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userReviews));
    } catch {}
    setReviews((prev) => [...prev, newReview]);
    setName("");
    setComment("");
    setRating(5);
    setShowForm(false);
  };

  const avgRating = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-base font-bold text-card-foreground">Customer Reviews</h2>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={Math.round(Number(avgRating))} />
            <span className="text-xs text-muted-foreground">{avgRating} · {reviews.length} reviews</span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Leave Review"}
        </Button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="mb-4 rounded-lg border border-border bg-background p-4 space-y-3">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            className="text-sm"
          />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Rating:</span>
            <StarRating rating={rating} onChange={setRating} />
          </div>
          <div className="flex gap-2">
            {["Gift Card", "Crypto"].map((t) => (
              <button
                key={t}
                onClick={() => setTradeType(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  tradeType === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={300}
            className="text-sm min-h-[60px]"
          />
          <Button size="sm" onClick={handleSubmit} disabled={!name.trim() || !comment.trim()}>
            <Send size={14} />
            Submit Review
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {reviews
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((review) => (
            <div key={review.id} className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {review.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-card-foreground">{review.name}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                    {review.tradeType}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">{review.date}</span>
              </div>
              <StarRating rating={review.rating} />
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
