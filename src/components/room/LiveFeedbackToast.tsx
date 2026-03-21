"use client";

import { useEffect } from "react";
import { X, AlertCircle, Lightbulb } from "lucide-react";

type Feedback = {
  type: string;
  mistake: string;
  correction: string;
  explanation?: string;
};

type Props = {
  feedback: Feedback;
  onDismiss: () => void;
};

export default function LiveFeedbackToast({ feedback, onDismiss }: Props) {
  const isCorrection = feedback.type === "correction";

  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [feedback, onDismiss]);

  return (
    <div
      className={`mx-4 mb-3 rounded-2xl p-4 border animate-in slide-in-from-bottom-4
        ${isCorrection
          ? "bg-red-500/10 border-red-500/20"
          : "bg-blue-500/10 border-blue-500/20"
        }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`mt-0.5 shrink-0 ${isCorrection ? "text-red-400" : "text-blue-400"}`}>
          {isCorrection ? <AlertCircle size={16} /> : <Lightbulb size={16} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5
            ${isCorrection ? "text-red-400" : "text-blue-400"}`}>
            {isCorrection ? "Correction" : "Coach tip"}
          </p>
          <p className="text-sm">
            <span className="line-through text-red-400/80">{feedback.mistake}</span>
            <span className="text-steel mx-1">→</span>
            <span className="text-green-400 font-semibold">{feedback.correction}</span>
          </p>
          {feedback.explanation && (
            <p className="text-xs text-steel mt-1 leading-relaxed">
              {feedback.explanation}
            </p>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-steel transition-colors shrink-0"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

