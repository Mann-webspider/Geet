// components/admin/track-player.tsx
"use client";

import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { cn } from "@/lib/utils";

type PlayerVariant = "card";

export function TrackPlayer({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  return (
    <div className={cn(
      "rounded-xl border bg-white shadow-sm",
      "px-4 py-3 space-y-2"
    )}>
      <div className="text-sm font-medium truncate">{title}</div>
      <div className="[&_.rhap_container]:bg-transparent [&_.rhap_container]:shadow-none">
        <AudioPlayer
          src={src}
          layout="horizontal"
          showJumpControls={false}
          customAdditionalControls={[]}
          customVolumeControls={[]}
        />
      </div>
    </div>
  );
}
