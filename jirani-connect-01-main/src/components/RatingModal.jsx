import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import api from "../api";
import { toast } from "sonner";

export function RatingModal({ isOpen, onClose, riderId, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return toast.error("Please select a star rating");
        setLoading(true);
        try {
            await api.post(`/users/${riderId}/rate`, { rating, review });
            toast.success("Rating submitted!");
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit rating");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate Your Rider</DialogTitle>
                    <DialogDescription>
                        How was your delivery experience?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-8 w-8 cursor-pointer transition-colors ${rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                    <Textarea 
                        placeholder="Leave a comment (optional)..." 
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Skip</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Submitting..." : "Submit Review"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
