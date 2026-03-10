import { useState, useEffect } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  trade_type: string;
  created_at: string;
}

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [tradeType, setTradeType] = useState("Gift Card");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("id, name, rating, comment, trade_type, created_at")
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !comment.trim()) return;
    if (!user) {
      toast({ title: "Sign in required", description: "Please create an account or sign in to leave a review.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      name: name.trim().slice(0, 50),
      rating,
      comment: comment.trim().slice(0, 300),
      trade_type: tradeType,
    });

    if (error) {
      toast({ title: "Error", description: "Could not submit review. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Review submitted!", description: "Thanks for your feedback." });
      setName("");
      setComment("");
      setRating(5);
      setShowForm(false);
      fetchReviews();
    }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

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
        <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Leave Review"}
        </Button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="mb-4 rounded-lg border border-border bg-background p-4 space-y-3">
          {!user && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
              You need to <a href="/auth" className="underline font-medium">sign in</a> to leave a review.
            </p>
          )}
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
                  tradeType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
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
          <Button size="sm" onClick={handleSubmit} disabled={!name.trim() || !comment.trim() || submitting || !user}>
            <Send size={14} />
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {review.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-card-foreground">{review.name}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                  {review.trade_type}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
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
