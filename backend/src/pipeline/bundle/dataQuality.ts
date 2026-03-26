import type { DataQuality } from '../../types/topicBundle.js';
import { SCORING_VERSION, TAXONOMY_VERSION } from '../../config/versions.js';
import { SAMPLING } from '../../config/sampling.js';

export function buildDataQuality(
  unitCount: number,
  retrievalMode: DataQuality['retrieval_mode']
): DataQuality {
  const lowBelow = Math.min(SAMPLING.sampleStrengthLowBelow, SAMPLING.sampleStrengthMediumBelow - 1);
  const medBelow = Math.max(SAMPLING.sampleStrengthMediumBelow, lowBelow + 1);

  let sample_strength: DataQuality['sample_strength'] = 'high';
  if (unitCount < lowBelow) sample_strength = 'low';
  else if (unitCount < medBelow) sample_strength = 'medium';

  return {
    sample_strength,
    retrieval_mode: retrievalMode,
    scoring_version: SCORING_VERSION,
    taxonomy_version: TAXONOMY_VERSION,
  };
}
