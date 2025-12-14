import { useMemo } from "react";
import type { ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faForwardStep,
  faBackwardStep,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import type { PlayerMetadata, PlayerState } from "../../types";
import { VolumeControl } from "./VolumeControl";

interface NowPlayingPanelProps {
  metadata: PlayerMetadata | null;
  state: PlayerState;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onStop: () => void;
  onSeek: (seconds: number) => void;
  onChangeVolume: (volume: number) => void;
}

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const NowPlayingPanel = ({
  metadata,
  state,
  onPlayPause,
  onNext,
  onPrevious,
  onStop,
  onSeek,
  onChangeVolume,
}: NowPlayingPanelProps) => {
  const progress = useMemo(() => {
    if (!state.duration || state.duration <= 0) return 0;
    return Math.min(
      100,
      Math.max(0, (state.currentTime / state.duration) * 100),
    );
  }, [state.currentTime, state.duration]);

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const pct = Number(e.target.value);
    const seconds = (pct / 100) * (state.duration || 0);
    onSeek(seconds);
  };

  const isSomethingPlaying = !!metadata;
  const coverUrl = metadata?.coverUrl || undefined;

  return (
    <section
      className="
        flex gap-4
        items-stretch
        bg-gradient-to-br from-white/5 via-emerald-900/30 to-black/60
        backdrop-blur-xl
        h-40 md:h-48 lg:h-56   /* panel height -> art height */
        px-6
      "
      aria-label="Now playing"
    >
      {/* Cover art: fills full panel height, square */}
      <div
        className="
          flex-shrink-0
          relative
          h-full
          aspect-square
          overflow-hidden
        "
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={metadata ? `${metadata.title} cover` : "Track cover"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-xs text-zinc-300">
            <div className="h-7 w-7 rounded-full border border-lime-400/60 flex items-center justify-center mb-1">
              <span className="text-[10px]">CD</span>
            </div>
            <span className="tracking-[0.15em] text-[10px] uppercase text-lime-300/80">
              No Art
            </span>
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Middle: text + progress + controls */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 py-3">
        {/* Title & artist */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg md:text-xl font-semibold truncate">
              {metadata?.title || "Nothing playing"}
            </h1>
            {metadata && (
              <span className="px-2 py-0.5 rounded-full bg-black/40 text-[11px] text-lime-300/90 border border-lime-500/40">
                Now Playing
              </span>
            )}
          </div>
          {metadata && (
            <>
              <p className="text-sm md:text-base text-zinc-300 truncate">
                {metadata.artist}
              </p>
              <p className="text-xs md:text-sm text-zinc-500 truncate">
                {metadata.album}
              </p>
            </>
          )}
        </div>

        {/* Progress bar with time labels inline */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-400 w-10 text-right">
            {formatTime(state.currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleSeek}
            disabled={!isSomethingPlaying || !state.duration}
            className={`
              flex-1
              accent-lime-400
              ${
                !isSomethingPlaying || !state.duration
                  ? "opacity-40 cursor-default"
                  : ""
              }
            `}
            aria-label="Seek in current track"
          />
          <span className="text-[11px] text-zinc-400 w-10">
            {formatTime(state.duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="mt-2 flex items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={onPrevious}
            className="
              h-9 w-9 rounded-full
              bg-black/40 hover:bg-black/60
              flex items-center justify-center
              text-zinc-200
              transition
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black
            "
            aria-label="Previous track"
          >
            <FontAwesomeIcon icon={faBackwardStep} />
          </button>

          <button
            type="button"
            onClick={onPlayPause}
            className="
              h-10 w-10 md:h-11 md:w-11 rounded-full
              bg-lime-400 hover:bg-lime-300
              text-black
              flex items-center justify-center
              text-lg
              shadow-lg shadow-lime-500/40
              transition
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black
            "
            aria-label={state.isPlaying ? "Pause" : "Play"}
          >
            <FontAwesomeIcon icon={state.isPlaying ? faPause : faPlay} />
          </button>

          <button
            type="button"
            onClick={onNext}
            className="
              h-9 w-9 rounded-full
              bg-black/40 hover:bg-black/60
              flex items-center justify-center
              text-zinc-200
              transition
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black
            "
            aria-label="Next track"
          >
            <FontAwesomeIcon icon={faForwardStep} />
          </button>

          <button
            type="button"
            onClick={onStop}
            className="
              h-9 w-9 rounded-full
              bg-red-600/80 hover:bg-red-500
              flex items-center justify-center
              text-white
              transition
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black
            "
            aria-label="Stop playback"
          >
            <FontAwesomeIcon icon={faStop} />
          </button>
        </div>
      </div>

      {/* Right: volume control */}
      <div className="hidden sm:flex items-center justify-center pl-4 pr-2">
        <VolumeControl volume={state.volume} onChangeVolume={onChangeVolume} />
      </div>
    </section>
  );
};
