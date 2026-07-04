export type ImpactClassification = 'tiny' | 'medium' | 'massive';

export interface ImpactProfile {
  classification: ImpactClassification;
  title: string;
  summary: string;
  fact: string;
  highlight: string;
  outcome: string;
  massKg: number;
  massRatioToSun: number;
  schwarzschildRadius: number;
  distortionStrength: number;
  approachSpeed: number;
  burstIntensity: number;
  particleCount: number;
}

const G = 6.67430e-11;
const C = 299_792_458;
const SOLAR_MASS_KG = 1.98847e30;

export function calculateImpactProfile(bhSizeMeters: number): ImpactProfile {
  const schwarzschildRadius = bhSizeMeters / 2;
  const massKg = (schwarzschildRadius * C * C) / (2 * G);
  const massRatioToSun = massKg / SOLAR_MASS_KG;

  let classification: ImpactClassification;
  let title: string;
  let summary: string;
  let fact: string;
  let highlight: string;
  let outcome: string;

  if (massRatioToSun < 0.15) {
    classification = 'tiny';
    title = 'Tiny intruder';
    summary = 'A small black hole is overwhelmed by the Sun before it can do much damage.';
    fact = 'In this regime the Sun absorbs the intruder long before tidal forces become extreme.';
    highlight = 'The Sun wins comfortably.';
    outcome = '🌞 The Sun easily gobbles up the tiny black hole!';
  } else if (massRatioToSun < 3) {
    classification = 'medium';
    title = 'Medium collision';
    summary = 'A black hole of this size would strongly distort the Sun and strip away its outer layers.';
    fact = 'This is where tidal forces become dramatic and the star’s structure is heavily disrupted.';
    highlight = 'The Sun is badly damaged.';
    outcome = '⚠️ The black hole tears apart the Sun\'s outer layers.';
  } else {
    classification = 'massive';
    title = 'Catastrophic impact';
    summary = 'A very large black hole would dominate the system and consume the Sun’s material rapidly.';
    fact = 'Once the black hole is massive enough, the event horizon and tidal forces become overwhelmingly destructive.';
    highlight = 'The Sun is effectively destroyed.';
    outcome = '💥 The massive black hole completely consumes the Sun!';
  }

  const distortionStrength = Math.min(1.35, 0.35 + massRatioToSun * 0.16);
  const approachSpeed = Math.min(1.5, 0.8 + massRatioToSun * 0.16);
  const burstIntensity = Math.min(1.45, 0.2 + massRatioToSun * 0.18);
  const particleCount = Math.round(90 + Math.min(120, massRatioToSun * 24));

  return {
    classification,
    title,
    summary,
    fact,
    highlight,
    outcome,
    massKg,
    massRatioToSun,
    schwarzschildRadius,
    distortionStrength,
    approachSpeed,
    burstIntensity,
    particleCount,
  };
}
