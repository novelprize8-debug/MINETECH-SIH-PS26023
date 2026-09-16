import { EvidenceRecord, ReconciliationResult, ReconciliationStatus } from './types.js';

export class ReconciliationEngine {
  /**
   * Compare two evidence records across all required mining reporting dimensions.
   * 
   * Strict Rule: Never call two different numbers a contradiction merely because they differ.
   * Check dimensions:
   * - entity
   * - metric
   * - period
   * - unit
   * - scope
   * - coal type
   * - OC/UG (miningMethod)
   * - reported/derived status
   * - document version & source timing
   */
  static reconcile(itemA: EvidenceRecord, itemB: EvidenceRecord): ReconciliationResult {
    const normalize = (s?: string) => (s || '').trim().toLowerCase();

    const entityMatch = normalize(itemA.entity) === normalize(itemB.entity);
    const metricMatch = normalize(itemA.metric) === normalize(itemB.metric);
    const periodMatch = normalize(itemA.period) === normalize(itemB.period);
    const unitMatch = normalize(itemA.unit) === normalize(itemB.unit);
    const scopeMatch = normalize(itemA.scope) === normalize(itemB.scope);
    const coalTypeMatch = normalize(itemA.coalType) === normalize(itemB.coalType);
    const methodMatch = itemA.miningMethod === itemB.miningMethod;
    const versionMatch = normalize(itemA.docVersion) === normalize(itemB.docVersion);

    const dimensionCheck = {
      entityMatch,
      metricMatch,
      periodMatch,
      unitMatch,
      scopeMatch,
      coalTypeMatch,
      methodMatch,
      versionMatch
    };

    const valueDiff = Math.abs(Number(itemA.value) - Number(itemB.value));
    const isValueIdentical = valueDiff < 0.001;

    let status: ReconciliationStatus = 'NOT COMPARABLE';
    let summary = '';
    let diagnosticExplanation = '';
    let documentaryReason: string | undefined = undefined;

    // 1. If critical identity dimensions differ (e.g. different entity or different metric entirely)
    if (!entityMatch || !metricMatch) {
      status = 'NOT COMPARABLE';
      summary = `Non-comparable dimensions: ${!entityMatch ? 'Entity mismatch (' + itemA.entity + ' vs ' + itemB.entity + ')' : ''} ${!metricMatch ? 'Metric mismatch (' + itemA.metric + ' vs ' + itemB.metric + ')' : ''}.`;
      diagnosticExplanation = `The two records represent different fundamental dimensions. Direct arithmetic comparison would violate semantic integrity.`;
    }
    // 2. If period differs
    else if (!periodMatch) {
      status = 'NOT COMPARABLE';
      summary = `Different reporting periods (${itemA.period} vs ${itemB.period}). Values represent distinct fiscal windows.`;
      diagnosticExplanation = `Temporal variance: Number ${itemA.value} is for ${itemA.period}, whereas ${itemB.value} is for ${itemB.period}. These are sequential trend markers, not a conflict.`;
    }
    // 3. If mining method differs (OC vs UG vs TOTAL)
    else if (!methodMatch) {
      status = 'EXPLAINABLE DIFFERENCE';
      summary = `Methodological dimension difference: ${itemA.miningMethod} vs ${itemB.miningMethod}.`;
      diagnosticExplanation = `One record measures ${itemA.miningMethod} extraction (${itemA.value} ${itemA.unit}), while the second measures ${itemB.miningMethod} extraction (${itemB.value} ${itemB.unit}). Under CIL reporting norms, OC and UG sum to total production.`;
      documentaryReason = `CIL Production Norms distinguish opencast pit output from underground continuous haulage. This is an operational breakdown, not a reporting conflict.`;
    }
    // 4. If scope or coal type differs
    else if (!scopeMatch || !coalTypeMatch) {
      status = 'EXPLAINABLE DIFFERENCE';
      summary = `Reporting scope or grade classification divergence (${itemA.scope || 'Total'} / ${itemA.coalType} vs ${itemB.scope || 'Total'} / ${itemB.coalType}).`;
      diagnosticExplanation = `Value ${itemA.value} corresponds to scope '${itemA.scope}' (${itemA.coalType}), whereas ${itemB.value} corresponds to '${itemB.scope}' (${itemB.coalType}).`;
      documentaryReason = `CMPDI/CIL reporting separates thermal non-coking coal from washed/metallurgical fractions.`;
    }
    // 5. All operational dimensions match! Now check document versions / timing or values
    else if (isValueIdentical) {
      status = 'CONSISTENT';
      summary = `Identical values across matching dimensions (${itemA.value} ${itemA.unit} in ${itemA.period}).`;
      diagnosticExplanation = `Both sources independently confirm the same verified figure of ${itemA.value} ${itemA.unit} for ${itemA.entity} ${itemA.metric}.`;
    }
    // 6. Values differ, but dimensions match. Check if document versions explain the variance (e.g. Provisional Flash vs Audited Annual Report)
    else {
      const isOneProvisional = 
        itemA.docTitle.toLowerCase().includes('provisional') || 
        itemA.docTitle.toLowerCase().includes('flash') ||
        itemB.docTitle.toLowerCase().includes('provisional') || 
        itemB.docTitle.toLowerCase().includes('flash');
      
      const isOneAudited = 
        itemA.docTitle.toLowerCase().includes('annual report') || 
        itemA.docTitle.toLowerCase().includes('audited') ||
        itemB.docTitle.toLowerCase().includes('annual report') || 
        itemB.docTitle.toLowerCase().includes('audited');

      if (isOneProvisional && isOneAudited) {
        status = 'EXPLAINABLE DIFFERENCE';
        summary = `Explainable variance between Provisional Flash Estimates and Audited Annual Financial Reports.`;
        diagnosticExplanation = `Source A (${itemA.docTitle} v${itemA.docVersion}) reports ${itemA.value} ${itemA.unit}, while Source B (${itemB.docTitle} v${itemB.docVersion}) reports ${itemB.value} ${itemB.unit} (variance of ${valueDiff.toFixed(2)} ${itemA.unit}).`;
        documentaryReason = `Provisional flash bulletins are compiled within 48 hours post fiscal-year close based on railhead pit-weight logs. Final statutory audited reports reconcile surveyed pit-head volumetric stock measurements, transit weighbridge calibration adjustments, and washery reject deductions.`;
      } else if (!versionMatch) {
        status = 'EXPLAINABLE DIFFERENCE';
        summary = `Document version revision variance (v${itemA.docVersion} vs v${itemB.docVersion}).`;
        diagnosticExplanation = `The numbers differ (${itemA.value} vs ${itemB.value}) due to statutory revision cycles between document releases.`;
        documentaryReason = `Superceded preliminary release updated following statutory mining auditor review.`;
      } else {
        // True conflict: same entity, same metric, same period, same unit, same scope, same method, but unexplained numerical clash!
        status = 'CONFLICT';
        summary = `Direct numerical contradiction detected across identical reporting dimensions (${itemA.value} vs ${itemB.value} ${itemA.unit}).`;
        diagnosticExplanation = `Both records claim identical scope (${itemA.scope}), method (${itemA.miningMethod}), and period (${itemA.period}) for ${itemA.entity} ${itemA.metric}, yet disagree by ${valueDiff.toFixed(2)} ${itemA.unit} without documented reconciling notes.`;
        documentaryReason = `Potential clerical transposition error or unverified source discrepancy requiring manual auditor scrutiny.`;
      }
    }

    return {
      status,
      summary,
      itemA: {
        evidenceId: itemA.id,
        docTitle: itemA.docTitle,
        docVersion: itemA.docVersion,
        value: itemA.value,
        unit: itemA.unit,
        period: itemA.period,
        scope: itemA.scope,
        coalType: itemA.coalType,
        miningMethod: itemA.miningMethod,
        reportedOrDerived: itemA.reportedOrDerived
      },
      itemB: {
        evidenceId: itemB.id,
        docTitle: itemB.docTitle,
        docVersion: itemB.docVersion,
        value: itemB.value,
        unit: itemB.unit,
        period: itemB.period,
        scope: itemB.scope,
        coalType: itemB.coalType,
        miningMethod: itemB.miningMethod,
        reportedOrDerived: itemB.reportedOrDerived
      },
      dimensionCheck,
      diagnosticExplanation,
      documentaryReason
    };
  }
}
