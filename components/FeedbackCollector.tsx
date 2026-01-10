import React, { useState, useEffect } from 'react';
import { StarIcon } from './icons/StarIcon';
import { StarOutlineIcon } from './icons/StarOutlineIcon';
import type { Feedback } from '../types';

interface FeedbackCollectorProps {
  id: string;
  currentFeedback?: Feedback;
  onSubmit: (rating: number, comment: string) => void;
}

const FeedbackCollector: React.FC<FeedbackCollectorProps> = ({ id, currentFeedback, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setRating(currentFeedback?.rating || 0);
    setComment(currentFeedback?.comment || '');
    setSubmitted(!!currentFeedback);
  }, [currentFeedback, id]);

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating before submitting.');
      return;
    }
    onSubmit(rating, comment);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-4 bg-green-50 text-green-800 rounded-lg text-center">
        <h4 className="font-semibold">Thank you for your feedback!</h4>
        <p className="text-sm">Your input helps us improve the AI.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <h4 className="text-sm font-semibold text-slate-800 text-center mb-2">Rate this Generation</h4>
      <div className="flex justify-center items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-yellow-400 hover:text-yellow-500 focus:outline-none"
            aria-label={`Rate ${star} star`}
          >
            {(hoverRating || rating) >= star ? (
              <StarIcon className="h-7 w-7" />
            ) : (
              <StarOutlineIcon className="h-7 w-7 text-slate-300" />
            )}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional: Any specific feedback? (e.g., 'Too much white space')"
        rows={2}
        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-900"
      />
      <button
        onClick={handleSubmit}
        disabled={rating === 0}
        className="mt-3 w-full bg-sky-600 text-white font-medium py-2 px-4 rounded-md hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        Submit Feedback
      </button>
    </div>
  );
};

export default FeedbackCollector;
