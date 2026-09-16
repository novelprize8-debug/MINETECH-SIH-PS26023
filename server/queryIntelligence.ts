import { QueryIntent, QueryUnderstandingResult } from './types.js';

export class QueryIntelligence {
  /**
   * Parse a natural-language query and infer:
   * - intent
   * - entity (MCL, ECL, BCCL, CCL, WCL, SECL, NCL, CIL, CMPDI)
   * - metric (raw coal production, offtake, overburden, target, etc.)
   * - period (single fiscal year or multi-year range)
   * - scope / miningMethod (OC, UG, Total)
   * 
   * Strict Rule: The user must NOT select a query type manually.
   */
  static parse(query: string): QueryUnderstandingResult {
    const raw = query.trim();
    const q = raw.toLowerCase();

    // 1. Entity Extraction
    const entityPatterns: Array<{ name: string; pattern: RegExp }> = [
      { name: 'MCL', pattern: /\bmcl\b|mahanadi/i },
      { name: 'SECL', pattern: /\bsecl\b|south\s*eastern/i },
      { name: 'NCL', pattern: /\bncl\b|northern\s*coalfields/i },
      { name: 'ECL', pattern: /\becl\b|eastern\s*coalfields/i },
      { name: 'BCCL', pattern: /\bbccl\b|bharat\s*coking/i },
      { name: 'CCL', pattern: /\bccl\b|central\s*coalfields/i },
      { name: 'WCL', pattern: /\bwcl\b|western\s*coalfields/i },
      { name: 'CMPDI', pattern: /\bcmpdi\b|central\s*mine\s*planning/i },
      { name: 'CIL', pattern: /\bcil\b|coal\s*india/i },
    ];

    let detectedEntity = 'MCL'; // Default context in demo if unspecified
    let foundEntity = false;
    for (const ep of entityPatterns) {
      if (ep.pattern.test(q)) {
        detectedEntity = ep.name;
        foundEntity = true;
        break;
      }
    }

    // 2. Metric Extraction
    let metric = 'Raw Coal Production';
    if (/overburden|obr|stripping/i.test(q)) {
      metric = 'Overburden Removal';
    } else if (/offtake|dispatch|evacuation/i.test(q)) {
      metric = 'Offtake';
    } else if (/target/i.test(q) && !/actual/i.test(q)) {
      metric = 'Target Production';
    } else if (/washed|coking/i.test(q)) {
      metric = 'Washed Coal';
    }

    // 3. Period Range or Single Period
    let period: string | undefined = undefined;
    let periodRange: string[] | undefined = undefined;

    // Detect ranges like "FY2020-21 to FY2024-25" or "from 2020 to 2025" or "5 year" or "trend"
    if (/(2020[-–]21\s*(to|-)\s*2024[-–]25)|(from\s*fy\s*2020|5[- ]year|trend)/i.test(q)) {
      periodRange = ['FY2020-21', 'FY2021-22', 'FY2022-23', 'FY2023-24', 'FY2024-25'];
      period = 'FY2020-21 to FY2024-25';
    } else if (/2024[-–]25/i.test(q)) {
      period = 'FY2024-25';
    } else if (/2023[-–]24/i.test(q)) {
      period = 'FY2023-24';
    } else if (/2022[-–]23/i.test(q)) {
      period = 'FY2022-23';
    } else if (/2021[-–]22/i.test(q)) {
      period = 'FY2021-22';
    } else if (/2020[-–]21/i.test(q)) {
      period = 'FY2020-21';
    } else {
      // Default to the central benchmark fiscal year FY2023-24
      period = 'FY2023-24';
    }

    // 4. Mining Method / Scope
    let miningMethod: 'OC' | 'UG' | 'TOTAL' = 'TOTAL';
    if (/\b(opencast|oc)\b/i.test(q)) {
      miningMethod = 'OC';
    } else if (/\b(underground|ug)\b/i.test(q)) {
      miningMethod = 'UG';
    }

    // 5. Intent Inference
    let intent: QueryIntent = 'FACT';

    // Check for REPORT
    if (/report|prepare\s*a\s*.*report|executive\s*summary|performance\s*report|briefing/i.test(q)) {
      intent = 'REPORT';
    }
    // Check for RECONCILIATION
    else if (/why\s*are\s*these\s*(two|different)|reconcil|discrepan|different\s*production\s*figures|variance\s*between|difference/i.test(q)) {
      intent = 'RECONCILIATION';
    }
    // Check for TARGET_VS_ACTUAL
    else if ((/target\s*(vs|and|versus)\s*actual/i.test(q)) || (/compare.*target.*actual/i.test(q)) || (/deviation/i.test(q))) {
      intent = 'TARGET_VS_ACTUAL';
    }
    // Check for TREND
    else if (/trend|over\s*time|historical|growth|trajectory|longitudinal|progression/i.test(q) || periodRange !== undefined) {
      intent = 'TREND';
    }
    // Check for RESEARCH_COMPARISON
    else if (/research|paper|academic|field\s*assessment|iit|drone/i.test(q)) {
      intent = 'RESEARCH_COMPARISON';
    }
    // Check for CALCULATION
    else if (/calculate|formula|sum|percentage|cagr|stripping\s*ratio|oc\s*\+\s*ug/i.test(q)) {
      intent = 'CALCULATION';
    }
    // Check for COMPARE across subsidiaries
    else if (/compare|versus|vs|against/i.test(q) && !/target/i.test(q)) {
      intent = 'COMPARE';
    }
    // Check for EVIDENCE_AUDIT
    else if (/audit|provenance|source|where\s*did\s*this|cite/i.test(q)) {
      intent = 'EVIDENCE_AUDIT';
    }
    // Check for EXPLANATION
    else if (/explain|how\s*did|context|driver/i.test(q)) {
      intent = 'EXPLANATION';
    }
    else {
      intent = 'FACT';
    }

    return {
      rawQuery: raw,
      intent,
      entity: detectedEntity,
      metric,
      period,
      periodRange,
      scope: 'Company Total',
      miningMethod,
      needsCalculation: intent === 'TARGET_VS_ACTUAL' || intent === 'CALCULATION' || intent === 'REPORT' || intent === 'FACT',
      needsReconciliation: intent === 'RECONCILIATION',
      needsReport: intent === 'REPORT'
    };
  }
}
