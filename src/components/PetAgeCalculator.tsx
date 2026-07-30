"use client";

import { Copy, Link2, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  type DogSize,
  type PetKind,
  humanEquivalentAge,
  lifeStage,
  petProfiles,
} from "@/lib/pet-age";

function getInitialValue(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get(name) ?? fallback;
}

function getInitialPet() {
  const initialPet = getInitialValue("pet", "");
  return petProfiles.some((profile) => profile.kind === initialPet) ? initialPet as PetKind : null;
}

const dogSizes: Array<{ value: DogSize; label: string }> = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export function PetAgeCalculator() {
  const [pet, setPet] = useState<PetKind | null>(getInitialPet);
  const [age, setAge] = useState(() => Number(getInitialValue("age", "3")) || 0);
  const [size, setSize] = useState<DogSize>(() => getInitialValue("size", "medium") as DogSize);
  const [hasCalculated, setHasCalculated] = useState(() => Boolean(getInitialPet() && getInitialValue("age", "")));
  const [copied, setCopied] = useState(false);
  const profile = petProfiles.find((item) => item.kind === pet);
  const ageMaximum = profile ? Math.max(profile.lifespan[1] * 2, age) : 0;
  const equivalentAge = pet ? humanEquivalentAge(pet, age, size) : null;
  const stage = pet ? lifeStage(pet, age) : null;

  function choosePet(nextPet: PetKind) {
    setPet(nextPet);
    setHasCalculated(false);
  }

  function chooseSize(nextSize: DogSize) {
    setSize(nextSize);
    setHasCalculated(false);
  }

  function chooseAge(nextAge: number) {
    setAge(nextAge);
    setHasCalculated(false);
  }

  function calculate() {
    if (!pet) return;

    const params = new URLSearchParams({ pet, age: String(age) });
    if (pet === "dog") params.set("size", size);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    setHasCalculated(true);
  }

  async function copyResult() {
    if (!profile || equivalentAge === null) return;
    const text = `${profile.label}, age ${age}: about ${Math.round(equivalentAge)} human-equivalent years.`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <>
      <section className={`calculator-card pet-calculator ${hasCalculated ? "has-result" : "is-awaiting-result"}`} aria-label="Pet age calculator">
        <div className="calculator-controls">
          <fieldset className="pet-picker">
            <legend>Choose a pet</legend>
            <div className="pet-options">
              {petProfiles.map((item) => (
                <button
                  key={item.kind}
                  className={`pet-option ${pet === item.kind ? "is-selected" : ""}`}
                  type="button"
                  aria-label={item.label}
                  aria-pressed={pet === item.kind}
                  title={item.label}
                  onClick={() => choosePet(item.kind)}
                >
                  <span className="pet-option-disc" aria-hidden="true">{item.emoji}</span>
                  <span className="pet-option-label">{item.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {pet && (
            <div className="field field-age">
              <div className="age-label-row">
                <label htmlFor="pet-age">Age in years</label>
                <output htmlFor="pet-age">{age}</output>
              </div>
              <input
                id="pet-age"
                type="range"
                min="0"
                max={ageMaximum}
                step="0.5"
                value={age}
                onChange={(event) => chooseAge(Number(event.target.value))}
              />
            </div>
          )}

          {pet === "dog" && (
            <fieldset className="field size-picker">
              <legend>Adult size</legend>
              <div className="size-options">
                {dogSizes.map((option) => (
                  <button
                    key={option.value}
                    className={size === option.value ? "is-selected" : ""}
                    type="button"
                    aria-pressed={size === option.value}
                    onClick={() => chooseSize(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {pet && <button className="calculate-button" type="button" onClick={calculate}>TurnsTo <span aria-hidden="true">→</span></button>}
        </div>

        {hasCalculated && profile && equivalentAge !== null && stage && (
          <div className="pet-result" aria-live="polite">
            <div className="result-kicker"><Sparkles size={15} aria-hidden="true" /> Human-equivalent age</div>
            <p><strong>{Math.round(equivalentAge)}</strong><span> years</span></p>
            <div className="result-meta">
              <span>{profile.emoji} {profile.label}</span>
              <span className="stage-pill">{stage}</span>
              <span>Typical lifespan {profile.lifespan[0]}–{profile.lifespan[1]} years</span>
            </div>
          </div>
        )}
      </section>
      {hasCalculated && profile && (
        <div className="result-footer">
          <p className="calculator-disclaimer">{profile.note}. A comparison tool, not a veterinary assessment.</p>
          <div className="result-actions">
            <button type="button" onClick={copyResult}><Copy size={15} aria-hidden="true" /> Copy result</button>
            <button type="button" onClick={copyLink}><Link2 size={15} aria-hidden="true" /> Share link</button>
            {(pet === "dog" || pet === "cat") && <a href={`/tools/pet-card?pet=${pet}&age=${age}`}>Make a pet card <span aria-hidden="true">→</span></a>}
            {copied && <span className="copy-status" role="status">Copied</span>}
          </div>
        </div>
      )}
    </>
  );
}
