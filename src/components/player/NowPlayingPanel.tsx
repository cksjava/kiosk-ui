// src/components/player/NowPlayingPanel.tsx
import React, { useMemo } from "react";
import type { PlayerMetadata, PlayerState } from "../../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faForwardStep,
  faBackwardStep,
} from "@fortawesome/free-solid-svg-icons";
import { VolumeControl } from "./VolumeControl";

interface NowPlayingPanelProps {
  metadata: PlayerMetadata | null;
  state: PlayerState;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onChangeVolume: (volume: number) => void;
}

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const NowPlayingPanel: React.FC<NowPlayingPanelProps> = ({
  metadata,
  state,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onChangeVolume,
}) => {
  const progress = useMemo(() => {
    if (!state.duration || state.duration <= 0) return 0;
    return Math.min(100, Math.max(0, (state.currentTime / state.duration) * 100));
  }, [state.currentTime, state.duration]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = Number(e.target.value);
    const seconds = (pct / 100) * (state.duration || 0);
    onSeek(seconds);
  };

  const isSomethingPlaying = !!metadata;

  return (
    <section
      className="
        px-6 py-4
        flex gap-4
        items-center
        bg-gradient-to-br from-white/5 via-emerald-900/30 to-black/60
        backdrop-blur-xl
      "
      aria-label="Now playing"
    >
      {/* Cover art */}
      <div
        className="
          relative
          h-20 w-20 md:h-28 md:w-28
          rounded-2xl
          overflow-hidden
          bg-gradient-to-br from-zinc-700 via-zinc-900 to-black
          flex-shrink-0
          shadow-lg shadow-black/60
        "
      >
        {metadata?.coverUrl ? (
          <img
            src={metadata.coverUrl}
            alt={`${metadata.title} cover`}
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

        {/* Overlay gradient */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Middle: text + progress + controls */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Title & artist */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
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

        {/* Progress */}
        <div className="mt-1">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-1">
            <span>{formatTime(state.currentTime)}</span>
            <span className="flex-1 h-px bg-zinc-700/70" aria-hidden="true" />
            <span>{formatTime(state.duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleSeek}
            disabled={!isSomethingPlaying || !state.duration}
            className={`
              w-full
              accent-lime-400
              ${!isSomethingPlaying || !state.duration ? "opacity-40 cursor-default" : ""}
            `}
            aria-label="Seek in current track"
          />
        </div>

        {/* Controls */}
        <div className="mt-2 flex items-center gap-4">
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
        </div>
      </div>

      {/* Right: volume control (hidden on very small widths if needed) */}
      <div className="hidden sm:flex items-center justify-center pl-2">
        <VolumeControl volume={state.volume} onChangeVolume={onChangeVolume} />
      </div>
    </section>
  );
};
