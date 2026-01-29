// components/admin/track-player-wide.tsx
"use client";

import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

export function TrackPlayerWide({
  src,
  title,
  artist,
}: {
  src: string;
  title: string;
  artist?: string;
}) {
  return (
    <div className="rounded-xl border bg-white px-4 py-3 flex items-center gap-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate">{title}</div>
        {artist && (
          <div className="text-xs text-muted-foreground truncate">{artist}</div>
        )}
        <div className="mt-2 [&_.rhap_container]:bg-transparent [&_.rhap_container]:p-0 [&_.rhap_container]:shadow-none">
          <AudioPlayer
            src={src}
            layout="horizontal"
            showJumpControls={false}
            customAdditionalControls={[]}
            customVolumeControls={[]}
          />
        </div>
      </div>
    </div>
  );
}
