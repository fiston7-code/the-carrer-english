"use client";

import { Mic, MicOff, Hand, PhoneOff } from "lucide-react";

type Props = {
  role: "speaker" | "listener" | "coach";
  isMuted: boolean;
  isHandRaised: boolean;
  onMuteToggle: () => void;
  onHandRaise: () => void;
  onLeave: () => void;
};

type ButtonProps = {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant: "muted" | "active" | "neutral" | "danger";
};

function ControlButton({ onClick, icon, label, variant }: ButtonProps) {
  const styles = {
    muted: "bg-red-500/20 text-red-400 hover:bg-red-500/30",
    active: "bg-green-500/20 text-green-400 hover:bg-green-500/30",
    neutral: "bg-muted text-foreground hover:bg-muted/70",
    danger: "bg-red-500/20 text-red-400 hover:bg-red-500/30",
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onClick}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${styles[variant]}`}
      >
        {icon}
      </button>
      <span className="text-xs text-steel">{label}</span>
    </div>
  );
}

export default function ControlBar({
  role,
  isMuted,
  isHandRaised,
  onMuteToggle,
  onHandRaise,
  onLeave,
}: Props) {
  const canSpeak = role === "speaker" || role === "coach";

  return (
    <div className="px-6 py-5 border-t border-border bg-card">
      <div className="flex items-center justify-center gap-8">
        {canSpeak && (
          <ControlButton
            onClick={onMuteToggle}
            icon={isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            label={isMuted ? "Unmute" : "Mute"}
            variant={isMuted ? "muted" : "active"}
          />
        )}

        {role !== "coach" && (
          <ControlButton
            onClick={onHandRaise}
            icon={<Hand size={22} />}
            label={isHandRaised ? "Lower" : "Raise"}
            variant={isHandRaised ? "active" : "neutral"}
          />
        )}

        <ControlButton
          onClick={onLeave}
          icon={<PhoneOff size={22} />}
          label="Leave"
          variant="danger"
        />
      </div>
    </div>
  );
}

