import { DeterministicCalculation, EvidenceRecord } from './types.js';

/**
 * Deterministic Calculation Engine
 * 
 * Strict rule: All arithmetic is strictly calculated in pure TypeScript/Node.js logic.
 * Gemini or LLMs must NEVER perform arithmetic or mutate numbers.
 */
export class CalculationEngine {
  /**
   * Calculate Total Production from OC (Opencast) and UG (Underground)
   * Formula: OC + UG = Total Production
   */
  static computeTotalProduction(ocEvidence: EvidenceRecord, ugEvidence: EvidenceRecord): {
    total: number;
    calculation: DeterministicCalculation;
  } {
    const ocVal = Number(ocEvidence.value);
    const ugVal = Number(ugEvidence.value);
    const sum = Number((ocVal + ugVal).toFixed(2));

    const calculation: DeterministicCalculation = {
      id: `calc-prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      formulaName: 'Total Production (OC + UG)',
      formulaExpression: 'Total = Opencast (OC) + Underground (UG)',
      inputs: {
        oc: {
          label: 'Opencast Production (OC)',
          value: ocVal,
          unit: ocEvidence.unit,
          evidenceId: ocEvidence.id,
          sourceDoc: `${ocEvidence.docTitle} (p.${ocEvidence.page})`
        },
        ug: {
          label: 'Underground Production (UG)',
          value: ugVal,
          unit: ugEvidence.unit,
          evidenceId: ugEvidence.id,
          sourceDoc: `${ugEvidence.docTitle} (p.${ugEvidence.page})`
        }
      },
      output: sum,
      unit: ocEvidence.unit,
      derivedStatus: 'DERIVED',
      verifiedDeterministic: true,
      notes: `Strict additive aggregation across mining methods for ${ocEvidence.entity} in ${ocEvidence.period}.`
    };

    return { total: sum, calculation };
  }

  /**
   * Calculate Target vs Actual Deviation and Deviation Percentage
   * Formula 1: Actual - Target = Deviation
   * Formula 2: ((Actual - Target) / Target) * 100 = Deviation Percentage
   */
  static computeTargetDeviation(actualEvidence: EvidenceRecord, targetEvidence: EvidenceRecord): {
    deviation: number;
    deviationPercentage: number;
    achievementPercentage: number;
    calculations: DeterministicCalculation[];
  } {
    const actual = Number(actualEvidence.value);
    const target = Number(targetEvidence.value);

    // Actual - Target = Deviation
    const deviation = Number((actual - target).toFixed(2));

    // ((Actual - Target) / Target) * 100
    const deviationPercentage = target !== 0 
      ? Number((((actual - target) / target) * 100).toFixed(2)) 
      : 0;

    // (Actual / Target) * 100
    const achievementPercentage = target !== 0 
      ? Number(((actual / target) * 100).toFixed(2)) 
      : 0;

    const calcDeviation: DeterministicCalculation = {
      id: `calc-dev-${Date.now()}-1`,
      formulaName: 'Absolute Target Deviation',
      formulaExpression: 'Deviation = Actual - Target',
      inputs: {
        actual: {
          label: 'Actual Production',
          value: actual,
          unit: actualEvidence.unit,
          evidenceId: actualEvidence.id,
          sourceDoc: `${actualEvidence.docTitle} (p.${actualEvidence.page})`
        },
        target: {
          label: 'Target Production (MoU / Annual Plan)',
          value: target,
          unit: targetEvidence.unit,
          evidenceId: targetEvidence.id,
          sourceDoc: `${targetEvidence.docTitle} (p.${targetEvidence.page})`
        }
      },
      output: deviation,
      unit: actualEvidence.unit,
      derivedStatus: 'DERIVED',
      verifiedDeterministic: true,
      notes: deviation >= 0 
        ? `Surpassed target by ${deviation} ${actualEvidence.unit}`
        : `Deficit of ${Math.abs(deviation)} ${actualEvidence.unit} against plan`
    };

    const calcPercentage: DeterministicCalculation = {
      id: `calc-dev-${Date.now()}-2`,
      formulaName: 'Target Deviation Percentage',
      formulaExpression: 'Deviation % = ((Actual - Target) / Target) × 100',
      inputs: {
        actual: {
          label: 'Actual Production',
          value: actual,
          unit: actualEvidence.unit,
          evidenceId: actualEvidence.id
        },
        target: {
          label: 'Target Production',
          value: target,
          unit: targetEvidence.unit,
          evidenceId: targetEvidence.id
        }
      },
      output: deviationPercentage,
      unit: '%',
      derivedStatus: 'DERIVED',
      verifiedDeterministic: true,
      notes: `Achievement Rate: ${achievementPercentage}% of targeted output.`
    };

    return {
      deviation,
      deviationPercentage,
      achievementPercentage,
      calculations: [calcDeviation, calcPercentage]
    };
  }

  /**
   * Calculate CAGR (Compound Annual Growth Rate) across period records
   * Formula: ((End / Start) ** (1 / n) - 1) * 100
   */
  static computeCAGR(startRecord: EvidenceRecord, endRecord: EvidenceRecord, years: number): DeterministicCalculation {
    const startVal = Number(startRecord.value);
    const endVal = Number(endRecord.value);

    let cagr = 0;
    if (startVal > 0 && years > 0) {
      cagr = Number(((Math.pow(endVal / startVal, 1 / years) - 1) * 100).toFixed(2));
    }

    return {
      id: `calc-cagr-${Date.now()}`,
      formulaName: 'Compound Annual Growth Rate (CAGR)',
      formulaExpression: 'CAGR = ((Ending Value / Starting Value) ^ (1 / n) - 1) × 100',
      inputs: {
        start: {
          label: `Starting Production (${startRecord.period})`,
          value: startVal,
          unit: startRecord.unit,
          evidenceId: startRecord.id,
          sourceDoc: startRecord.docTitle
        },
        end: {
          label: `Ending Production (${endRecord.period})`,
          value: endVal,
          unit: endRecord.unit,
          evidenceId: endRecord.id,
          sourceDoc: endRecord.docTitle
        },
        n: {
          label: 'Number of Growth Periods (Years)',
          value: years,
          unit: 'years'
        }
      },
      output: cagr,
      unit: '% p.a.',
      derivedStatus: 'DERIVED',
      verifiedDeterministic: true,
      notes: `Computed across ${startRecord.period} to ${endRecord.period}.`
    };
  }

  /**
   * Calculate Stripping Ratio (Overburden Removal to Coal Production)
   * Formula: Overburden (M.Cu.m) / Coal Production (MT)
   */
  static computeStrippingRatio(obEvidence: EvidenceRecord, coalEvidence: EvidenceRecord): DeterministicCalculation {
    const ob = Number(obEvidence.value);
    const coal = Number(coalEvidence.value);
    const ratio = coal > 0 ? Number((ob / coal).toFixed(2)) : 0;

    return {
      id: `calc-strip-${Date.now()}`,
      formulaName: 'Stripping Ratio (OBR / Coal)',
      formulaExpression: 'Stripping Ratio = Composite Overburden Removal (M.Cu.m) / Coal Production (MT)',
      inputs: {
        obr: {
          label: 'Overburden Removal',
          value: ob,
          unit: obEvidence.unit,
          evidenceId: obEvidence.id,
          sourceDoc: obEvidence.docTitle
        },
        coal: {
          label: 'Raw Coal Production',
          value: coal,
          unit: coalEvidence.unit,
          evidenceId: coalEvidence.id,
          sourceDoc: coalEvidence.docTitle
        }
      },
      output: ratio,
      unit: 'Cu.m / Tonne',
      derivedStatus: 'DERIVED',
      verifiedDeterministic: true,
      notes: 'Direct mining intensity metric calculated from verified operational filings.'
    };
  }

  /**
   * Statistical summary over an array of evidence values
   */
  static computeStats(records: EvidenceRecord[]): {
    count: number;
    sum: number;
    mean: number;
    min: number;
    max: number;
    unit: string;
  } {
    if (records.length === 0) {
      return { count: 0, sum: 0, mean: 0, min: 0, max: 0, unit: '' };
    }
    const values = records.map(r => Number(r.value));
    const count = values.length;
    const sum = Number(values.reduce((a, b) => a + b, 0).toFixed(2));
    const mean = Number((sum / count).toFixed(2));
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { count, sum, mean, min, max, unit: records[0].unit };
  }
}
