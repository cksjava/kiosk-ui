// src/components/layout/AppLayout.tsx
import React from "react";
import { Sidebar } from "./Sidebar";
import type { LibrarySection, PlayerMetadata, PlayerState } from "../../types";
import { NowPlayingPanel } from "../player/NowPlayingPanel";

interface AppLayoutProps {
  activeSection: LibrarySection;
  onChangeSection: (section: LibrarySection) => void;

  playerMetadata: PlayerMetadata | null;
  playerState: PlayerState;

  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onChangeVolume: (volume: number) => void;

  children?: React.ReactNode; // main content (track list, etc.)
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeSection,
  onChangeSection,
  playerMetadata,
  playerState,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onChangeVolume,
  children,
}) => {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black via-zinc-900 to-emerald-900 text-white overflow-hidden">
      <div className="flex h-full">
        <Sidebar
          activeSection={activeSection}
          onChangeSection={onChangeSection}
        />

        <main
          className="
            flex-1 h-full
            flex flex-col
            bg-gradient-to-br from-zinc-950/80 via-zinc-900/80 to-emerald-950/80
            backdrop-blur-2xl
          "
        >
          {/* Top player panel */}
          <div className="border-b border-white/5">
            <NowPlayingPanel
              metadata={playerMetadata}
              state={playerState}
              onPlayPause={onPlayPause}
              onNext={onNext}
              onPrevious={onPrevious}
              onSeek={onSeek}
              onChangeVolume={onChangeVolume}
            />
          </div>

          {/* Main scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
