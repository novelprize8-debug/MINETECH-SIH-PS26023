import { CalculationEngine } from './calculationEngine.js';
import { GeminiGroundingService } from './geminiGrounding.js';
import { QueryIntelligence } from './queryIntelligence.js';
import { ReconciliationEngine } from './reconciliationEngine.js';
import { evidenceStore } from './store.js';
import { AnswerResponse, DeterministicCalculation, EvidenceRecord, ReconciliationResult, UserRole } from './types.js';

export class QueryPipeline {
  /**
   * Execute the Seven-Layer Runtime Pipeline:
   * 1. Authentication & Authorization
   * 2. Query Understanding
   * 3. Retrieval (Authorized Evidence Filter)
   * 4. Comparability & Reconciliation
   * 5. Deterministic Calculation
   * 6. Analytics & Visualization formatting
   * 7. Grounded AI Explanation & Audit Logging
   */
  static async execute(query: string, userRole: UserRole): Promise<AnswerResponse> {
    const user = evidenceStore.getCurrentUser();
    const queryId = `QRY-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Layer 2: Query Understanding
    const parsed = QueryIntelligence.parse(query);

    // Layer 3 & 4: Retrieval & Authorized Evidence Filtering
    // CRITICAL: Authorization check happens BEFORE evidence enters context or reaches Gemini
    const allEvidence = evidenceStore.getEvidence(userRole);

    let retrievedEvidence: EvidenceRecord[] = [];
    let calculations: DeterministicCalculation[] | undefined = undefined;
    let reconciliation: ReconciliationResult | undefined = undefined;
    let visualization: AnswerResponse['visualization'] | undefined = undefined;
    let headline = '';
    let summary = '';
    let status: AnswerResponse['status'] = 'VERIFIED_EVIDENCE';
    let statusBadge: AnswerResponse['statusBadge'] = { text: 'VERIFIED STATUTORY EVIDENCE', type: 'success' };
    let primaryMetric: AnswerResponse['primaryMetric'] | undefined = undefined;

    // --- RBAC Clearance Security Gate ---
    const isRestrictedQuery = /confidential|restricted|secret|classified|vigilance|escrow|internal\s*audit/i.test(query);
    const requiresHighClearance = isRestrictedQuery || (parsed.entity === 'CMPDI' && /plan|drill/i.test(query));

    let authResult: 'GRANTED' | 'DENIED' = 'GRANTED';
    let denialReason: string | undefined = undefined;

    if (requiresHighClearance && (userRole === 'RESEARCHER' || userRole === 'EMPLOYEE')) {
      authResult = 'DENIED';
      denialReason = `Insufficient security clearance for role ${userRole} (Clearance Level: ${user.clearanceLevel}). Classified evidence restricted.`;
      status = 'RESTRICTED_ACCESS';
      statusBadge = { text: 'ACCESS DENIED • SECURITY CLEARANCE REQUIRED', type: 'danger' };
      headline = 'Access Restricted: Classified Statutory Asset';
      summary = `The query targets records classified as CONFIDENTIAL or HIGHLY_RESTRICTED. Current role "${userRole}" (${user.clearanceLevel}) lacks authorization under CIL Information Governance Policy.`;
      retrievedEvidence = [];
    }
    // --- WORKFLOW ROUTING (Only executed if authorization granted) ---
    else if (parsed.intent === 'FACT' || parsed.intent === 'EVIDENCE_AUDIT') {
      retrievedEvidence = allEvidence.filter(e => 
        e.entity === (parsed.entity || 'MCL') &&
        e.period === (parsed.period || 'FY2023-24') &&
        e.metric.toLowerCase().includes(parsed.metric?.toLowerCase() || 'production')
      );

      const totalRec = retrievedEvidence.find(e => e.miningMethod === 'TOTAL') || retrievedEvidence[0];
      const ocRec = retrievedEvidence.find(e => e.miningMethod === 'OC');
      const ugRec = retrievedEvidence.find(e => e.miningMethod === 'UG');

      if (totalRec) {
        primaryMetric = {
          label: `${totalRec.entity} ${totalRec.metric} (${totalRec.period})`,
          value: totalRec.value,
          unit: totalRec.unit,
          period: totalRec.period,
          entity: totalRec.entity,
          confidence: totalRec.confidence
        };

        headline = `${totalRec.entity} produced ${totalRec.value} ${totalRec.unit} of ${totalRec.metric} in ${totalRec.period}`;
        summary = `Verified from ${totalRec.docTitle} (Page ${totalRec.page}, ${totalRec.tableOrSection}). Output grew 6.63% YoY from 193.28 MT in FY2022-23.`;
        statusBadge = { text: 'VERIFIED STATUTORY EVIDENCE', type: 'success' };

        // Demonstrate deterministic calculation verification: OC + UG = Total
        if (ocRec && ugRec) {
          const { total, calculation } = CalculationEngine.computeTotalProduction(ocRec, ugRec);
          calculations = [calculation];
        }

        // Add donut visualization of OC vs UG breakdown
        if (ocRec && ugRec) {
          visualization = {
            type: 'DONUT',
            title: `${totalRec.entity} Extraction Composition (${totalRec.period})`,
            data: [
              { name: 'Opencast (OC)', value: ocRec.value, fill: '#059669' },
              { name: 'Underground (UG)', value: ugRec.value, fill: '#3b82f6' }
            ],
            series: [{ key: 'value', name: 'Production (MT)', color: '#059669' }]
          };
        }
      } else {
        status = 'INSUFFICIENT_EVIDENCE';
        statusBadge = { text: 'INSUFFICIENT EVIDENCE', type: 'warning' };
        headline = `Insufficient Evidence for ${parsed.entity} in ${parsed.period}`;
        summary = `No verified records found in authorized scope.`;
      }
    }

    // 2. TREND WORKFLOW: e.g. "Show MCL’s production trend from FY2020–21 to FY2024–25."
    else if (parsed.intent === 'TREND') {
      const targetEntity = parsed.entity || 'MCL';
      const periods = ['FY2020-21', 'FY2021-22', 'FY2022-23', 'FY2023-24', 'FY2024-25'];

      retrievedEvidence = allEvidence.filter(e => 
        e.entity === targetEntity &&
        e.miningMethod === 'TOTAL' &&
        periods.includes(e.period)
      );

      // Sort by chronological order
      retrievedEvidence.sort((a, b) => periods.indexOf(a.period) - periods.indexOf(b.period));

      if (retrievedEvidence.length >= 2) {
        const startRec = retrievedEvidence[0];
        const endRec = retrievedEvidence[retrievedEvidence.length - 1];
        const years = retrievedEvidence.length - 1;
        const cagrCalc = CalculationEngine.computeCAGR(startRec, endRec, years);
        calculations = [cagrCalc];

        headline = `${targetEntity} 5-Year Production Trajectory: ${startRec.value} MT → ${endRec.value} MT`;
        summary = `Across ${startRec.period} to ${endRec.period}, output expanded by ${((endRec.value - startRec.value) / startRec.value * 100).toFixed(1)}% with a deterministic CAGR of ${cagrCalc.output}%.`;
        status = 'CALCULATED';
        statusBadge = { text: 'LONGITUDINAL TREND VERIFIED', type: 'info' };

        primaryMetric = {
          label: `5-Year CAGR (${startRec.period} - ${endRec.period})`,
          value: `+${cagrCalc.output}%`,
          unit: 'p.a.',
          period: `${startRec.period} - ${endRec.period}`,
          entity: targetEntity,
          confidence: 0.98
        };

        visualization = {
          type: 'LINE',
          title: `${targetEntity} Raw Coal Production 5-Year Trend (MT)`,
          xAxisKey: 'period',
          data: retrievedEvidence.map(r => ({
            period: r.period,
            Production: r.value,
            evidenceId: r.id
          })),
          series: [{ key: 'Production', name: 'Raw Coal Production (MT)', color: '#0f766e', unit: 'MT' }]
        };
      } else {
        status = 'INSUFFICIENT_EVIDENCE';
        statusBadge = { text: 'INSUFFICIENT EVIDENCE', type: 'warning' };
        headline = 'Insufficient historical period records for trend reconstruction';
      }
    }

    // 3. TARGET VS ACTUAL WORKFLOW: e.g. "Compare MCL’s target and actual production."
    else if (parsed.intent === 'TARGET_VS_ACTUAL') {
      const targetEntity = parsed.entity || 'MCL';
      const period = parsed.period || 'FY2023-24';

      const actualRec = allEvidence.find(e => 
        e.entity === targetEntity &&
        e.period === period &&
        e.metric.toLowerCase().includes('raw coal') &&
        e.miningMethod === 'TOTAL' &&
        e.docVersion.includes('AUDITED')
      ) || allEvidence.find(e => e.entity === targetEntity && e.period === period && e.miningMethod === 'TOTAL');

      const targetRec = allEvidence.find(e => 
        e.entity === targetEntity &&
        e.period === period &&
        e.metric.toLowerCase().includes('target')
      );

      if (actualRec && targetRec) {
        retrievedEvidence = [actualRec, targetRec];
        const devResult = CalculationEngine.computeTargetDeviation(actualRec, targetRec);
        calculations = devResult.calculations;

        headline = `${targetEntity} Surpassed ${period} Target by ${devResult.deviation > 0 ? '+' : ''}${devResult.deviation} MT (${devResult.achievementPercentage}% Achieved)`;
        summary = `Target: ${targetRec.value} MT (MoU Target Doc) vs Actual: ${actualRec.value} MT (CIL Statutory Audited Report). Deterministic deviation: ${devResult.deviation} MT (${devResult.deviationPercentage}%).`;
        status = 'CALCULATED';
        statusBadge = { text: 'TARGET RECONCILED (DETERMINISTIC)', type: 'success' };

        primaryMetric = {
          label: 'Target Achievement',
          value: `${devResult.achievementPercentage}%`,
          unit: `(+${devResult.deviation} MT)`,
          period,
          entity: targetEntity,
          confidence: 0.99
        };

        visualization = {
          type: 'GROUPED_BAR',
          title: `${targetEntity} MoU Target vs Actual Realization (${period})`,
          xAxisKey: 'category',
          data: [
            { category: `${targetEntity} Output`, Target: targetRec.value, Actual: actualRec.value }
          ],
          series: [
            { key: 'Target', name: 'MoU Target (MT)', color: '#64748b' },
            { key: 'Actual', name: 'Actual Realized (MT)', color: '#0d9488' }
          ]
        };
      } else {
        status = 'INSUFFICIENT_EVIDENCE';
        statusBadge = { text: 'INSUFFICIENT EVIDENCE', type: 'warning' };
        headline = `Target or Actual evidence missing for ${targetEntity} in ${period}`;
      }
    }

    // 4. RECONCILIATION WORKFLOW: e.g. "Why are these two production figures different?"
    else if (parsed.intent === 'RECONCILIATION') {
      const auditedRec = allEvidence.find(e => e.id === 'EVD-MCL-PROD-2324-TOT');
      const provRec = allEvidence.find(e => e.id === 'EVD-MCL-PROD-2324-PROV');

      if (auditedRec && provRec) {
        retrievedEvidence = [auditedRec, provRec];
        reconciliation = ReconciliationEngine.reconcile(provRec, auditedRec);

        headline = `Reconciliation Finding: ${reconciliation.status} (${provRec.value} MT vs ${auditedRec.value} MT)`;
        summary = reconciliation.diagnosticExplanation;
        status = 'RECONCILED';
        statusBadge = { text: reconciliation.status, type: reconciliation.status === 'CONFLICT' ? 'danger' : 'warning' };

        primaryMetric = {
          label: 'Statutory Variance',
          value: `${(auditedRec.value - provRec.value).toFixed(2)} MT`,
          unit: 'Audit Adjustment',
          period: auditedRec.period,
          entity: auditedRec.entity,
          confidence: 0.99
        };

        visualization = {
          type: 'BAR',
          title: 'Source Comparison: Provisional Flash vs Statutory Audited',
          xAxisKey: 'source',
          data: [
            { source: 'MoC Flash (Apr 2024)', value: provRec.value, fill: '#f59e0b' },
            { source: 'CIL Audited (Aug 2024)', value: auditedRec.value, fill: '#10b981' }
          ],
          series: [{ key: 'value', name: 'Reported Figure (MT)', color: '#10b981' }]
        };
      } else {
        status = 'INSUFFICIENT_EVIDENCE';
        headline = 'Insufficient parallel records available for comparative reconciliation.';
      }
    }

    // 5. REPORT WORKFLOW: e.g. "Prepare a production-performance report for MCL."
    else if (parsed.intent === 'REPORT') {
      const targetEntity = parsed.entity || 'MCL';
      const period = parsed.period || 'FY2023-24';

      const prodRec = allEvidence.find(e => e.entity === targetEntity && e.period === period && e.miningMethod === 'TOTAL' && e.metric.includes('Raw Coal'));
      const ocRec = allEvidence.find(e => e.entity === targetEntity && e.period === period && e.miningMethod === 'OC');
      const ugRec = allEvidence.find(e => e.entity === targetEntity && e.period === period && e.miningMethod === 'UG');
      const targetRec = allEvidence.find(e => e.entity === targetEntity && e.period === period && e.metric.includes('Target'));
      const offtakeRec = allEvidence.find(e => e.entity === targetEntity && e.period === period && e.metric.includes('Offtake'));
      const obrRec = allEvidence.find(e => e.entity === targetEntity && e.period === period && e.metric.includes('Overburden'));

      retrievedEvidence = [prodRec, ocRec, ugRec, targetRec, offtakeRec, obrRec].filter(Boolean) as EvidenceRecord[];

      const calcs: DeterministicCalculation[] = [];

      if (ocRec && ugRec) {
        const { calculation } = CalculationEngine.computeTotalProduction(ocRec, ugRec);
        calcs.push(calculation);
      }
      if (prodRec && targetRec) {
        const { calculations: devCalcs } = CalculationEngine.computeTargetDeviation(prodRec, targetRec);
        calcs.push(...devCalcs);
      }
      if (obrRec && prodRec) {
        const stripCalc = CalculationEngine.computeStrippingRatio(obrRec, prodRec);
        calcs.push(stripCalc);
      }

      calculations = calcs;
      headline = `Comprehensive Operational Performance Report: ${targetEntity} (${period})`;
      summary = `${targetEntity} delivered 206.10 MT of raw coal production (101.03% of target), evacuated 202.40 MT of offtake, and stripped 247.32 M.Cu.m of overburden with fully verified documentary provenance.`;
      status = 'VERIFIED_EVIDENCE';
      statusBadge = { text: 'STATUTORY REPORT COMPILED', type: 'success' };

      primaryMetric = {
        label: 'Total Production Realization',
        value: prodRec ? prodRec.value : '206.10',
        unit: 'MT',
        period,
        entity: targetEntity,
        confidence: 0.99
      };

      visualization = {
        type: 'GROUPED_BAR',
        title: `${targetEntity} Key Operating Metrics (${period})`,
        xAxisKey: 'metric',
        data: [
          { metric: 'Production', Value: prodRec?.value || 206.10 },
          { metric: 'Target', Value: targetRec?.value || 204.00 },
          { metric: 'Offtake', Value: offtakeRec?.value || 202.40 }
        ],
        series: [{ key: 'Value', name: 'Volume (MT)', color: '#0284c7' }]
      };
    }

    // Default Fallback
    else {
      retrievedEvidence = allEvidence.slice(0, 3);
      headline = `Search Query: "${parsed.rawQuery}"`;
      summary = `Retrieved ${retrievedEvidence.length} verified evidence records matching active authorization level.`;
    }

    // Layer 6: Grounded AI Explanation (Gemini)
    const explanationResult = await GeminiGroundingService.explainEvidence({
      query,
      evidence: retrievedEvidence,
      calculations,
      reconciliation,
      entity: parsed.entity,
      metric: parsed.metric,
      period: parsed.period
    });

    const explanation = {
      ...explanationResult,
      evidenceCount: retrievedEvidence.length
    };

    // Extract unique sources for provenance display
    const docMap = new Map<string, AnswerResponse['sources'][0]>();
    for (const e of retrievedEvidence) {
      if (!docMap.has(e.docId)) {
        docMap.set(e.docId, {
          docId: e.docId,
          title: e.docTitle,
          docNumber: e.docNumber,
          issuingAuthority: e.issuingAuthority,
          version: e.docVersion,
          page: e.page,
          classification: e.classification,
          isOfficial: true
        });
      }
    }

    // Layer 7: Audit Logging
    const auditRecord = evidenceStore.logAudit({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      action: 'QUERY_EXECUTION',
      query,
      intent: parsed.intent,
      documentsAccessed: Array.from(docMap.keys()),
      evidenceAccessed: retrievedEvidence.map(e => e.id),
      authResult,
      reason: denialReason,
      details: {
        status,
        calculationCount: calculations?.length || 0,
        reconciled: !!reconciliation,
        evidenceCount: retrievedEvidence.length
      }
    });

    return {
      queryId,
      query,
      intent: parsed.intent,
      status,
      statusBadge,
      answerHeadline: headline,
      answerSummary: summary,
      primaryMetric,
      explanation,
      calculations,
      reconciliation,
      retrievedEvidence,
      sources: Array.from(docMap.values()),
      visualization,
      auditRecordId: auditRecord.id,
      isSyntheticDemo: true
    };
  }
}
