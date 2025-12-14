import type { KeyboardEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faWaveSquare } from "@fortawesome/free-solid-svg-icons";
import type { Album, Track } from "../../types";

interface AlbumTrackListProps {
  album: Album | null;
  tracks: Track[];
  currentTrackId: number | null;
  onSelectTrack: (track: Track) => void;
}

const formatDuration = (seconds?: number): string => {
  if (!seconds || seconds <= 0 || !Number.isFinite(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const AlbumTrackList = ({
  album,
  tracks,
  currentTrackId,
  onSelectTrack,
}: AlbumTrackListProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, track: Track) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectTrack(track);
    }
  };

  if (!album) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
        Select an album to view its tracks.
      </div>
    );
  }

  const albumCoverUrl =
    typeof album.id === "number" && album.id > 0
      ? `/album-cover/${album.id}`
      : undefined;

  const trackCountRaw = album.trackCount as unknown;
  const trackCount =
    typeof trackCountRaw === "number"
      ? trackCountRaw
      : Number(trackCountRaw ?? 0);

  return (
    <section className="flex flex-col gap-4">
      {/* Album header */}
      <header
        className="
          flex flex-col md:flex-row gap-4 items-start md:items-center
          bg-gradient-to-br from-white/5 via-emerald-900/20 to-black/60
          rounded-3xl
          p-4 md:p-5
          border border-white/5
          shadow-lg shadow-black/40
        "
      >
        <div
          className="
            relative
            h-24 w-24 md:h-32 md:w-32
            rounded-2xl
            overflow-hidden
            bg-gradient-to-br from-zinc-700 via-zinc-900 to-black
            flex-shrink-0
          "
        >
          {albumCoverUrl ? (
            <img
              src={albumCoverUrl}
              alt={`${album.album} cover`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-[11px] text-zinc-200">
              <div className="h-8 w-8 rounded-full border border-lime-400/70 flex items-center justify-center mb-1">
                <FontAwesomeIcon
                  icon={faWaveSquare}
                  className="text-lime-300 text-xs"
                />
              </div>
              <span className="uppercase tracking-[0.18em] text-[10px] text-lime-300/80">
                Album
              </span>
              <span className="text-zinc-400 mt-1 text-[10px]">
                No cover art
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="uppercase text-[11px] tracking-[0.2em] text-lime-300/80 mb-1">
            Now Browsing
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1 truncate">
            {album.album}
          </h1>
          <p className="text-sm md:text-base text-zinc-300 mb-1 truncate">
            {album.artist}
          </p>
          <p className="text-xs md:text-sm text-zinc-500">
            {trackCount} track{trackCount !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      {/* Track list */}
      <div className="mt-1 mb-4">
        <h2 className="text-sm uppercase tracking-[0.18em] text-zinc-400 mb-3">
          Tracks
        </h2>

        {tracks.length === 0 && (
          <div className="text-zinc-500 text-sm">
            No tracks found in this album.
          </div>
        )}

        <ul className="space-y-2">
          {tracks.map((track, index) => {
            const isActive = track.id === currentTrackId;

            const trackCoverUrl =
              track.id != null ? `/track-cover/${track.id}` : undefined;

            const durationSeconds =
              (track as any).durationSeconds ??
              (track as any).duration ??
              undefined;

            return (
              <li key={track.id}>
                <div
                  tabIndex={0}
                  role="button"
                  onClick={() => onSelectTrack(track)}
                  onKeyDown={(e) => handleKeyDown(e, track)}
                  className={`
                    group
                    relative
                    flex gap-3 md:gap-4
                    items-center
                    rounded-2xl
                    px-3 py-2.5 md:px-4 md:py-3
                    cursor-pointer
                    transition
                    outline-none
                    bg-gradient-to-r from-white/5 via-zinc-900/40 to-black/50
                    border ${isActive ? "border-lime-400/70" : "border-white/5"}
                    hover:border-lime-300/60
                    hover:bg-white/10
                    focus-visible:ring-2 focus-visible:ring-lime-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black
                  `}
                >
                  {/* Track number / playing indicator */}
                  <div className="w-6 text-xs md:text-sm text-zinc-500 flex justify-center">
                    {isActive ? (
                      <span className="text-lime-300">
                        <FontAwesomeIcon icon={faPlay} className="text-[10px]" />
                      </span>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div
                    className="
                      relative
                      h-12 w-12 md:h-14 md:w-14
                      rounded-xl
                      overflow-hidden
                      bg-gradient-to-br from-zinc-700 via-zinc-900 to-black
                      flex-shrink-0
                    "
                  >
                    {trackCoverUrl || albumCoverUrl ? (
                      <img
                        src={trackCoverUrl || albumCoverUrl}
                        alt={`${track.title} cover`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-300">
                        <span className="uppercase tracking-[0.2em] text-lime-300/90">
                          CD
                        </span>
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute inset-0 bg-lime-400/10 group-hover:bg-lime-400/15 transition pointer-events-none" />
                    )}
                  </div>

                  {/* Text info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`
                        text-sm md:text-base font-semibold truncate
                        ${isActive ? "text-lime-200" : "text-white"}
                      `}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs md:text-sm text-zinc-300 truncate">
                      {track.artist}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {track.album}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="ml-2 text-xs md:text-sm text-zinc-300">
                    {formatDuration(durationSeconds)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
