"use client";

import { Check, ChevronDown, Link2 } from "lucide-react";
import { Select } from "@base-ui/react/select";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const commonDisplaySizes = [21.5, 24, 27, 32, 34];
const commonAspectRatios = ["16:9", "16:10", "3:2", "4:3", "21:9", "32:9"];

const presets = [
  { label: "1 cm", length: 1, unit: "cm" },
  { label: "10 cm", length: 10, unit: "cm" },
  { label: "20 cm", length: 20, unit: "cm" },
  { label: "1 inch", length: 1, unit: "in" },
  { label: "Credit card", length: 8.56, unit: "cm" },
  { label: "Business card (H)", length: 5.4, unit: "cm" },
  { label: "A4 long edge", length: 29.7, unit: "cm" },
] as const;

type Unit = "cm" | "in";

function SubtleTabs<T extends string | number>({
  ariaLabel,
  items,
  selected,
  onSelect,
}: {
  ariaLabel: string;
  items: readonly { label: string; value: T }[];
  selected: T | null;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="ruler-subtle-tabs" role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const isSelected = selected === item.value;
        return (
          <button key={String(item.value)} role="tab" type="button" aria-selected={isSelected} onClick={() => onSelect(item.value)}>
            {isSelected && <motion.span className="ruler-subtle-tab-active" layoutId={ariaLabel} transition={{ type: "spring", stiffness: 500, damping: 38 }} aria-hidden="true" />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface DisplayInfo {
  logicalWidth: number;
  logicalHeight: number;
  physicalWidth: number;
  physicalHeight: number;
  dpr: number;
  userAgent: string;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function queryNumber(params: URLSearchParams, key: string, fallback: number, minimum: number, maximum: number) {
  const value = Number(params.get(key));
  return Number.isFinite(value) ? clamp(value, minimum, maximum) : fallback;
}

function parseAspect(aspect: string) {
  const match = aspect.trim().match(/^(\d+(?:\.\d+)?)\s*[:x/]\s*(\d+(?:\.\d+)?)$/i);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  return width > 0 && height > 0 ? [width, height] as const : null;
}

function physicalDisplayWidth(diagonalInches: number, aspect: string) {
  const [widthRatio, heightRatio] = parseAspect(aspect) ?? [16, 9];
  const diagonalCentimeters = diagonalInches * 2.54;
  return diagonalCentimeters * (widthRatio / Math.hypot(widthRatio, heightRatio));
}

export function ScreenRuler() {
  const [diagonal, setDiagonal] = useState(27);
  const [aspect, setAspect] = useState("16:9");
  const [length, setLength] = useState(10);
  const [unit, setUnit] = useState<Unit>("cm");
  const [displayInfo, setDisplayInfo] = useState<DisplayInfo>({ logicalWidth: 1440, logicalHeight: 900, physicalWidth: 1440, physicalHeight: 900, dpr: 1, userAgent: "Detecting browser details…" });
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextAspect = params.get("ratio") ?? "16:9";
    const nextUnit = params.get("unit");
    setDiagonal(queryNumber(params, "diagonal", 27, 10, 60));
    setLength(queryNumber(params, "length", 10, 0.1, 100));
    setAspect(parseAspect(nextAspect) ? nextAspect : "16:9");
    if (nextUnit === "cm" || nextUnit === "in") setUnit(nextUnit);

    const updateDisplayInfo = () => {
      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = window.screen.width || window.innerWidth;
      const logicalHeight = window.screen.height || window.innerHeight;
      setDisplayInfo({
        logicalWidth,
        logicalHeight,
        physicalWidth: Math.round(logicalWidth * dpr),
        physicalHeight: Math.round(logicalHeight * dpr),
        dpr,
        userAgent: navigator.userAgent,
      });
    };
    updateDisplayInfo();
    window.addEventListener("resize", updateDisplayInfo);
    setReady(true);
    return () => window.removeEventListener("resize", updateDisplayInfo);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams({ diagonal: String(diagonal), ratio: aspect, length: String(length), unit });
    window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
  }, [aspect, diagonal, length, ready, unit]);

  const displayWidth = useMemo(() => physicalDisplayWidth(diagonal, aspect), [aspect, diagonal]);
  const pixelsPerCentimeter = displayInfo.logicalWidth / displayWidth;
  const rulerWidth = length * pixelsPerCentimeter;
  const rulerHeight = 88;
  const ticks = Array.from({ length: Math.round(length * 10) + 1 }, (_, index) => index);
  const visibleLength = unit === "cm" ? length : length / 2.54;
  const visibleUnit = unit === "cm" ? "cm" : "in";
  const aspectOptions = commonAspectRatios.includes(aspect) ? commonAspectRatios : [aspect, ...commonAspectRatios];
  const selectedPreset = presets.find((preset) => preset.unit === unit && Math.abs(length - (preset.unit === "cm" ? preset.length : preset.length * 2.54)) < 0.005)?.label ?? null;

  function setVisibleLength(nextLength: number) {
    if (!Number.isFinite(nextLength)) return;
    setLength(clamp(unit === "cm" ? nextLength : nextLength * 2.54, 0.1, 100));
  }

  function applyPreset(preset: typeof presets[number]) {
    setUnit(preset.unit);
    setLength(preset.unit === "cm" ? preset.length : preset.length * 2.54);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="calculator-card ruler-calculator" aria-label="Screen ruler">
      <div className="ruler-controls">
        <section className="ruler-display-info" aria-label="Current display details">
          <div className="display-summary-row">
            <p className="display-summary">Logical: {displayInfo.logicalWidth} × {displayInfo.logicalHeight} <span>·</span> Physical: {displayInfo.physicalWidth} × {displayInfo.physicalHeight} <span>·</span> DPR: {displayInfo.dpr}</p>
            <button className="display-details-toggle" type="button" aria-expanded={detailsOpen} aria-controls="display-details" onClick={() => setDetailsOpen((open) => !open)}>Details <ChevronDown size={14} aria-hidden="true" /></button>
          </div>
          <dl className="display-details" id="display-details" hidden={!detailsOpen}>
            <div><dt>Logical</dt><dd>{displayInfo.logicalWidth} × {displayInfo.logicalHeight}</dd></div>
            <div><dt>Physical</dt><dd>{displayInfo.physicalWidth} × {displayInfo.physicalHeight}</dd></div>
            <div><dt>DPR</dt><dd>{displayInfo.dpr}</dd></div>
            <div className="display-ua"><dt>UA</dt><dd>{displayInfo.userAgent}</dd></div>
          </dl>
        </section>

        <div className="ruler-settings">
          <p className="eyebrow">Display settings</p>
          <div className="ruler-display-settings-row">
            <fieldset className="ruler-size-options">
              <legend>Display size (inches)</legend>
              <div className="ruler-size-control">
                <SubtleTabs ariaLabel="Common display sizes" items={commonDisplaySizes.map((value) => ({ label: `${value}\"`, value }))} selected={commonDisplaySizes.includes(diagonal) ? diagonal : null} onSelect={setDiagonal} />
                <label className="ruler-custom-size"><span>Custom</span><input type="number" min="10" max="60" step="0.1" value={diagonal} onChange={(event) => setDiagonal(clamp(Number(event.target.value), 10, 60))} aria-label="Custom display diagonal in inches" /></label>
              </div>
            </fieldset>
            <div className="ruler-input">
              <span>Aspect ratio</span>
              <Select.Root value={aspect} items={aspectOptions.map((value) => ({ label: value, value }))} onValueChange={(value) => { if (value) setAspect(value); }}>
                <Select.Trigger className="ruler-aspect-trigger" aria-label="Display aspect ratio"><Select.Value /><Select.Icon><ChevronDown size={14} aria-hidden="true" /></Select.Icon></Select.Trigger>
                <Select.Portal>
                  <Select.Positioner sideOffset={6} className="ruler-aspect-positioner">
                    <Select.Popup className="ruler-aspect-popup">
                      <Select.List>
                        {aspectOptions.map((value) => <Select.Item key={value} value={value} className="ruler-aspect-option"><Select.ItemText>{value}</Select.ItemText><Select.ItemIndicator><Check size={14} aria-hidden="true" /></Select.ItemIndicator></Select.Item>)}
                      </Select.List>
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>
          <div className="ruler-length-input">
            <span>Want to turn</span>
            <div><input type="number" min="0.1" max={unit === "cm" ? "100" : "39.37"} step="0.1" value={Number(visibleLength.toFixed(2))} onChange={(event) => setVisibleLength(Number(event.target.value))} aria-label={`Length to show in ${visibleUnit}`} /><div role="group" aria-label="Length unit"><button className={unit === "cm" ? "is-selected" : ""} type="button" onClick={() => setUnit("cm")}>cm</button><button className={unit === "in" ? "is-selected" : ""} type="button" onClick={() => setUnit("in")}>in</button></div></div>
          </div>
          <div className="ruler-presets" aria-label="Quick length presets">
            <span>Quick presets</span>
            <SubtleTabs ariaLabel="Quick length presets" items={presets.map((preset) => ({ label: preset.label, value: preset.label }))} selected={selectedPreset} onSelect={(label) => { const preset = presets.find((item) => item.label === label); if (preset) applyPreset(preset); }} />
          </div>
        </div>
      </div>

      <div className="ruler-output-column">
        <div className="ruler-result-heading">
          <p className="eyebrow">Result</p>
          <div className="ruler-reading"><strong>{visibleLength.toFixed(visibleLength < 10 ? 2 : 1)} {visibleUnit}</strong><span>{unit === "cm" ? `${(length / 2.54).toFixed(2)} in` : `${length.toFixed(2)} cm`}</span></div>
        </div>
        <div className="ruler-viewport" aria-label={`${length.toFixed(1)} centimeter ruler`}>
          <svg className="ruler-graphic" width={rulerWidth} height={rulerHeight} viewBox={`0 0 ${rulerWidth} ${rulerHeight}`} role="img" aria-label={`A ${length.toFixed(1)} centimeter ruler`}>
            <line x1="0" x2={rulerWidth} y1="1" y2="1" className="ruler-line" />
            {ticks.map((tick) => {
              const x = tick * (pixelsPerCentimeter / 10);
              const major = tick % 10 === 0;
              const half = tick % 5 === 0;
              const anchor = tick === 0 ? "start" : tick === ticks.length - 1 ? "end" : "middle";
              return <g key={tick}><line x1={x} x2={x} y1="1" y2={major ? 42 : half ? 31 : 20} className="ruler-tick" />{major && <text x={x} y="65" textAnchor={anchor} className="ruler-label">{unit === "cm" ? tick / 10 : (tick / 10 / 2.54).toFixed(1)}</text>}</g>;
            })}
          </svg>
        </div>
        <div className="ruler-result-footer">
          <p className="ruler-help">Estimated calibration: <strong>{pixelsPerCentimeter.toFixed(1)} CSS px/cm</strong> · Use 100% browser zoom for the closest result.</p>
          <button className="share-color" type="button" onClick={copyLink}>{copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}{copied ? "Link copied" : "Share this ruler"}</button>
        </div>
      </div>
    </section>
  );
}
