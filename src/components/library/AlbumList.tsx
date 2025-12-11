import type { KeyboardEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompactDisc } from "@fortawesome/free-solid-svg-icons";
import type { Album } from "../../types";

interface AlbumListProps {
  albums: Album[];
  selectedAlbum: Album | null;
  onSelectAlbum: (album: Album) => void;
}

export const AlbumList = ({
  albums,
  selectedAlbum,
  onSelectAlbum,
}: AlbumListProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, album: Album) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectAlbum(album);
    }
  };

  return (
    <section className="h-full flex flex-col">
      <header className="mb-3">
        <p className="uppercase text-[11px] tracking-[0.2em] text-zinc-500">
          Library
        </p>
        <h2 className="text-lg font-semibold text-white">Albums</h2>
      </header>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {albums.length === 0 && (
          <div className="text-zinc-500 text-sm">
            No albums found. Make sure your library is scanned.
          </div>
        )}

        {albums.map((album) => {
          const isActive = selectedAlbum?.album === album.album;
          return (
            <div
              key={album.album}
              tabIndex={0}
              role="button"
              onClick={() => onSelectAlbum(album)}
              onKeyDown={(e) => handleKeyDown(e, album)}
              className={`
                group
                flex items-center gap-3
                rounded-2xl
                px-3 py-2.5
                cursor-pointer
                transition
                outline-none
                bg-gradient-to-r from-white/5 via-zinc-900/40 to-black/50
                border ${isActive ? "border-lime-400/80" : "border-white/5"}
                hover:border-lime-300/60 hover:bg-white/10
                focus-visible:ring-2 focus-visible:ring-lime-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black
              `}
            >
              <div
                className={`
                  h-10 w-10 rounded-xl
                  flex items-center justify-center
                  bg-gradient-to-br from-zinc-700 via-zinc-900 to-black
                  shadow-sm
                  ${isActive ? "shadow-lime-500/40" : "shadow-black/40"}
                `}
              >
                <FontAwesomeIcon
                  icon={faCompactDisc}
                  className={isActive ? "text-lime-300" : "text-zinc-300"}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`
                    text-sm font-semibold truncate
                    ${isActive ? "text-lime-200" : "text-white"}
                  `}
                >
                  {album.album}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {album.artist}
                </p>
                <p className="text-[11px] text-zinc-500">
                  {album.trackCount} track{album.trackCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
