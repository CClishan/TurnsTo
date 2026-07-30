"use client";

import { Check, Contrast, Link2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buildParsedColor, parseColor, type ParsedColor } from "@/lib/color";
import { InputCopy } from "@/components/ui/input-copy";

const fallback = buildParsedColor(355, 0.43, 0.58, 1);

const swatches = [
  { label: "Transparent", color: "#ffffff", alpha: 0 },
  { label: "Black", color: "#000000", alpha: 1 },
  { label: "White", color: "#ffffff", alpha: 1 },
  { label: "Green", color: "#00df1a", alpha: 1 },
  { label: "Purple", color: "#a855f7", alpha: 1 },
  { label: "Lilac", color: "#ddccff", alpha: 1 },
];

function luminance(red: number, green: number, blue: number) {
  const toLinear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);
}

function contrastRatio(first: number, second: number) {
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function rating(ratio: number) {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "Fails";
}

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function ColorConverter() {
  const [parsed, setParsed] = useState<ParsedColor>(fallback);
  const [draft, setDraft] = useState(fallback.hex);
  const [ready, setReady] = useState(false);
  const [shared, setShared] = useState(false);

  function commit(next: ParsedColor) {
    setParsed(next);
    setDraft(next.hex);
  }

  function updateHsv(next: Partial<Pick<ParsedColor, "h" | "s" | "v" | "a">>) {
    commit(buildParsedColor(next.h ?? parsed.h, next.s ?? parsed.s, next.v ?? parsed.v, next.a ?? parsed.a));
  }

  function updateFromSurface(clientX: number, clientY: number, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    updateHsv({ s: clamp((clientX - rect.left) / rect.width), v: 1 - clamp((clientY - rect.top) / rect.height) });
  }

  function handleDraftChange(value: string) {
    setDraft(value);
    const next = parseColor(value);
    if (next) setParsed(next);
  }

  function handleSwatchPick(color: string, alpha: number) {
    const next = parseColor(color);
    if (next) commit(buildParsedColor(next.h, next.s, next.v, alpha));
  }

  useEffect(() => {
    const sharedColor = new URLSearchParams(window.location.search).get("color");
    const next = sharedColor ? parseColor(sharedColor) : null;
    if (next) commit(next);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.history.replaceState(null, "", `${window.location.pathname}?color=${encodeURIComponent(parsed.hex)}`);
  }, [parsed.hex, ready]);

  const contrast = useMemo(() => {
    const current = luminance(parsed.r, parsed.g, parsed.b);
    return {
      white: contrastRatio(current, 1),
      black: contrastRatio(current, 0),
    };
  }, [parsed]);

  async function share() {
    await navigator.clipboard.writeText(window.location.href);
    setShared(true);
    window.setTimeout(() => setShared(false), 1400);
  }

  const cssValues = [
    ["HEX", parsed.hex],
    ["RGB", parsed.rgb],
    ["HSL", parsed.hsl],
    ["OKLCH", parsed.oklch],
  ] as const;

  return (
    <section className="calculator-card color-calculator" aria-label="Color converter">
      <div className="color-picker-column">
        <p className="eyebrow">Pick or paste a color</p>
        <div className="color-picker-shell">
          <div
            className="color-surface"
            role="slider"
            aria-label="Saturation and brightness"
            aria-valuetext={`${Math.round(parsed.s * 100)}% saturation, ${Math.round(parsed.v * 100)}% brightness`}
            tabIndex={0}
            style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${parsed.h} 100% 50%))` }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              updateFromSurface(event.clientX, event.clientY, event.currentTarget);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromSurface(event.clientX, event.clientY, event.currentTarget);
            }}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 0.1 : 0.02;
              if (event.key === "ArrowLeft") updateHsv({ s: clamp(parsed.s - step) });
              else if (event.key === "ArrowRight") updateHsv({ s: clamp(parsed.s + step) });
              else if (event.key === "ArrowUp") updateHsv({ v: clamp(parsed.v + step) });
              else if (event.key === "ArrowDown") updateHsv({ v: clamp(parsed.v - step) });
              else return;
              event.preventDefault();
            }}
          >
            <span className="color-surface-thumb" style={{ left: `${parsed.s * 100}%`, top: `${(1 - parsed.v) * 100}%`, backgroundColor: parsed.hex }} aria-hidden="true" />
          </div>

          <input className="color-range color-hue-range" type="range" min="0" max="360" value={parsed.h} onChange={(event) => updateHsv({ h: Number(event.target.value) })} aria-label="Hue" />
          <input className="color-range color-alpha-range" type="range" min="0" max="100" value={Math.round(parsed.a * 100)} onChange={(event) => updateHsv({ a: Number(event.target.value) / 100 })} aria-label="Alpha" style={{ backgroundImage: `linear-gradient(to right, transparent, rgb(${parsed.r}, ${parsed.g}, ${parsed.b})), conic-gradient(var(--border) 0 25%, transparent 0 50%, var(--border) 0 75%, transparent 0)`, backgroundSize: "100% 100%, 0.8rem 0.8rem" }} />

          <div className="color-swatches" aria-label="Color swatches">
            {swatches.map((swatch) => (
              <button key={swatch.label} className={swatch.alpha === 0 ? "is-transparent" : ""} type="button" aria-label={`Select ${swatch.label}`} onClick={() => handleSwatchPick(swatch.color, swatch.alpha)}>
                <span style={{ backgroundColor: swatch.color, opacity: swatch.alpha }} />
              </button>
            ))}
          </div>

          <div className="color-entry-row">
            <label><span>#</span><input value={draft.replace(/^#/, "")} onChange={(event) => handleDraftChange(`#${event.target.value}`)} onBlur={() => setDraft(parsed.hex)} aria-label="Hex value" /></label>
            <label><input type="number" min="0" max="100" value={Math.round(parsed.a * 100)} onChange={(event) => updateHsv({ a: Number(event.target.value) / 100 })} aria-label="Alpha" /><span>%</span></label>
          </div>
        </div>
      </div>
      <div className="color-output-column">
        <div className="color-preview" style={{ backgroundColor: parsed.hex }}>
          <span>{parsed.hex}</span>
        </div>
        <div className="format-grid">
          {cssValues.map(([label, value]) => <InputCopy key={label} label={label} value={value} variant="icon" />)}
        </div>
        <div className="contrast-panel">
          <div className="contrast-heading"><Contrast size={16} aria-hidden="true" /> Contrast on this color</div>
          <div className="contrast-row"><span className="sample-white">Aa</span><span>White text</span><strong>{contrast.white.toFixed(2)}:1</strong><em>{rating(contrast.white)}</em></div>
          <div className="contrast-row"><span className="sample-black">Aa</span><span>Black text</span><strong>{contrast.black.toFixed(2)}:1</strong><em>{rating(contrast.black)}</em></div>
        </div>
        <button className="share-color" type="button" onClick={share}>{shared ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}{shared ? "Link copied" : "Share this color"}</button>
      </div>
    </section>
  );
}
