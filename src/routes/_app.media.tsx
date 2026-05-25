import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Upload, Volume2, Music2 } from "lucide-react";
import { Card } from "@/components/Card";
import { PillButton } from "@/components/PillButton";
import { EmptyState } from "@/components/EmptyState";
import { useMediaStore } from "@/stores";

export const Route = createFileRoute("/_app/media")({
  head: () => ({
    meta: [
      { title: "Media — Level Up Girl" },
      { name: "description", content: "Morning and evening affirmations, yoga, pranayama, and meditation videos." },
      { property: "og:title", content: "Media — Level Up Girl" },
      { property: "og:description", content: "Affirmations and yoga videos for your daily rhythm." },
      { property: "og:url", content: "/media" },
    ],
  }),
  component: MediaPage,
});

function fmt(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function AudioPlayer({ title, prompt }: { title: string; prompt: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(0.8);
  const ref = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (url) URL.revokeObjectURL(url);
    setUrl(URL.createObjectURL(f));
    setPlaying(false);
    setCur(0);
  };

  return (
    <Card>
      <h3 className="font-display text-xl">{title}</h3>
      {!url ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-4 w-full py-10 border border-dashed border-border rounded-[var(--radius)] flex flex-col items-center gap-2 text-[var(--muted-foreground)] hover:text-foreground hover:border-[var(--primary)] transition-colors"
        >
          <Upload size={24} strokeWidth={1.5} />
          <span className="font-display italic">{prompt}</span>
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <audio
            ref={ref}
            src={url}
            onTimeUpdate={(e) => setCur((e.target as HTMLAudioElement).currentTime)}
            onLoadedMetadata={(e) => setDur((e.target as HTMLAudioElement).duration)}
            onEnded={() => setPlaying(false)}
            onVolumeChange={(e) => setVol((e.target as HTMLAudioElement).volume)}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!ref.current) return;
                if (playing) { ref.current.pause(); setPlaying(false); }
                else { ref.current.play(); setPlaying(true); }
              }}
              className="w-11 h-11 rounded-full bg-[var(--primary)] text-white flex items-center justify-center hover:bg-[#b3736a] transition-colors"
            >
              {playing ? <Pause size={18} strokeWidth={1.8} /> : <Play size={18} strokeWidth={1.8} />}
            </button>
            <div className="flex-1">
              <div
                className="h-1.5 bg-[var(--highlight)] rounded-full cursor-pointer relative"
                onClick={(e) => {
                  if (!ref.current || !dur) return;
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  ref.current.currentTime = pct * dur;
                }}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-[var(--primary)] rounded-full"
                  style={{ width: dur ? `${(cur / dur) * 100}%` : "0%" }}
                />
              </div>
              <p className="font-mono text-xs text-[var(--muted-foreground)] mt-1.5">
                {fmt(cur)} / {fmt(dur)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 size={14} strokeWidth={1.5} className="text-[var(--muted-foreground)]" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={vol}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVol(v);
                if (ref.current) ref.current.volume = v;
              }}
              className="flex-1 accent-[var(--primary)]"
            />
            <button onClick={() => fileRef.current?.click()} className="text-xs text-[var(--muted-foreground)] hover:text-foreground">
              Replace
            </button>
          </div>
        </div>
      )}
      <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
    </Card>
  );
}

function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const m =
    s.match(/youtu\.be\/([\w-]{11})/) ||
    s.match(/[?&]v=([\w-]{11})/) ||
    s.match(/embed\/([\w-]{11})/) ||
    s.match(/^([\w-]{11})$/);
  return m ? m[1] : null;
}

function VideoCard({ slot, label }: { slot: string; label: string }) {
  const videos = useMediaStore((s) => s.videos);
  const setVideo = useMediaStore((s) => s.setVideo);
  const [draft, setDraft] = useState(videos[slot] ?? "");
  useEffect(() => setDraft(videos[slot] ?? ""), [videos, slot]);

  const id = parseYouTubeId(videos[slot] ?? "");

  return (
    <Card>
      <h3 className="font-display text-lg">{label}</h3>
      <div className="flex gap-2 mt-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Paste YouTube URL"
          className="flex-1 bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-sm py-1.5"
        />
        <PillButton onClick={() => setVideo(slot, draft)}>Save</PillButton>
      </div>
      {id ? (
        <div className="mt-4 aspect-video rounded-[var(--radius-button)] overflow-hidden border border-border">
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            title={label}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : videos[slot] ? (
        <p className="mt-3 text-xs italic text-[var(--muted-foreground)]">Couldn't parse a video ID from that URL.</p>
      ) : null}
    </Card>
  );
}

function MediaPage() {
  const videos = useMediaStore((s) => s.videos);
  const hasAny = Object.keys(videos).length > 0;

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-12 space-y-6">
      <header className="flex items-center gap-3">
        <Music2 size={24} strokeWidth={1.5} className="text-[var(--primary)]" />
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Media</h1>
          <p className="font-display italic text-[var(--muted-foreground)] mt-1">
            Sound and movement for the rhythm of your day.
          </p>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        <AudioPlayer title="Morning Affirmations" prompt="Re-upload your morning affirmation" />
        <AudioPlayer title="Evening Affirmations" prompt="Re-upload your evening affirmation" />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <VideoCard slot="yoga" label="Yoga / Surya Namaskar" />
        <VideoCard slot="pranayama" label="Pranayama" />
        <VideoCard slot="meditation" label="Meditation" />
      </div>

      {!hasAny && (
        <p className="font-display italic text-center text-[var(--muted-foreground)]">
          Add your affirmation audios and yoga videos to get started.
        </p>
      )}
    </div>
  );
}
