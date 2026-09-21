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
      return 'We found several problems that often help tenants push back. A court still decides — this is not a win prediction.';
    case 'moderate':
      return 'There are arguable issues. What happens next depends on your facts, evidence, and the judge.';
    case 'limited':
      return 'Fewer automatic issues matched. Still read carefully and talk to legal aid if you have a court date.';
    default:
      return 'Automatic checks found little. Try a practice example or clearer text — and get human help if you have a hearing.';
  }
}
