import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { NowPlayingPanel } from "../player/NowPlayingPanel";
import type {
  Album,
  LibrarySection,
  PlayerMetadata,
  PlayerState,
} from "../../types";

interface AppLayoutProps {
  activeSection: LibrarySection;
  onChangeSection: (section: LibrarySection) => void;

  playerMetadata: PlayerMetadata | null;
  playerState: PlayerState;

  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onStop: () => void;
  onSeek: (seconds: number) => void;
  onChangeVolume: (volume: number) => void;

  albums: Album[];
  selectedAlbum: Album | null;
  onSelectAlbum: (album: Album) => void;

  children?: ReactNode;
}

export const AppLayout = ({
  activeSection,
  onChangeSection,
  playerMetadata,
  playerState,
  onPlayPause,
  onNext,
  onPrevious,
  onStop,
  onSeek,
  onChangeVolume,
  albums,
  selectedAlbum,
  onSelectAlbum,
  children,
}: AppLayoutProps) => {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black via-zinc-900 to-emerald-900 text-white overflow-hidden">
      <div className="flex h-full">
        <Sidebar
          activeSection={activeSection}
          onChangeSection={onChangeSection}
          albums={albums}
          selectedAlbum={selectedAlbum}
          onSelectAlbum={onSelectAlbum}
        />

        <main className="flex-1 h-full flex flex-col bg-gradient-to-br from-zinc-950/80 via-zinc-900/80 to-emerald-950/80 backdrop-blur-2xl overflow-x-hidden scrollbar-hidden">
          <div className="border-b border-white/5">
            <NowPlayingPanel
              metadata={playerMetadata}
              state={playerState}
              onPlayPause={onPlayPause}
              onNext={onNext}
              onPrevious={onPrevious}
              onStop={onStop}
              onSeek={onSeek}
              onChangeVolume={onChangeVolume}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        </main>
      </div>
    </div>
  );
};
