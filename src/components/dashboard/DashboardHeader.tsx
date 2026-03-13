// // src/components/dashboard/DashboardHeader.tsx
import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
  english_level: string | null;
};


export default function DashboardHeader({ profile }: { profile: Profile }) {
 

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">

        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-elevated ring-2 ring-gold/20 shrink-0">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="avatar"
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gold font-bold text-sm bg-gold/10">
              {profile.full_name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>

        {/* Name + Level */}
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-sm text-foreground leading-tight">
              {profile.full_name}
          </p>
          {profile.english_level && (
            <span className="text-xs text-gold border border-gold/40 bg-gold/10 px-2 py-0.5 rounded-full inline-block w-fit">
               {profile.english_level}
            </span>
          )}
        </div>
      </div>

      {/* Notification Bell */}
      <Link
        href="/notifications"
        className="relative bg-surface-elevated border border-border p-2.5 rounded-full hover:bg-muted transition-colors"
      >
        <Bell size={18} className="text-foreground" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />
      </Link>
    </div>
  );
}



// import Image from "next/image";
// import Link from "next/link";
// import { Bell } from "lucide-react";

// type Profile = {
//   full_name: string | null;
//   avatar_url: string | null;
//   english_level: string | null;
// };

// export default function DashboardHeader({ profile }: { profile: Profile }) {
//   return (
//     <div className="flex items-center justify-between">
//       <div className="flex items-center gap-3">
//         {/* Avatar */}
//         <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-700 shrink-0">
//           {profile.avatar_url ? (
//             <Image
//               src={profile.avatar_url}
//               alt="avatar"
//               width={44}
//               height={44}
//               className="object-cover w-full h-full"
//             />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center text-lg font-bold">
//               {profile.full_name?.[0] ?? "?"}
//             </div>
//           )}
//         </div>

//         {/* Name + Level */}
//         <div>
//           <p className="font-semibold text-sm leading-tight">
//             {profile.full_name}
//           </p>
//           {profile.english_level && (
//             <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full mt-0.5 inline-block">
//               {profile.english_level}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Notification Bell */}
//       <Link
//         href="/notifications"
//         className="relative bg-gray-800 p-2.5 rounded-full hover:bg-gray-700 transition-colors"
//       >
//         <Bell size={20} className="text-white" />
//         {/* Unread dot */}
//         <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full" />
//       </Link>
//     </div>
//   );
// }