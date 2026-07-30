export type PetKind =
  | "dog"
  | "cat"
  | "rabbit"
  | "hamster"
  | "guinea-pig"
  | "turtle"
  | "parrot"
  | "fish";

export type DogSize = "small" | "medium" | "large";

export interface PetProfile {
  kind: PetKind;
  label: string;
  emoji: string;
  lifespan: [number, number];
  note: string;
}

export const petProfiles: PetProfile[] = [
  { kind: "dog", label: "Dog", emoji: "🐕", lifespan: [10, 18], note: "Size-aware AVMA-style milestones" },
  { kind: "cat", label: "Cat", emoji: "🐈", lifespan: [12, 18], note: "Feline life-stage milestones" },
  { kind: "rabbit", label: "Rabbit", emoji: "🐇", lifespan: [8, 12], note: "Lifespan-scaled life-stage estimate" },
  { kind: "hamster", label: "Hamster", emoji: "🐹", lifespan: [2, 3], note: "Lifespan-scaled life-stage estimate" },
  { kind: "guinea-pig", label: "Guinea pig", emoji: "🐹", lifespan: [5, 7], note: "Lifespan-scaled life-stage estimate" },
  { kind: "turtle", label: "Turtle", emoji: "🐢", lifespan: [20, 40], note: "Species and care conditions vary widely" },
  { kind: "parrot", label: "Parrot", emoji: "🦜", lifespan: [25, 50], note: "Species and size vary widely" },
  { kind: "fish", label: "Ornamental fish", emoji: "🐠", lifespan: [3, 10], note: "Species and water conditions vary widely" },
];

const dogAdultRates: Record<DogSize, number> = {
  small: 4,
  medium: 5,
  large: 6,
};

function lifeStageEstimate(age: number, lifespan: number) {
  const share = Math.max(0, age) / lifespan;
  if (share <= 0.15) return (share / 0.15) * 18;
  return 18 + Math.min((share - 0.15) / 0.85, 1.5) * 62;
}

export function humanEquivalentAge(kind: PetKind, age: number, dogSize: DogSize = "medium") {
  const safeAge = Math.max(0, age);

  if (kind === "dog") {
    if (safeAge <= 1) return safeAge * 15;
    if (safeAge <= 2) return 15 + (safeAge - 1) * 9;
    return 24 + (safeAge - 2) * dogAdultRates[dogSize];
  }

  if (kind === "cat") {
    if (safeAge <= 1) return safeAge * 15;
    if (safeAge <= 2) return 15 + (safeAge - 1) * 9;
    return 24 + (safeAge - 2) * 4;
  }

  const profile = petProfiles.find((pet) => pet.kind === kind)!;
  return lifeStageEstimate(safeAge, (profile.lifespan[0] + profile.lifespan[1]) / 2);
}

export function lifeStage(kind: PetKind, age: number) {
  const profile = petProfiles.find((pet) => pet.kind === kind)!;
  const midpoint = (profile.lifespan[0] + profile.lifespan[1]) / 2;
  const proportion = age / midpoint;
  if (proportion < 0.15) return "young";
  if (proportion < 0.7) return "adult";
  if (proportion < 1) return "mature";
  return "senior";
}
