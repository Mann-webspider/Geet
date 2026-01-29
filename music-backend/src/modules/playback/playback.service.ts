import { PlaybackRepository } from "./playback.repository";

export class PlaybackService {
  private repo = new PlaybackRepository();

  async startPlayback(input: {
    userId: string;
    trackId: string;
    source?: string;
  }) {
    const track = await this.repo.getTrackById(input.trackId);
    if (!track) {
      const err: any = new Error("Track not found");
      err.status = 404;
      throw err;
    }

    // Optional: debounce duplicate starts for same track
    const debounceSeconds = Number(process.env.PLAYBACK_DEBOUNCE_SECONDS ?? "15");
    if (debounceSeconds > 0) {
      const dup = await this.repo.findRecentDuplicateWithinSeconds({
        userId: input.userId,
        trackId: input.trackId,
        seconds: debounceSeconds,
      });
      if (dup) {
        // Do not increment playCount; just return track data
        return {
          eventCreated: false,
          track,
        };
      }
    }

    await this.repo.incrementTrackPlayCount(track.id);

    const event = await this.repo.createPlaybackEvent({
      userId: input.userId,
      trackId: track.id,
      source: input.source ?? "unknown",
    });

    return {
      eventCreated: true,
      event,
      track,
    };
  }

  async getRecentlyPlayed(input: { userId: string; limit: number; offset: number }) {
    return this.repo.findRecentPlayed(input);
  }
}
