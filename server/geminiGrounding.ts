import { GoogleGenAI } from '@google/genai';
import { DeterministicCalculation, EvidenceRecord, ExplanationLabel, ReconciliationResult } from './types.js';

export class GeminiGroundingService {
  private static aiClient: GoogleGenAI | null = null;

  private static getAi(): GoogleGenAI | null {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }
    if (!this.aiClient) {
      this.aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return this.aiClient;
  }

  /**
   * Produce a strictly evidence-grounded explanation.
   * Rules:
   * 1. Gemini NEVER calculates or performs arithmetic.
   * 2. Gemini must only explain retrieved evidence.
   * 3. If evidence is insufficient, returns "INSUFFICIENT EVIDENCE" label and text.
   * 4. Uses mandatory labels: REPORTED | DERIVED | DOCUMENTED ASSOCIATION | SUPPORTED EXPLANATION | INSUFFICIENT EVIDENCE.
   * 5. Fallback gracefully if API key is not provided or network is unreachable.
   */
  static async explainEvidence(params: {
    query: string;
    evidence: EvidenceRecord[];
    calculations?: DeterministicCalculation[];
    reconciliation?: ReconciliationResult;
    entity?: string;
    metric?: string;
    period?: string;
  }): Promise<{
    label: ExplanationLabel;
    text: string;
    geminiGrounded: boolean;
  }> {
    const { query, evidence, calculations, reconciliation, entity, metric, period } = params;

    // Check if evidence is empty or insufficient
    if (!evidence || evidence.length === 0) {
      return {
        label: 'INSUFFICIENT EVIDENCE',
        text: `No verified statutory records exist in the authorized corpus for ${entity || 'the requested entity'} relating to "${metric || 'the requested metric'}" in ${period || 'the requested period'}. The system adheres to strict evidence governance: no answers will be synthesized or extrapolated without documented provenance.`,
        geminiGrounded: false
      };
    }

    // Determine appropriate label
    let defaultLabel: ExplanationLabel = 'REPORTED';
    if (calculations && calculations.length > 0) {
      defaultLabel = 'DERIVED';
    } else if (reconciliation) {
      defaultLabel = 'DOCUMENTED ASSOCIATION';
    } else {
      defaultLabel = 'SUPPORTED EXPLANATION';
    }

    const ai = this.getAi();

    // Context formatting for strict grounding
    const evidenceSummary = evidence.map((e, idx) => 
      `[Source Ref ${idx + 1}]: Document: "${e.docTitle}" (Doc #${e.docNumber}, v${e.docVersion}, Issuing Authority: ${e.issuingAuthority}, Page: ${e.page}, Section: "${e.tableOrSection}"). Entity: ${e.entity}, Metric: ${e.metric}, Value: ${e.value} ${e.unit}, Period: ${e.period}, Method: ${e.miningMethod}. Excerpt: "${e.excerpt}"`
    ).join('\n\n');

    const calculationsSummary = calculations && calculations.length > 0
      ? calculations.map(c => 
          `[Deterministic Engine Output]: Formula: ${c.formulaName} (${c.formulaExpression}). Inputs: ${JSON.stringify(c.inputs)}. Result: ${c.output} ${c.unit}. Verified Deterministic: true.`
        ).join('\n')
      : 'None required.';

    const reconciliationSummary = reconciliation
      ? `[Reconciliation Engine Finding]: Status: ${reconciliation.status}. Item A: ${reconciliation.itemA.value} ${reconciliation.itemA.unit} (${reconciliation.itemA.docTitle}), Item B: ${reconciliation.itemB.value} ${reconciliation.itemB.unit} (${reconciliation.itemB.docTitle}). Diagnostic: ${reconciliation.diagnosticExplanation}. Documentary Reason: ${reconciliation.documentaryReason || 'N/A'}.`
      : 'N/A';

    if (ai) {
      try {
        const prompt = `You are the Evidence Intelligence Explainer for CMPDI / Coal India Limited (CIL) SIH 2026 PS 26023.
You must adhere strictly to these non-negotiable rules:
1. NEVER compute, recalculate, or alter any numbers. All arithmetic has already been executed deterministically by the system.
2. Ground your explanation EXCLUSIVELY in the provided verified evidence. Do NOT add external facts, unverified statistics, or speculate beyond the provided sources.
3. If the evidence does not support an assertion, explicitly state that evidence is insufficient.
4. Keep the response crisp, authoritative, objective, and enterprise-grade. Mention specific source documents, pages, and tables.

USER QUERY: "${query}"

VERIFIED EVIDENCE PROVIDED:
${evidenceSummary}

DETERMINISTIC COMPUTATIONS (Pre-calculated):
${calculationsSummary}

RECONCILIATION DATA:
${reconciliationSummary}

Write a professional, concise 2 to 3 paragraph explanation synthesizing this verified evidence. End with a 1-sentence provenance statement citing the exact source documents.`;

        const callPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.1, // Low temperature for high factual adherence
          }
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 4000)
        );

        const response = await Promise.race([callPromise, timeoutPromise]);

        const generatedText = response.text?.trim();
        if (generatedText) {
          return {
            label: defaultLabel,
            text: generatedText,
            geminiGrounded: true
          };
        }
      } catch (err) {
        console.warn('Gemini grounding fallback triggered:', err);
      }
    }

    // High-fidelity deterministic fallback if API key is absent or network fails
    let fallbackText = '';
    const prime = evidence[0];

    if (reconciliation) {
      fallbackText = `According to the CIL Evidence Intelligence Reconciliation layer, the comparison between ${reconciliation.itemA.docTitle} (${reconciliation.itemA.value} ${reconciliation.itemA.unit}) and ${reconciliation.itemB.docTitle} (${reconciliation.itemB.value} ${reconciliation.itemB.unit}) exhibits status "${reconciliation.status}". ${reconciliation.diagnosticExplanation} ${reconciliation.documentaryReason ? 'Documentary rationale: ' + reconciliation.documentaryReason : ''}`;
    } else if (calculations && calculations.length > 0) {
      const c = calculations[0];
      fallbackText = `Verified statutory records for ${prime.entity} confirm ${prime.metric} in ${prime.period}. Using deterministic calculation (${c.formulaName}: ${c.formulaExpression}), the computed result is ${c.output} ${c.unit}. Provenance verified from ${prime.docTitle} (Page ${prime.page}, ${prime.tableOrSection}).`;
    } else {
      fallbackText = `According to verified statutory filing "${prime.docTitle}" (Document #${prime.docNumber}, Page ${prime.page}, ${prime.tableOrSection}), ${prime.entity} recorded a ${prime.metric} of ${prime.value} ${prime.unit} for ${prime.period}. Extraction method: ${prime.extractionMethod} with verified confidence rating of ${(prime.confidence * 100).toFixed(1)}%.`;
    }

    return {
      label: defaultLabel,
      text: fallbackText,
      geminiGrounded: false
    };
  }
}
