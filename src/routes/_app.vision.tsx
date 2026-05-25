import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Compass, Edit2, Banknote, Heart, Laptop, Video, TrendingUp, Globe } from "lucide-react";
import { Card } from "@/components/Card";
import { useDailyStore, useSettingsStore } from "@/stores";
import * as storage from "@/lib/storage";
import { todayKey } from "@/lib/date";

const ICON_MAP: Record<string, React.ComponentType<{ size: number; strokeWidth: number }>> = {
  Banknote,
  Heart,
  Laptop,
  Video,
  TrendingUp,
  Globe,
};

export const Route = createFileRoute("/_app/vision")({
  head: () => ({
    meta: [
      { title: "Vision Board — Level Up Girl" },
      { name: "description", content: "Goals, intentions, and the woman you are becoming." },
      { property: "og:title", content: "Vision Board — Level Up Girl" },
      { property: "og:description", content: "Goals, intentions, and the woman you are becoming." },
      { property: "og:url", content: "/vision" },
    ],
  }),
  component: VisionPage,
});

function VisionPage() {
  const slate = useDailyStore((s) => s.slate);
  const patch = useDailyStore((s) => s.patch);
  const goals = useSettingsStore((s) => s.goals);
  const setGoalText = useSettingsStore((s) => s.setGoalText);

  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState<number | null>(null);

  // yesterday affirmation
  const yest = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const data = storage.getDaily<{ affirmation?: string }>(todayKey(d));
    return data?.affirmation ?? "";
  })();

  useEffect(() => () => { if (imgUrl) URL.revokeObjectURL(imgUrl); }, [imgUrl]);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(URL.createObjectURL(f));
  };

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-12 space-y-6">
      <header className="flex items-center gap-3">
        <Compass size={24} strokeWidth={1.5} className="text-[var(--primary)]" />
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Vision Board</h1>
          <p className="font-display italic text-[var(--muted-foreground)] mt-1">
            The life you're building, made visible.
          </p>
        </div>
      </header>

      {/* Image card */}
      <Card className="p-0 overflow-hidden">
        {imgUrl ? (
          <div className="relative">
            <img src={imgUrl} alt="Vision board" className="w-full max-h-[480px] object-cover" />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute top-3 right-3 bg-card/90 backdrop-blur rounded-[var(--radius-button)] px-3 py-1.5 text-xs border border-border hover:bg-card"
            >
              Replace
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-16 flex flex-col items-center gap-3 text-[var(--muted-foreground)] hover:text-foreground transition-colors"
          >
            <ImagePlus size={36} strokeWidth={1.5} />
            <span className="font-display italic text-lg">Re-upload your vision board</span>
            <span className="text-xs">JPG, PNG, or WEBP</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </Card>

      {/* Goal cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {goals.map((g, i) => {
          const IconComponent = ICON_MAP[g.icon];
          return (
            <div
              key={i}
              className="group relative rounded-[var(--radius)] p-6 border border-border shadow-card flex flex-col items-center text-center min-h-[180px] justify-center"
              style={{ background: "var(--highlight)" }}
              onDoubleClick={() => setEditing(i)}
            >
              {editing !== i && (
                <Edit2
                  size={14}
                  strokeWidth={1.5}
                  className="absolute top-3 right-3 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
              {IconComponent && (
                <IconComponent size={20} strokeWidth={1.5} className="text-[var(--primary)]" />
              )}
              {editing === i ? (
                <input
                  autoFocus
                  defaultValue={g.text}
                  onBlur={(e) => { setGoalText(i, e.target.value); setEditing(null); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setGoalText(i, (e.target as HTMLInputElement).value);
                      setEditing(null);
                    }
                    if (e.key === "Escape") setEditing(null);
                  }}
                  className="mt-3 w-full bg-transparent border-b border-[var(--primary)] font-display text-base text-center outline-none py-1"
                />
              ) : (
                <p className="font-display text-lg mt-3 leading-snug select-none" title="Double-click to edit">{g.text}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Shloka */}
      <Card className="text-center py-10">
        <p className="font-display text-2xl md:text-3xl leading-relaxed whitespace-pre-line">
          {"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते संगोऽस्त्वकर्मणि॥"}
        </p>
        <p className="font-sans text-sm text-[var(--muted-foreground)] mt-4 italic">
          You have the right to perform your actions, but never to the fruits of your actions.
        </p>
      </Card>

      {/* Affirmation */}
      <Card>
        <h3 className="font-display text-xl mb-3">Today's affirmation</h3>
        <textarea
          value={slate.affirmation}
          onChange={(e) => patch({ affirmation: e.target.value })}
          rows={3}
          placeholder="Write your affirmation for today…"
          className="w-full bg-transparent border border-border rounded-md p-3 text-sm focus:border-[var(--primary)] outline-none"
        />
        {yest && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
              Yesterday's affirmation
            </p>
            <p className="font-display italic mt-1 text-lg">{yest}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
