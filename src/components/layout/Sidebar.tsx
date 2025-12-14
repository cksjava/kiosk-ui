import type { KeyboardEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCompactDisc,
  faHouse,
  faListUl,
} from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import type { Album, LibrarySection } from "../../types";
import { AlbumList } from "../library/AlbumList";

interface SidebarProps {
  activeSection: LibrarySection;
  onChangeSection: (section: LibrarySection) => void;

  albums: Album[];
  selectedAlbum: Album | null;
  onSelectAlbum: (album: Album) => void;
}

const navItems: { id: LibrarySection; label: string; icon: any }[] = [
  { id: "home", label: "Home", icon: faHouse },
  { id: "albums", label: "Albums", icon: faCompactDisc },
  { id: "artists", label: "Artists", icon: faUser },
  { id: "tracks", label: "Tracks", icon: faListUl },
];

export const Sidebar = ({
  activeSection,
  onChangeSection,
  albums,
  selectedAlbum,
  onSelectAlbum,
}: SidebarProps) => {
  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    section: LibrarySection,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChangeSection(section);
    }
  };

  return (
    <aside
      className="
        h-full w-64
        bg-gradient-to-b from-black/80 via-zinc-900/90 to-black/90
        border-r border-white/5
        flex flex-col
        text-zinc-100
        backdrop-blur-xl
      "
    >
      {/* App header */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3">
        <div
          className="
            h-10 w-10 rounded-2xl
            bg-gradient-to-br from-lime-400/90 via-emerald-400/80 to-cyan-400/80
            flex items-center justify-center
            shadow-lg shadow-lime-500/40
          "
        >
          <FontAwesomeIcon icon={faCompactDisc} className="text-black text-xl" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-[0.15em] text-lime-300/80">
            Graixl
          </span>
          <span className="font-semibold text-base leading-tight">
            Sonic Kiosk
          </span>
        </div>
      </div>

      {/* Navigation (fixed height, not scrollable) */}
      <nav className="mt-2 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.id === activeSection;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onChangeSection(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    group
                    w-full
                    flex items-center gap-3
                    px-3 py-2.5
                    rounded-xl
                    text-sm
                    transition
                    outline-none
                    ${
                      isActive
                        ? "bg-lime-400/15 text-lime-200 border border-lime-400/40"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white border border-transparent"
                    }
                    focus-visible:ring-2 focus-visible:ring-lime-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black
                  `}
                >
                  <span
                    className={`
                      flex items-center justify-center
                      h-8 w-8 rounded-lg
                      bg-black/40
                      group-hover:bg-black/60
                      ${isActive ? "text-lime-300" : "text-zinc-300"}
                    `}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-sm" />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Albums list area: takes remaining height and is scrollable */}
      <div className="mt-4 flex-1 overflow-hidden px-2">
        {activeSection === "albums" && (
          <AlbumList
            albums={albums}
            selectedAlbum={selectedAlbum}
            onSelectAlbum={onSelectAlbum}
          />
        )}
      </div>

      {/* Footer helper text */}
      <div className="px-4 pb-4 pt-2 text-[11px] text-zinc-500">
        <p>
          Use <span className="text-zinc-300">Tab</span> and{" "}
          <span className="text-zinc-300">Enter</span> to navigate.
        </p>
      </div>
    </aside>
  );
};
