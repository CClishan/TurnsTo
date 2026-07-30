"use client";

import { Check, Contrast, Link2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buildParsedColor, parseColor, type ParsedColor } from "@/lib/color";
import { InputCopy } from "@/components/ui/input-copy";
import { ColorPicker } from "@/components/ui/color-picker";

const fallback = buildParsedColor(355, 0.43, 0.58, 1);

const swatches = ["transparent", "#000000", "#ffffff", "#00df1a", "#a855f7", "#ddccff"];

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

export function ColorConverter() {
  const [parsed, setParsed] = useState<ParsedColor>(fallback);
  const [ready, setReady] = useState(false);
  const [shared, setShared] = useState(false);

  function commit(next: ParsedColor) {
    setParsed(next);
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
          <ColorPicker
            value={parsed.hex}
            defaultFormat="hex"
            swatches={swatches}
            hideEyedropper
            onValueChange={(value) => {
              const next = parseColor(value);
              if (next) commit(next);
            }}
          />
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
