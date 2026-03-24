// // src/components/dashboard/RoomCard.tsx



import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Users } from "lucide-react";

type Room = {
  id: string;
  title: string;
  status: string;
  is_public: boolean;
  participants_count: number;
  coaches: {
    full_name: string;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
};

export default function RoomCard({ room }: { room: Room }) {
  console.log("Room Data:", room.title, "Is Public:", room.is_public);
  const isLive = room.status === "live";

  return (
    <Link href={`/rooms/${room.id}`}>
      <div className={`
        flex flex-col gap-3 p-4 rounded-2xl border h-full cursor-pointer
        transition-all duration-200 hover:scale-[1.02]
        ${isLive
          ? 'bg-surface-elevated border-border hover:border-gold/30'
          : 'bg-surface border-border hover:border-border'
        }
      `}>

        {/* Top row — status + count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="text-gold text-xs font-bold tracking-wide uppercase">
                  Live
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-xs font-medium">
                Upcoming
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users size={12} />
            <span className="text-xs">{room.participants_count ?? 0}</span>
          </div>
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
          {room.title}
        </p>

        {/* Coach + Badge FREE/PRO */}
{room.coaches && (
  <div className="flex items-center justify-between gap-2 mt-auto">
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-6 h-6 rounded-full overflow-hidden bg-muted shrink-0">
        {room.coaches.avatar_url ? (
          <Image
            src={room.coaches.avatar_url}
            alt={room.coaches.full_name}
            width={24} height={24}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gold bg-gold/10">
            {room.coaches.full_name[0]}
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground truncate">
        Coach {room.coaches.full_name}
      </span>
      {room.coaches.is_verified && (
        <CheckCircle size={12} className="text-blue-400 shrink-0" />
      )}
    </div>

    {/* ✅ Badge dans le même flex que le coach */}
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
      room.is_public
        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
        : 'bg-gold/20 text-gold border border-gold/30'
    }`}>
      {room.is_public ? 'PUBLIC' : 'PRIVATE'}
    </span>
  </div>
)}
      </div>
    </Link>
  );
}