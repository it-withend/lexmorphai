/**
 * Map numeric defense scores to qualitative bands (avoid false precision).
 */
export type ViabilityBand = 'strong' | 'moderate' | 'limited' | 'review';

export function scoreToBand(score: number): ViabilityBand {
  if (score >= 80) return 'strong';
  if (score >= 65) return 'moderate';
  if (score >= 50) return 'limited';
  return 'review';
}

export function bandLabel(band: ViabilityBand): string {
  switch (band) {
    case 'strong':
      return 'Strong possible defenses';
    case 'moderate':
      return 'Moderate defense signals';
    case 'limited':
      return 'Limited automatic flags';
    default:
      return 'Needs human review';
  }
}

export function bandDescription(band: ViabilityBand): string {
  switch (band) {
    case 'strong':
      return 'Several statutory issues look worth raising. This is not a prediction of what a court will do.';
    case 'moderate':
      return 'There are arguable defects or counterclaims. Outcomes depend on facts, evidence, and the judge.';
    case 'limited':
      return 'Fewer automatic triggers matched. Still review the document carefully with a legal aid clinic if you can.';
    default:
      return 'Automated rules found little. Paste clearer text or open a curated demo — and get human help if you have a hearing.';
  }
}
