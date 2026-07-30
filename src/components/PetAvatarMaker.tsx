import { useEffect, useState } from "react";

type PetType = "dog" | "cat";
type CatCategory = "body" | "pattern" | "ear" | "eye" | "nose" | "noseMouthPattern" | "socks" | "tail";

type Option = { id: string; label?: string };

const coats = [
  { id: "sand", label: "Sand", value: "#d9b98e" },
  { id: "chestnut", label: "Chestnut", value: "#9d6b50" },
  { id: "charcoal", label: "Charcoal", value: "#52555a" },
  { id: "snow", label: "Snow", value: "#f1eee6" },
];

const collars = [
  { id: "blue", label: "Blue", value: "#3f6bff" },
  { id: "coral", label: "Coral", value: "#e7796d" },
  { id: "leaf", label: "Leaf", value: "#5f9a72" },
  { id: "plum", label: "Plum", value: "#876a9e" },
];

const catOptions: Record<CatCategory, Option[]> = {
  body: ["cobby", "foreign", "oriental", "semi-cobby", "semi-foreign", "substantial"].map((id) => ({ id })),
  pattern: [
    ...["white", "black", "brown", "gray", "brown-tabby", "cream-tabby", "red-tabby", "silver-tabby", "yellow-tabby"].map((id) => ({ id: `${id}__basic` })),
    ...["black", "brown", "brown-tabby", "cream-tabby", "gray", "red-tabby", "silver-tabby", "yellow-tabby"].flatMap((coat) => Array.from({ length: 9 }, (_, index) => ({ id: `${coat}__bicolor_${index + 1}` }))),
    ...["bengal__pattern_1", "brown-american-shorthair__pattern_1", "calico__pattern_1", "calico__pattern_2", "calico__pattern_3", "calico-tabby__pattern_4", "cream-softlight-american-shorthair__pattern_1", "pointed__pattern_1", "red-softlight-american-shorthair__pattern_1", "silver-american-shorthair__pattern_1", "silver-softlight-american-shorthair__pattern_1", "tortoiseshell__pattern_1"].map((id) => ({ id })),
  ],
  ear: ["curled", "floppy", "folded", "loosely-folded", "prick_1", "prick_2", "prick_3", "sakura-l", "sakura-r"].map((id) => ({ id })),
  eye: Array.from({ length: 20 }, (_, index) => ({ id: `eye_${index + 1}` })),
  nose: ["black", "brown", "dark-brown", "gray", "pale-red", "pink", "red"].map((id) => ({ id })),
  noseMouthPattern: ["none", ...Array.from({ length: 15 }, (_, index) => `pattern_${index + 2}`)].map((id) => ({ id })),
  socks: [{ id: "none", label: "None" }, ...Array.from({ length: 24 }, (_, index) => ({ id: `pattern_${index + 2}` }))],
  tail: [{ id: "none", label: "None" }, ...["bob", "corkscrew", "flank-curled", "full-tail", "kinked-tail-1", "kinked-tail-2", "rumpy-manx"].map((id) => ({ id }))],
};

const catCategories: { id: CatCategory; label: string }[] = [
  { id: "body", label: "Body" },
  { id: "pattern", label: "Coat" },
  { id: "ear", label: "Ears" },
  { id: "eye", label: "Eyes" },
  { id: "nose", label: "Nose" },
  { id: "noseMouthPattern", label: "Muzzle" },
  { id: "socks", label: "Socks" },
  { id: "tail", label: "Tail" },
];

function asset(category: Exclude<CatCategory, "socks" | "tail"> | "socks" | "tail", id: string) {
  return `/pet-assets/cat/${category}/${id}.svg`;
}

function labelFor(id: string) {
  return id.replaceAll("__", " · ").replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function initialPet(): PetType {
  if (typeof window === "undefined") return "dog";
  return new URLSearchParams(window.location.search).get("pet") === "cat" ? "cat" : "dog";
}

function initialAge() {
  if (typeof window === "undefined") return 3;
  const age = Number(new URLSearchParams(window.location.search).get("age"));
  return Number.isFinite(age) && age >= 0 ? age : 3;
}

function initialName() {
  if (typeof window === "undefined") return "Milo";
  return new URLSearchParams(window.location.search).get("name") || "Milo";
}

function initialOption(category: CatCategory, fallback: string, legacyKey?: string) {
  if (typeof window === "undefined") return fallback;
  const params = new URLSearchParams(window.location.search);
  const value = params.get(category) || (legacyKey ? params.get(legacyKey) : null);
  return value && catOptions[category].some((option) => option.id === value) ? value : fallback;
}

function DogPortrait({ coat, collar, marking, ears }: { coat: string; collar: string; marking: string; ears: string }) {
  return <svg className="avatar-portrait" viewBox="0 0 320 280" role="img" aria-label="A custom dog portrait">
    <circle cx="160" cy="140" r="122" fill="currentColor" opacity="0.07" />
    <path d={ears === "pointed" ? "M92 119 71 52c35 2 55 30 61 61M228 119l21-67c-35 2-55 30-61 61" : "M97 119C60 92 61 53 83 43c33 18 45 45 47 73M223 119c37-27 36-66 14-76-33 18-45 45-47 73"} fill={coat} stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
    <path d="M83 137c0-53 34-83 77-83s77 30 77 83v34c0 46-34 75-77 75s-77-29-77-75v-34Z" fill={coat} stroke="currentColor" strokeWidth="5" />
    {marking === "face" && <path d="M146 60h28l-8 78h-12l-8-78Z" fill="#fff7ed" opacity="0.9" />}
    {marking === "paws" && <path d="M100 183c15 27 38 35 60 35s45-8 60-35v29c-17 24-40 34-60 34s-43-10-60-34v-29Z" fill="#fff7ed" opacity="0.9" />}
    <path d="M104 203c23 23 89 23 112 0v16c-22 27-90 27-112 0v-16Z" fill={collar} />
    <circle cx="128" cy="142" r="8" fill="currentColor" /><circle cx="192" cy="142" r="8" fill="currentColor" />
    <path d="M145 165c0-14 30-14 30 0 0 11-8 18-15 18s-15-7-15-18Z" fill="currentColor" /><path d="M160 182v9M160 190c-12 8-25 7-31 1M160 190c12 8 25 7 31 1" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}

function CatPortrait({ body, pattern, ear, eye, nose, noseMouthPattern, socks, tail }: Record<CatCategory, string>) {
  return <div className="cat-portrait" role="img" aria-label="A cat assembled from selected illustration parts">
    {tail !== "none" && <img className="cat-layer cat-tail" src={asset("tail", tail)} alt="" />}
    <img className="cat-layer cat-body" src={asset("body", body)} alt="" />
    <img className="cat-layer cat-pattern" src={asset("pattern", pattern)} alt="" />
    <img className="cat-layer cat-ear cat-ear-left" src={asset("ear", ear)} alt="" />
    <img className="cat-layer cat-eyes" src={asset("eye", eye)} alt="" />
    {noseMouthPattern !== "none" && <img className="cat-layer cat-muzzle" src={asset("noseMouthPattern", noseMouthPattern)} alt="" />}
    <img className="cat-layer cat-nose" src={asset("nose", nose)} alt="" />
    {socks !== "none" && <img className="cat-layer cat-socks" src={asset("socks", socks)} alt="" />}
  </div>;
}

function CatAssetChooser({ category, selected, onSelect }: { category: CatCategory; selected: string; onSelect: (value: string) => void }) {
  return <div className="cat-asset-grid" role="group" aria-label={`Cat ${category} options`}>
    {catOptions[category].map((option) => {
      const isNone = option.id === "none";
      return <button key={option.id} className={`cat-asset-option${selected === option.id ? " is-selected" : ""}`} type="button" aria-pressed={selected === option.id} onClick={() => onSelect(option.id)}>
        {isNone ? <span className="cat-asset-none" aria-hidden="true">—</span> : <img src={asset(category, option.id)} alt="" loading="lazy" />}
        <span>{option.label || labelFor(option.id)}</span>
      </button>;
    })}
  </div>;
}

export function PetAvatarMaker() {
  const [pet, setPet] = useState<PetType>(initialPet);
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState(initialAge);
  const [coat, setCoat] = useState(coats[0]);
  const [collar, setCollar] = useState(collars[0]);
  const [marking, setMarking] = useState("none");
  const [ears, setEars] = useState("soft");
  const [catCategory, setCatCategory] = useState<CatCategory>("pattern");
  const [body, setBody] = useState(() => initialOption("body", "cobby"));
  const [pattern, setPattern] = useState(() => initialOption("pattern", "brown-tabby__basic", "coat"));
  const [catEar, setCatEar] = useState(() => initialOption("ear", "prick_1", "ears"));
  const [catEye, setCatEye] = useState(() => initialOption("eye", "eye_1", "catEye"));
  const [catNose, setCatNose] = useState(() => initialOption("nose", "pink", "catNose"));
  const [noseMouthPattern, setNoseMouthPattern] = useState(() => initialOption("noseMouthPattern", "none"));
  const [socks, setSocks] = useState(() => initialOption("socks", "none"));
  const [tail, setTail] = useState(() => initialOption("tail", "none"));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ pet, age: String(age), name, coat: coat.id, collar: collar.id, marking, ears, body, pattern, ear: catEar, eye: catEye, nose: catNose, noseMouthPattern, socks, tail });
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }, [age, body, catEar, catEye, catNose, coat.id, collar.id, ears, marking, name, noseMouthPattern, pattern, pet, socks, tail]);

  async function copyCardLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const catSetters: Record<CatCategory, (value: string) => void> = { body: setBody, pattern: setPattern, ear: setCatEar, eye: setCatEye, nose: setCatNose, noseMouthPattern: setNoseMouthPattern, socks: setSocks, tail: setTail };
  const catSelections: Record<CatCategory, string> = { body, pattern, ear: catEar, eye: catEye, nose: catNose, noseMouthPattern, socks, tail };

  return <section className="avatar-maker" aria-label="Pet card maker">
    <div className="avatar-controls">
      <div className="avatar-control-group">
        <p className="eyebrow">1. Start with a companion</p>
        <div className="avatar-options" role="group" aria-label="Pet type">
          {(["dog", "cat"] as PetType[]).map((option) => <button key={option} className={pet === option ? "is-selected" : ""} type="button" onClick={() => setPet(option)}>{option === "dog" ? "Dog" : "Cat"}</button>)}
        </div>
      </div>

      <div className="avatar-basic-fields">
        <label className="avatar-name-field">Name<input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} /></label>
        <label className="avatar-name-field">Age in years<input type="number" min="0" max="40" step="0.5" value={age} onChange={(event) => setAge(Math.max(0, Number(event.target.value) || 0))} /></label>
      </div>

      {pet === "cat" ? <div className="cat-customizer">
        <div className="cat-customizer-heading"><p>2. Choose cat features</p><span>{catOptions[catCategory].length} options</span></div>
        <div className="cat-category-tabs" role="tablist" aria-label="Cat feature categories">
          {catCategories.map((category) => <button key={category.id} className={catCategory === category.id ? "is-selected" : ""} type="button" role="tab" aria-selected={catCategory === category.id} onClick={() => setCatCategory(category.id)}>{category.label}</button>)}
        </div>
        <CatAssetChooser category={catCategory} selected={catSelections[catCategory]} onSelect={catSetters[catCategory]} />
      </div> : <>
        <div className="avatar-control-group"><p>Coat</p><div className="avatar-options" role="group" aria-label="Coat color">{coats.map((option) => <button key={option.id} className={coat.id === option.id ? "is-selected" : ""} type="button" onClick={() => setCoat(option)}><span className="avatar-swatch" style={{ backgroundColor: option.value }} />{option.label}</button>)}</div></div>
        <div className="avatar-control-group"><p>Markings</p><div className="avatar-options" role="group" aria-label="Markings">{["None", "Face", "Paws"].map((option) => <button key={option} className={marking === option.toLowerCase() ? "is-selected" : ""} type="button" onClick={() => setMarking(option.toLowerCase())}>{option}</button>)}</div></div>
        <div className="avatar-control-group"><p>Ears</p><div className="avatar-options" role="group" aria-label="Ear shape">{["Soft", "Pointed"].map((option) => <button key={option} className={ears === option.toLowerCase() ? "is-selected" : ""} type="button" onClick={() => setEars(option.toLowerCase())}>{option}</button>)}</div></div>
        <div className="avatar-control-group"><p>Collar</p><div className="avatar-options" role="group" aria-label="Collar color">{collars.map((option) => <button key={option.id} className={collar.id === option.id ? "is-selected" : ""} type="button" onClick={() => setCollar(option)}><span className="avatar-swatch" style={{ backgroundColor: option.value }} />{option.label}</button>)}</div></div>
      </>}
    </div>

    <div className="avatar-preview">
      <div className="avatar-preview-card">
        <p className="eyebrow">{pet} portrait</p>
        {pet === "cat" ? <CatPortrait body={body} pattern={pattern} ear={catEar} eye={catEye} nose={catNose} noseMouthPattern={noseMouthPattern} socks={socks} tail={tail} /> : <DogPortrait coat={coat.value} collar={collar.value} marking={marking} ears={ears} />}
        <div className="avatar-card-caption"><strong>{name.trim() || "Your companion"}</strong><span>{age} years old · made with TurnsTo</span></div>
      </div>
      <button className="avatar-share" type="button" onClick={copyCardLink}>{copied ? "Link copied" : "Copy card link"} <span aria-hidden="true">→</span></button>
    </div>
  </section>;
}
