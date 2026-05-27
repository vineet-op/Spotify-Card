"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type Transition,
} from "motion/react";
import Image from "next/image";
import {
  Airplay,
  CirclePlus,
  PauseIcon,
  SkipBack,
  SkipForwardIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SONG = {
  title: "Tell Me",
  artists: "Karan Aujla, OneRepublic, Ikky",
  marquee: "Tell Me • Karan Aujla, OneRepublic, Ikky",
  art: "/karan.jpg",
  currentSeconds: 31,
  durationSeconds: 187,
  device: "Phone speaker",
};

const PILL_ART_SIZE = 48;
const PILL_ART_RADIUS = PILL_ART_SIZE / 2;
const EXPANDED_ART_RADIUS = 16;

// Pill geometry — must match the pill's padding exactly so the
// absolutely-positioned image lines up with where it used to sit.
const PILL_PADDING_X = 8; // px-2  → 0.5rem = 8px
const PILL_PADDING_Y = 8; // py-2  → 0.5rem = 8px
const PILL_IMAGE_GAP = 8; // gap between image and text area

// Total left-padding the pill panel needs in collapsed mode so the
// text starts after the floating image:  padding + image + gap
const PILL_PANEL_PL = PILL_PADDING_X + PILL_ART_SIZE + PILL_IMAGE_GAP; // 64 px

const MARQUEE_MASK =
  "mask-[linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]";

const LAYOUT_TRANSITION: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.8,
};

const ENTER_REVEAL: Transition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
};

const EXIT_FAST: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 1, 1],
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function SongMarquee({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const check = () => {
      setShouldScroll(measure.offsetWidth > container.clientWidth);
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(container);
    return () => observer.disconnect();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`relative h-5 w-full overflow-hidden ${MARQUEE_MASK}`}
    >
      <span
        ref={measureRef}
        className="pointer-events-none absolute text-sm font-medium whitespace-nowrap opacity-0"
        aria-hidden
      >
        {text}
      </span>

      {shouldScroll ? (
        <motion.div
          className="flex w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <span className="pr-8 text-sm font-medium whitespace-nowrap text-white">
            {text}
          </span>
          <span
            className="pr-8 text-sm font-medium whitespace-nowrap text-white"
            aria-hidden
          >
            {text}
          </span>
        </motion.div>
      ) : (
        <p className="truncate text-sm font-medium text-white">{text}</p>
      )}
    </div>
  );
}

function ProgressWave({ progress }: { progress: number }) {
  const width = 300;
  const y = 12;
  const x = Math.max(0, Math.min(width, progress * width));
  const bump = 10;

  const playedPath =
    x <= bump
      ? `M 0 ${y} L ${x} ${y}`
      : `M 0 ${y} L ${x - bump} ${y} Q ${x - bump / 2} ${y} ${x} ${y}`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} 24`}
        className="h-6 w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <line
          x1="0"
          y1={y}
          x2={width}
          y2={y}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d={playedPath}
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx={x} cy={y} r="5" fill="white" />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-white/85">
        <span>{formatTime(SONG.currentSeconds)}</span>
        <span>{formatTime(SONG.durationSeconds)}</span>
      </div>
    </div>
  );
}

function PillControls() {
  return (
    <div className="flex w-full justify-center gap-1">
      <button
        type="button"
        className="rounded-full p-1.5 text-white"
        aria-label="Previous track"
        onClick={(e) => e.stopPropagation()}
      >
        <SkipBack className="h-4 w-4 fill-white" />
      </button>
      <button
        type="button"
        className="rounded-full p-1.5 text-white"
        aria-label="Pause"
        onClick={(e) => e.stopPropagation()}
      >
        <PauseIcon className="h-4 w-4 fill-white" />
      </button>
      <button
        type="button"
        className="rounded-full p-1.5 text-white"
        aria-label="Next track"
        onClick={(e) => e.stopPropagation()}
      >
        <SkipForwardIcon className="h-4 w-4 fill-white" />
      </button>
    </div>
  );
}

function ExpandedControls({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 text-xs text-white/90">
        <div className="flex min-w-0 items-center gap-1.5">
          <SpotifyIcon className="h-4 w-4 shrink-0 text-white" />
          <span className="truncate">{SONG.device}</span>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] text-white"
        >
          Media output
        </button>
      </div>

      <ProgressWave progress={progress} />

      <div className="flex items-center justify-between px-1 text-white">
        <button
          type="button"
          className="rounded-full p-2"
          aria-label="Add to library"
        >
          <CirclePlus className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="rounded-full p-2"
          aria-label="Previous"
        >
          <SkipBack className="h-6 w-6 fill-white" />
        </button>
        <button type="button" className="rounded-full p-2" aria-label="Pause">
          <PauseIcon className="h-9 w-9 fill-white" />
        </button>
        <button type="button" className="rounded-full p-2" aria-label="Next">
          <SkipForwardIcon className="h-6 w-6 fill-white" />
        </button>
        <button type="button" className="rounded-full p-2" aria-label="Cast">
          <Airplay className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

export function SpotifyPlayer() {
  const [expanded, setExpanded] = useState(false);
  const progress = SONG.currentSeconds / SONG.durationSeconds;

  return (
    <LayoutGroup id="spotify-player">
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.button
            key="backdrop"
            type="button"
            aria-label="Close player"
            className="fixed inset-0 z-40 cursor-default "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={EXIT_FAST}
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/*
        ── Outer container ────────────────────────────────────────────────────
        position:relative is critical — the album art is position:absolute
        in pill mode and must be positioned relative to this container.
      */}
      <div
        className={`relative z-50 flex flex-col items-center ${
          expanded ? "w-[min(360px,calc(100vw-2rem))]" : "w-[230px]"
        }`}
      >
        {/*
          ── ALBUM ART — single element, always rendered ─────────────────────

          THE FIX: One element that lives as a SIBLING of player-panel, never
          a child. This breaks the nested-layoutId problem where player-panel's
          own layout animation was corrupting the coordinate space used by the
          old layoutId="album-art" that was nested inside it.

          • Pill mode  → position:absolute, z-10, overlays the left side of
                         the red pill. The pill itself gets pl-[64px] to leave
                         the exact same visual gap the image used to occupy.

          • Expanded   → position:relative, flows as a normal flex-column item
                         above the text and the card.

          • `layout`   → Framer Motion measures the bounding rect in both states
                         and smoothly springs between them — no flash possible
                         because there is only ONE element (no two-instance
                         layoutId conflict).
        */}
        <motion.div
          layout
          transition={LAYOUT_TRANSITION}
          className="overflow-hidden"
          style={
            expanded
              ? {
                  // ── EXPANDED: normal flow, full width minus horizontal padding
                  position: "relative",
                  zIndex: "auto",
                  borderRadius: EXPANDED_ART_RADIUS,
                  width: "calc(100% - 2rem)", // matches px-4 on each side
                  aspectRatio: "1 / 1",
                  margin: `0.5rem 1rem 0`,
                }
              : {
                  // ── PILL: absolute, sits on top of the pill's left side
                  position: "absolute",
                  zIndex: 10,
                  borderRadius: PILL_ART_RADIUS,
                  width: PILL_ART_SIZE,
                  height: PILL_ART_SIZE,
                  top: PILL_PADDING_Y, // lines up with pill's py-2
                  left: PILL_PADDING_X, // lines up with pill's px-2
                }
          }
        >
          <Image
            src={SONG.art}
            alt={`${SONG.title} album art`}
            fill
            className="object-cover"
            sizes="(max-width: 360px) 90vw, 300px"
            priority
          />
        </motion.div>

        {/*
          ── SONG TITLE + ARTIST ────────────────────────────────────────────
          Fades in on expand. Completely separate from the album art so the
          image morph is never affected by this opacity animation.
        */}
        <AnimatePresence mode="popLayout">
          {expanded && (
            <motion.div
              key="hero-text"
              className="w-full px-4 pb-3 pt-3 text-center"
              initial={{ opacity: 0, y: -12, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ ...ENTER_REVEAL, delay: 0.08 }}
            >
              <h2 className="text-2xl font-bold text-zinc-900">{SONG.title}</h2>
              <p className="mt-1 text-sm text-zinc-600">{SONG.artists}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/*
          ── PLAYER PANEL ───────────────────────────────────────────────────
          Morphs from pill → card via layoutId="player-panel".

          Pill mode: pl-[64px] = PILL_PADDING_X(8) + image(48) + gap(8) = 64px
          This reserves the exact space that the absolutely-positioned image
          visually occupies, so text + controls start at the right position.

          The album art is NOT inside this element anymore — that was the
          root cause of the flash.
        */}
        <motion.div
          layoutId="player-panel"
          layout
          transition={LAYOUT_TRANSITION}
          style={{ borderRadius: expanded ? 16 : 9999 }}
          className={`w-full bg-red-900 ${
            expanded
              ? "p-4 shadow-lg shadow-black/15"
              : `cursor-pointer py-2 pr-2 pl-[${PILL_PANEL_PL}px]`
          }`}
          onClick={() => {
            if (!expanded) setExpanded(true);
          }}
          onKeyDown={(e) => {
            if (!expanded && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setExpanded(true);
            }
          }}
          role={expanded ? undefined : "button"}
          tabIndex={expanded ? undefined : 0}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {expanded ? (
              <motion.div
                key="expanded-controls"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={EXIT_FAST}
              >
                <ExpandedControls progress={progress} />
              </motion.div>
            ) : (
              /*
                Pill content: image is gone from here.
                Only the marquee text and transport controls remain.
                The absolutely-positioned image above provides the visual.
              */
              <motion.div
                key="pill-content"
                className="flex flex-col justify-center gap-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={EXIT_FAST}
              >
                <SongMarquee text={SONG.marquee} />
                <PillControls />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
