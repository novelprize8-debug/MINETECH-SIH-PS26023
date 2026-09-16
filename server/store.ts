import {
  AuditLogRecord,
  Classification,
  DocumentRecord,
  EvidenceRecord,
  UserProfile,
  UserRole
} from './types.js';

export class EvidenceStore {
  private users: Map<string, UserProfile> = new Map();
  private documents: Map<string, DocumentRecord> = new Map();
  private evidence: Map<string, EvidenceRecord> = new Map();
  private auditLogs: AuditLogRecord[] = [];
  private currentUserRole: UserRole = 'AUTHORITY';

  constructor() {
    this.seedUsers();
    this.seedDocuments();
    this.seedEvidence();
    this.seedInitialAuditLogs();
  }

  // --- User Profiles & Roles ---
  private seedUsers() {
    const defaultUsers: UserProfile[] = [
      {
        id: 'usr-auth-01',
        name: 'Dr. A. K. Singh',
        email: 'dir.technical@coalindia.gov.in',
        role: 'AUTHORITY',
        department: 'CIL Apex Technical Directorate (Kolkata)',
        clearanceLevel: 'HIGHLY_RESTRICTED'
      },
      {
        id: 'usr-emp-02',
        name: 'Rajesh Sharma',
        email: 'rsharma.mining@mcl.coalindia.in',
        role: 'EMPLOYEE',
        department: 'MCL Operations & Planning (Sambalpur)',
        clearanceLevel: 'INTERNAL'
      },
      {
        id: 'usr-aud-03',
        name: 'Priya Narayanan',
        email: 'pnarayanan.cag@gov.in',
        role: 'AUDITOR',
        department: 'Statutory Mining Audit & CAG Directorate',
        clearanceLevel: 'CONFIDENTIAL'
      },
      {
        id: 'usr-res-04',
        name: 'Dr. Vivek Sengupta',
        email: 'vsengupta.res@cmpdi.res.in',
        role: 'RESEARCHER',
        department: 'CMPDI Geological Exploration Division',
        clearanceLevel: 'PUBLIC'
      }
    ];

    for (const u of defaultUsers) {
      this.users.set(u.role, u);
    }
  }

  getCurrentUser(): UserProfile {
    return this.users.get(this.currentUserRole) || Array.from(this.users.values())[0];
  }

  setCurrentRole(role: UserRole): UserProfile {
    this.currentUserRole = role;
    const user = this.getCurrentUser();
    this.logAudit({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      action: 'ROLE_SWITCH',
      documentsAccessed: [],
      evidenceAccessed: [],
      authResult: 'GRANTED',
      details: { newRole: role, clearanceLevel: user.clearanceLevel }
    });
    return user;
  }

  getAllUsers(): UserProfile[] {
    return Array.from(this.users.values());
  }

  // --- Classification & Access Rules ---
  canAccessClassification(userRole: UserRole, classification: Classification): boolean {
    switch (userRole) {
      case 'AUTHORITY':
        return true; // Can access PUBLIC, INTERNAL, CONFIDENTIAL, HIGHLY_RESTRICTED
      case 'AUDITOR':
        return classification !== 'HIGHLY_RESTRICTED'; // Access PUBLIC, INTERNAL, CONFIDENTIAL
      case 'EMPLOYEE':
        return classification === 'PUBLIC' || classification === 'INTERNAL';
      case 'RESEARCHER':
        return classification === 'PUBLIC';
      default:
        return false;
    }
  }

  // --- Seed Documents ---
  private seedDocuments() {
    const docs: DocumentRecord[] = [
      {
        id: 'DOC-CIL-AR-2024',
        title: 'Coal India Limited Annual Statutory Report 2023-24',
        docNumber: 'CIL/AR/2023-24/STAT-01',
        issuingAuthority: 'Coal India Limited (CIL)',
        date: '2024-08-14',
        version: '1.0-AUDITED',
        classification: 'PUBLIC',
        isOfficial: true,
        isPrivate: false,
        pageCount: 348,
        sourceType: 'ANNUAL_REPORT',
        summary: 'Statutory audited annual performance report detailing subsidiary-wise physical production, dispatch, overburden removal, financial reconciliations, and ESG metrics for FY2023-24.',
        fileSize: '14.2 MB',
        isSyntheticDemo: true,
        uploadedAt: '2024-08-15T04:30:00.000Z'
      },
      {
        id: 'DOC-MOC-PROV-2024',
        title: 'Ministry of Coal Provisional Flash Coal Statistics (April 2024)',
        docNumber: 'MoC/STAT/FLASH/2024-04',
        issuingAuthority: 'Ministry of Coal, Government of India',
        date: '2024-04-03',
        version: '0.9-FLASH-PROVISIONAL',
        classification: 'PUBLIC',
        isOfficial: true,
        isPrivate: false,
        pageCount: 28,
        sourceType: 'PROVISIONAL_FLASH',
        summary: 'Early provisional flash monthly bulletin compiled within 72 hours of FY2023-24 close, based on unadjusted rapid conveyor and weighbridge telemetry.',
        fileSize: '2.1 MB',
        isSyntheticDemo: true,
        uploadedAt: '2024-04-05T09:15:00.000Z'
      },
      {
        id: 'DOC-MOC-TARGET-2023',
        title: 'Ministry of Coal MoU Target & Annual Action Plan FY2023-24',
        docNumber: 'MoC/MOU-PLAN/2023-24/REV-2',
        issuingAuthority: 'Ministry of Coal / CIL Board',
        date: '2023-04-12',
        version: '2.1-FINAL',
        classification: 'INTERNAL',
        isOfficial: true,
        isPrivate: false,
        pageCount: 84,
        sourceType: 'STATISTICAL_BULLETIN',
        summary: 'Cabinet Committee ratified production and dispatch targets broken down across subsidiary companies for FY2023-24.',
        fileSize: '4.8 MB',
        isSyntheticDemo: true,
        uploadedAt: '2023-04-15T06:00:00.000Z'
      },
      {
        id: 'DOC-CIL-HIST-5YR',
        title: 'CIL 5-Year Historical Performance Compendium (FY2020-21 to FY2024-25)',
        docNumber: 'CIL/STATS/5YR-COMP/2025',
        issuingAuthority: 'Coal India Limited Statistical Cell',
        date: '2025-04-10',
        version: '1.2',
        classification: 'PUBLIC',
        isOfficial: true,
        isPrivate: false,
        pageCount: 112,
        sourceType: 'STATISTICAL_BULLETIN',
        summary: 'Harmonized 5-year longitudinal series of subsidiary raw coal production, offtake, mechanization index, and safety indices.',
        fileSize: '8.4 MB',
        isSyntheticDemo: true,
        uploadedAt: '2025-04-12T10:00:00.000Z'
      },
      {
        id: 'DOC-CMPDI-GEO-TALCHER',
        title: 'CMPDI Geological Assessment & Stripping Ratio Evaluation: Talcher Coalfield',
        docNumber: 'CMPDI/RI-VII/GEO-SR-2024/09',
        issuingAuthority: 'Central Mine Planning & Design Institute (CMPDI)',
        date: '2024-06-20',
        version: '1.0-CONFIDENTIAL',
        classification: 'CONFIDENTIAL',
        isOfficial: true,
        isPrivate: false,
        pageCount: 196,
        sourceType: 'GEOLOGICAL_NOTE',
        summary: 'Geological exploration data, composite borehole stratigraphic logs, overburden stripping volume assessments, and seam-specific stripping ratio models for Mahanadi Coalfields Ltd.',
        fileSize: '22.6 MB',
        isSyntheticDemo: true,
        uploadedAt: '2024-06-22T08:00:00.000Z'
      },
      {
        id: 'DOC-RESTRICTED-SECURITY',
        title: 'Ministry of Coal Strategic Reserves & Sensitive Extraction Protocol (Classified)',
        docNumber: 'MoC/DEF-SEC/STRAT-RES/2024',
        issuingAuthority: 'Ministry of Coal / National Security Council',
        date: '2024-01-18',
        version: '3.0-RESTRICTED',
        classification: 'HIGHLY_RESTRICTED',
        isOfficial: true,
        isPrivate: false,
        pageCount: 54,
        sourceType: 'GEOLOGICAL_NOTE',
        summary: 'Strategic coking coal reserve allocations, high-grade reserve protection protocols, and confidential production ceilings.',
        fileSize: '5.1 MB',
        isSyntheticDemo: true,
        uploadedAt: '2024-01-20T11:00:00.000Z'
      },
      {
        id: 'DOC-RESEARCH-IITKGP-2024',
        title: 'Independent Field Assessment of Mahanadi Coalfields Extraction Efficiencies',
        docNumber: 'RES/IITKGP/MINING/2024-88',
        issuingAuthority: 'Department of Mining Engineering, IIT Kharagpur (Academic Study)',
        date: '2024-09-02',
        version: '0.8-WORKING-DRAFT',
        classification: 'PUBLIC',
        isOfficial: false,
        isPrivate: true,
        uploaderId: 'usr-res-04',
        uploaderName: 'Dr. Vivek Sengupta',
        uploaderRole: 'RESEARCHER',
        pageCount: 42,
        sourceType: 'RESEARCH_PAPER',
        summary: 'Academic research analyzing drone LiDAR volumetric estimation versus pithead reports for MCL open pits.',
        fileSize: '3.4 MB',
        isSyntheticDemo: true,
        uploadedAt: '2024-09-05T14:20:00.000Z'
      }
    ];

    for (const d of docs) {
      this.documents.set(d.id, d);
    }
  }

  // --- Seed Evidence ---
  private seedEvidence() {
    const records: EvidenceRecord[] = [
      // 1. FACT Workflow Core Record (MCL FY2023-24 Raw Coal Production)
      {
        id: 'EVD-MCL-PROD-2324-TOT',
        docId: 'DOC-CIL-AR-2024',
        docTitle: 'Coal India Limited Annual Statutory Report 2023-24',
        docNumber: 'CIL/AR/2023-24/STAT-01',
        docVersion: '1.0-AUDITED',
        issuingAuthority: 'Coal India Limited (CIL)',
        entity: 'MCL',
        metric: 'Raw Coal Production',
        value: 206.10,
        unit: 'Million Tonnes (MT)',
        period: 'FY2023-24',
        scope: 'Company Total',
        coalType: 'Non-Coking / Thermal',
        miningMethod: 'TOTAL',
        page: 42,
        tableOrSection: 'Table 4.2: Subsidiary-wise Physical Production Breakdown',
        excerpt: 'Mahanadi Coalfields Limited (MCL) achieved an unprecedented raw coal production of 206.10 Million Tonnes (MT) in FY2023-24, registering a growth of 6.63% over the previous fiscal output of 193.28 MT.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.99,
        classification: 'PUBLIC',
        timestamp: '2024-08-14T00:00:00.000Z',
        isSyntheticDemo: true,
        relationships: {
          derivedFrom: ['EVD-MCL-PROD-2324-OC', 'EVD-MCL-PROD-2324-UG'],
          supports: ['EVD-MCL-OFFTAKE-2324'],
          sameEntity: ['EVD-MCL-TARGET-2324', 'EVD-MCL-PROD-2324-PROV'],
          sameMetric: ['EVD-MCL-PROD-2021', 'EVD-MCL-PROD-2122', 'EVD-MCL-PROD-2223', 'EVD-MCL-PROD-2425']
        }
      },
      // OC and UG breakdown for MCL FY23-24 (Deterministic calculation verification)
      {
        id: 'EVD-MCL-PROD-2324-OC',
        docId: 'DOC-CIL-AR-2024',
        docTitle: 'Coal India Limited Annual Statutory Report 2023-24',
        docNumber: 'CIL/AR/2023-24/STAT-01',
        docVersion: '1.0-AUDITED',
        issuingAuthority: 'Coal India Limited (CIL)',
        entity: 'MCL',
        metric: 'Raw Coal Production',
        value: 205.85,
        unit: 'Million Tonnes (MT)',
        period: 'FY2023-24',
        scope: 'Company Total',
        coalType: 'Non-Coking / Thermal',
        miningMethod: 'OC',
        page: 42,
        tableOrSection: 'Table 4.2: Opencast vs Underground Production Segregation',
        excerpt: 'Opencast operations accounted for the predominant production share in MCL, delivering 205.85 MT (99.88%) of the total production across Talcher and Ib Valley fields.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.99,
        classification: 'PUBLIC',
        timestamp: '2024-08-14T00:00:00.000Z',
        isSyntheticDemo: true
      },
      {
        id: 'EVD-MCL-PROD-2324-UG',
        docId: 'DOC-CIL-AR-2024',
        docTitle: 'Coal India Limited Annual Statutory Report 2023-24',
        docNumber: 'CIL/AR/2023-24/STAT-01',
        docVersion: '1.0-AUDITED',
        issuingAuthority: 'Coal India Limited (CIL)',
        entity: 'MCL',
        metric: 'Raw Coal Production',
        value: 0.25,
        unit: 'Million Tonnes (MT)',
        period: 'FY2023-24',
        scope: 'Company Total',
        coalType: 'Non-Coking / Thermal',
        miningMethod: 'UG',
        page: 42,
        tableOrSection: 'Table 4.2: Opencast vs Underground Production Segregation',
        excerpt: 'Underground operations in MCL contributed 0.25 MT during the fiscal year, extracted through continuous haulage and conventional semi-mechanized working panels.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.98,
        classification: 'PUBLIC',
        timestamp: '2024-08-14T00:00:00.000Z',
        isSyntheticDemo: true
      },

      // 2. TREND Workflow Records (FY2020-21 to FY2024-25)
      {
        id: 'EVD-MCL-PROD-2021',
        docId: 'DOC-CIL-HIST-5YR',
        docTitle: 'CIL 5-Year Historical Performance Compendium (FY2020-21 to FY2024-25)',
        docNumber: 'CIL/STATS/5YR-COMP/2025',
        docVersion: '1.2',
        issuingAuthority: 'Coal India Limited Statistical Cell',
        entity: 'MCL',
        metric: 'Raw Coal Production',
        value: 148.01,
        unit: 'Million Tonnes (MT)',
        period: 'FY2020-21',
        scope: 'Company Total',
        coalType: 'Non-Coking / Thermal',
        miningMethod: 'TOTAL',
        page: 18,
        tableOrSection: 'Table 2.1: Five-Year Subsidiary Production Longitudinal Series',
        excerpt: 'In FY2020-21, MCL produced 148.01 MT of raw coal amidst pandemic operational restrictions.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.98,
        classification: 'PUBLIC',
        timestamp: '2025-04-10T00:00:00.000Z',
        isSyntheticDemo: true
      },
      {
        id: 'EVD-MCL-PROD-2122',
        docId: 'DOC-CIL-HIST-5YR',
        docTitle: 'CIL 5-Year Historical Performance Compendium (FY2020-21 to FY2024-25)',
        docNumber: 'CIL/STATS/5YR-COMP/2025',
        docVersion: '1.2',
        issuingAuthority: 'Coal India Limited Statistical Cell',
        entity: 'MCL',
        metric: 'Raw Coal Production',
        value: 168.17,
        unit: 'Million Tonnes (MT)',
        period: 'FY2021-22',
        scope: 'Company Total',
        coalType: 'Non-Coking / Thermal',
        miningMethod: 'TOTAL',
        page: 18,
        tableOrSection: 'Table 2.1: Five-Year Subsidiary Production Longitudinal Series',
        excerpt: 'FY2021-22 witnessed robust recovery as MCL production reached 168.17 MT, reflecting 13.62% YoY expansion.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.98,
        classification: 'PUBLIC',
        timestamp: '2025-04-10T00:00:00.000Z',
        isSyntheticDemo: true
      },
      {
        id: 'EVD-MCL-PROD-2223',
        docId: 'DOC-CIL-HIST-5YR',
        docTitle: 'CIL 5-Year Historical Performance Compendium (FY2020-21 to FY2024-25)',
        docNumber: 'CIL/STATS/5YR-COMP/2025',
        docVersion: '1.2',
        issuingAuthority: 'Coal India Limited Statistical Cell',
        entity: 'MCL',
        metric: 'Raw Coal Production',
        value: 193.28,
        unit: 'Million Tonnes (MT)',
        period: 'FY2022-23',
        scope: 'Company Total',
        coalType: 'Non-Coking / Thermal',
        miningMethod: 'TOTAL',
        page: 18,
        tableOrSection: 'Table 2.1: Five-Year Subsidiary Production Longitudinal Series',
        excerpt: 'MCL production surged to 193.28 MT in FY2022-23, positioning MCL as CILs largest producing subsidiary.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.99,
        classification: 'PUBLIC',
        timestamp: '2025-04-10T00:00:00.000Z',
        isSyntheticDemo: true
      },
      {
        id: 'EVD-MCL-PROD-2425',
        docId: 'DOC-CIL-HIST-5YR',
        docTitle: 'CIL 5-Year Historical Performance Compendium (FY2020-21 to FY2024-25)',
        docNumber: 'CIL/STATS/5YR-COMP/2025',
        docVersion: '1.2',
        issuingAuthority: 'Coal India Limited Statistical Cell',
        entity: 'MCL',
        metric: 'Raw Coal Production',
        value: 215.40,
        unit: 'Million Tonnes (MT)',
        period: 'FY2024-25',
        scope: 'Company Total',
        coalType: 'Non-Coking / Thermal',
        miningMethod: 'TOTAL',
        page: 19,
        tableOrSection: 'Table 2.2: FY2024-25 Provisional Year-End Summary',
        excerpt: 'For FY2024-25, provisional year-end compilation pegs MCL output at 215.40 MT.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.96,
        classification: 'PUBLIC',
        timestamp: '2025-04-10T00:00:00.000Z',
        isSyntheticDemo: true
      },

      // 3. TARGET VS ACTUAL Workflow Records
      {
        id: 'EVD-MCL-TARGET-2324',
        docId: 'DOC-MOC-TARGET-2023',
        docTitle: 'Ministry of Coal MoU Target & Annual Action Plan FY2023-24',
        docNumber: 'MoC/MOU-PLAN/2023-24/REV-2',
        docVersion: '2.1-FINAL',
        issuingAuthority: 'Ministry of Coal / CIL Board',
        entity: 'MCL',
        metric: 'Target Production',
        value: 204.00,
        unit: 'Million Tonnes (MT)',
        period: 'FY2023-24',
        scope: 'Company Total',
        coalType: 'Non-Coking / Thermal',
        miningMethod: 'TOTAL',
        page: 14,
        tableOrSection: 'Annexure II: Subsidiary MoU Production Targets FY2023-24',
        excerpt: 'The approved Annual Action Plan / MoU target assigned to Mahanadi Coalfields Limited (MCL) for FY2023-24 is 204.00 MT.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.99,
        classification: 'INTERNAL',
        timestamp: '2023-04-12T00:00:00.000Z',
        isSyntheticDemo: true,
        relationships: {
          sameEntity: ['EVD-MCL-PROD-2324-TOT']
        }
      },

      // 4. RECONCILIATION Workflow Record (Provisional Flash 204.50 vs Audited 206.10)
      {
        id: 'EVD-MCL-PROD-2324-PROV',
        docId: 'DOC-MOC-PROV-2024',
        docTitle: 'Ministry of Coal Provisional Flash Coal Statistics (April 2024)',
        docNumber: 'MoC/STAT/FLASH/2024-04',
        docVersion: '0.9-FLASH-PROVISIONAL',
        issuingAuthority: 'Ministry of Coal, Government of India',
        entity: 'MCL',
        metric: 'Raw Coal Production',
        value: 204.50,
        unit: 'Million Tonnes (MT)',
        period: 'FY2023-24',
        scope: 'Company Total',
        coalType: 'Non-Coking / Thermal',
        miningMethod: 'TOTAL',
        page: 6,
        tableOrSection: 'Table 1: Flash Subsidiary Output Estimates as of 31st March 2024',
        excerpt: 'Preliminary flash estimates compiled by the Coal Statistical Wing report MCL raw coal production for FY2023-24 at 204.50 MT. Note: Subject to statutory volumetric reconciliation and pithead stock adjustments.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.92,
        classification: 'PUBLIC',
        timestamp: '2024-04-03T00:00:00.000Z',
        isSyntheticDemo: true,
        relationships: {
          contradicts: ['EVD-MCL-PROD-2324-TOT'],
          sameEntity: ['EVD-MCL-PROD-2324-TOT']
        }
      },

      // 5. Stripping Ratio & Overburden Removal Records for MCL
      {
        id: 'EVD-MCL-OBR-2324',
        docId: 'DOC-CIL-AR-2024',
        docTitle: 'Coal India Limited Annual Statutory Report 2023-24',
        docNumber: 'CIL/AR/2023-24/STAT-01',
        docVersion: '1.0-AUDITED',
        issuingAuthority: 'Coal India Limited (CIL)',
        entity: 'MCL',
        metric: 'Overburden Removal',
        value: 247.32,
        unit: 'M.Cu.m',
        period: 'FY2023-24',
        scope: 'Company Total',
        coalType: 'All Overburden Rocks',
        miningMethod: 'OC',
        page: 54,
        tableOrSection: 'Table 5.1: Composite Overburden Removal Performance',
        excerpt: 'MCL achieved an overburden removal of 247.32 Million Cubic Metres (M.Cu.m) in FY2023-24, enabling significant pit face exposure for high-capacity dragline and shovel-dumper deployment.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.98,
        classification: 'PUBLIC',
        timestamp: '2024-08-14T00:00:00.000Z',
        isSyntheticDemo: true
      },
      {
        id: 'EVD-MCL-OFFTAKE-2324',
        docId: 'DOC-CIL-AR-2024',
        docTitle: 'Coal India Limited Annual Statutory Report 2023-24',
        docNumber: 'CIL/AR/2023-24/STAT-01',
        docVersion: '1.0-AUDITED',
        issuingAuthority: 'Coal India Limited (CIL)',
        entity: 'MCL',
        metric: 'Offtake',
        value: 202.40,
        unit: 'Million Tonnes (MT)',
        period: 'FY2023-24',
        scope: 'Company Total',
        coalType: 'Non-Coking / Thermal',
        miningMethod: 'TOTAL',
        page: 61,
        tableOrSection: 'Table 6.2: Subsidiary Offtake and Evacuation Realization',
        excerpt: 'Total coal offtake from MCL stood at 202.40 MT in FY2023-24, dispatched predominantly to power utilities via dedicated MGR (Merry-Go-Round) rail networks and Indian Railways rakes.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.99,
        classification: 'PUBLIC',
        timestamp: '2024-08-14T00:00:00.000Z',
        isSyntheticDemo: true
      },

      // Additional Subsidiary Records for Comparative Context (SECL, ECL, NCL, CIL Consolidated)
      {
        id: 'EVD-SECL-PROD-2324',
        docId: 'DOC-CIL-AR-2024',
        docTitle: 'Coal India Limited Annual Statutory Report 2023-24',
        docNumber: 'CIL/AR/2023-24/STAT-01',
        docVersion: '1.0-AUDITED',
        issuingAuthority: 'Coal India Limited (CIL)',
        entity: 'SECL',
        metric: 'Raw Coal Production',
        value: 187.35,
        unit: 'Million Tonnes (MT)',
        period: 'FY2023-24',
        scope: 'Company Total',
        coalType: 'Non-Coking / Thermal',
        miningMethod: 'TOTAL',
        page: 42,
        tableOrSection: 'Table 4.2: Subsidiary-wise Physical Production Breakdown',
        excerpt: 'South Eastern Coalfields Limited (SECL) recorded production of 187.35 MT in FY2023-24.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.99,
        classification: 'PUBLIC',
        timestamp: '2024-08-14T00:00:00.000Z',
        isSyntheticDemo: true
      },
      {
        id: 'EVD-NCL-PROD-2324',
        docId: 'DOC-CIL-AR-2024',
        docTitle: 'Coal India Limited Annual Statutory Report 2023-24',
        docNumber: 'CIL/AR/2023-24/STAT-01',
        docVersion: '1.0-AUDITED',
        issuingAuthority: 'Coal India Limited (CIL)',
        entity: 'NCL',
        metric: 'Raw Coal Production',
        value: 136.19,
        unit: 'Million Tonnes (MT)',
        period: 'FY2023-24',
        scope: 'Company Total',
        coalType: 'Non-Coking / Thermal',
        miningMethod: 'TOTAL',
        page: 42,
        tableOrSection: 'Table 4.2: Subsidiary-wise Physical Production Breakdown',
        excerpt: 'Northern Coalfields Limited (NCL) delivered 136.19 MT in FY2023-24, achieving 100% mechanized opencast operations.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.99,
        classification: 'PUBLIC',
        timestamp: '2024-08-14T00:00:00.000Z',
        isSyntheticDemo: true
      },
      {
        id: 'EVD-CIL-PROD-2324-TOT',
        docId: 'DOC-CIL-AR-2024',
        docTitle: 'Coal India Limited Annual Statutory Report 2023-24',
        docNumber: 'CIL/AR/2023-24/STAT-01',
        docVersion: '1.0-AUDITED',
        issuingAuthority: 'Coal India Limited (CIL)',
        entity: 'CIL',
        metric: 'Raw Coal Production',
        value: 773.60,
        unit: 'Million Tonnes (MT)',
        period: 'FY2023-24',
        scope: 'Consolidated Group',
        coalType: 'All Grades Combined',
        miningMethod: 'TOTAL',
        page: 11,
        tableOrSection: 'Executive Summary: CIL Group Operational Highlights',
        excerpt: 'Coal India Limited as a consolidated entity produced a record 773.60 MT of coal in FY2023-24, an increase of 10.0% compared to 703.20 MT in the preceding fiscal year.',
        extractionMethod: 'TABLE_EXTRACTION',
        reportedOrDerived: 'REPORTED',
        confidence: 0.99,
        classification: 'PUBLIC',
        timestamp: '2024-08-14T00:00:00.000Z',
        isSyntheticDemo: true
      },

      // Classified / Highly Restricted Evidence (Only accessible to AUTHORITY)
      {
        id: 'EVD-STRAT-COKING-2024',
        docId: 'DOC-RESTRICTED-SECURITY',
        docTitle: 'Ministry of Coal Strategic Reserves & Sensitive Extraction Protocol (Classified)',
        docNumber: 'MoC/DEF-SEC/STRAT-RES/2024',
        docVersion: '3.0-RESTRICTED',
        issuingAuthority: 'Ministry of Coal / National Security Council',
        entity: 'CIL',
        metric: 'Prime Coking Coal Strategic Allocation',
        value: 14.80,
        unit: 'Million Tonnes (MT)',
        period: 'FY2023-24',
        scope: 'National Security Reserve',
        coalType: 'Prime Metallurgical Coking Coal (Steel Grade I/II)',
        miningMethod: 'TOTAL',
        page: 7,
        tableOrSection: 'Table S-1: Critical Strategic Blast-Furnace Grade Reserves',
        excerpt: 'Classified national reserve allocation mandated preservation of 14.80 MT prime coking coal capacity for integrated domestic steel plants under emergency security directives.',
        extractionMethod: 'TEXT_NLP',
        reportedOrDerived: 'REPORTED',
        confidence: 0.99,
        classification: 'HIGHLY_RESTRICTED',
        timestamp: '2024-01-18T00:00:00.000Z',
        isSyntheticDemo: true
      },

      // Confidential Geological Evidence (Accessible to AUTHORITY and AUDITOR)
      {
        id: 'EVD-CMPDI-TALCHER-SR',
        docId: 'DOC-CMPDI-GEO-TALCHER',
        docTitle: 'CMPDI Geological Assessment & Stripping Ratio Evaluation: Talcher Coalfield',
        docNumber: 'CMPDI/RI-VII/GEO-SR-2024/09',
        docVersion: '1.0-CONFIDENTIAL',
        issuingAuthority: 'Central Mine Planning & Design Institute (CMPDI)',
        entity: 'MCL',
        metric: 'Field Geological Stripping Ratio',
        value: 1.20,
        unit: 'Cu.m / Tonne',
        period: 'FY2023-24',
        scope: 'Talcher Coalfield',
        coalType: 'Seam II / III Non-Coking',
        miningMethod: 'OC',
        page: 88,
        tableOrSection: 'Section 4.3: Geological Stripping Volume vs In-situ Coal Reserve',
        excerpt: 'CMPDI regional borehole modeling projects an average stripping ratio of 1.20 Cu.m of overburden per tonne of coal for operating blocks in the Talcher basin.',
        extractionMethod: 'OCR_VERIFIED',
        reportedOrDerived: 'REPORTED',
        confidence: 0.95,
        classification: 'CONFIDENTIAL',
        timestamp: '2024-06-20T00:00:00.000Z',
        isSyntheticDemo: true
      },

      // Private / Researcher Document Evidence (Marked USER_PROVIDED / UNVERIFIED)
      {
        id: 'EVD-RES-IITKGP-MCL-01',
        docId: 'DOC-RESEARCH-IITKGP-2024',
        docTitle: 'Independent Field Assessment of Mahanadi Coalfields Extraction Efficiencies',
        docNumber: 'RES/IITKGP/MINING/2024-88',
        docVersion: '0.8-WORKING-DRAFT',
        issuingAuthority: 'Department of Mining Engineering, IIT Kharagpur (Academic Study)',
        entity: 'MCL',
        metric: 'Raw Coal Production',
        value: 205.10,
        unit: 'Million Tonnes (MT)',
        period: 'FY2023-24',
        scope: 'Company Total',
        coalType: 'Non-Coking / Thermal',
        miningMethod: 'TOTAL',
        page: 12,
        tableOrSection: 'Table 3: Drone LiDAR Surface Photogrammetry Volumetric Estimation',
        excerpt: 'Drone-based photogrammetric pit surface volumetric scans extrapolated an estimated raw coal extraction of 205.10 MT from MCL active quarry voids during FY2023-24.',
        extractionMethod: 'USER_UPLOAD',
        reportedOrDerived: 'USER_PROVIDED',
        confidence: 0.88,
        classification: 'PUBLIC',
        timestamp: '2024-09-02T00:00:00.000Z',
        isSyntheticDemo: true
      }
    ];

    for (const r of records) {
      this.evidence.set(r.id, r);
    }
  }

  // --- Seed Initial Audit Logs ---
  private seedInitialAuditLogs() {
    this.auditLogs = [
      {
        id: 'AUD-INIT-001',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        user: {
          id: 'usr-auth-01',
          name: 'Dr. A. K. Singh',
          email: 'dir.technical@coalindia.gov.in',
          role: 'AUTHORITY'
        },
        action: 'SYSTEM_BOOTSTRAP',
        query: 'System initialization and provenance verification',
        documentsAccessed: ['DOC-CIL-AR-2024', 'DOC-MOC-TARGET-2023'],
        evidenceAccessed: ['EVD-MCL-PROD-2324-TOT', 'EVD-MCL-TARGET-2324'],
        authResult: 'GRANTED',
        details: { status: 'Operational', layerCheck: 'Layers 1 through 7 Verified' }
      }
    ];
  }

  // --- Document Methods ---
  getDocuments(userRole: UserRole, filters?: { search?: string; classification?: Classification; isOfficial?: boolean; isPrivate?: boolean }): DocumentRecord[] {
    let docs = Array.from(this.documents.values());

    // Authorization filter: user can only see documents their role allows
    docs = docs.filter(d => this.canAccessClassification(userRole, d.classification));

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      docs = docs.filter(d => 
        d.title.toLowerCase().includes(q) ||
        d.docNumber.toLowerCase().includes(q) ||
        d.issuingAuthority.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q)
      );
    }

    if (filters?.classification) {
      docs = docs.filter(d => d.classification === filters.classification);
    }

    if (typeof filters?.isOfficial === 'boolean') {
      docs = docs.filter(d => d.isOfficial === filters.isOfficial);
    }

    if (typeof filters?.isPrivate === 'boolean') {
      docs = docs.filter(d => d.isPrivate === filters.isPrivate);
    }

    return docs;
  }

  getDocumentById(id: string, userRole: UserRole): DocumentRecord | null {
    const doc = this.documents.get(id);
    if (!doc) return null;
    if (!this.canAccessClassification(userRole, doc.classification)) {
      return null;
    }
    return doc;
  }

  addDocument(doc: DocumentRecord): DocumentRecord {
    this.documents.set(doc.id, doc);
    return doc;
  }

  // --- Evidence Methods ---
  getEvidence(userRole: UserRole, filters?: {
    entity?: string;
    metric?: string;
    period?: string;
    miningMethod?: string;
    classification?: Classification;
    reportedOrDerived?: string;
    search?: string;
  }): EvidenceRecord[] {
    let list = Array.from(this.evidence.values());

    // CRITICAL: Authorization must happen BEFORE restricted evidence is passed to retrieval context or the LLM
    list = list.filter(e => this.canAccessClassification(userRole, e.classification));

    if (filters?.entity) {
      const ent = filters.entity.trim().toUpperCase();
      list = list.filter(e => e.entity.toUpperCase() === ent);
    }

    if (filters?.metric) {
      const met = filters.metric.toLowerCase();
      list = list.filter(e => e.metric.toLowerCase().includes(met));
    }

    if (filters?.period) {
      const per = filters.period.toLowerCase();
      list = list.filter(e => e.period.toLowerCase().includes(per));
    }

    if (filters?.miningMethod) {
      list = list.filter(e => e.miningMethod === filters.miningMethod);
    }

    if (filters?.classification) {
      list = list.filter(e => e.classification === filters.classification);
    }

    if (filters?.reportedOrDerived) {
      list = list.filter(e => e.reportedOrDerived === filters.reportedOrDerived);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(e =>
        e.entity.toLowerCase().includes(q) ||
        e.metric.toLowerCase().includes(q) ||
        e.docTitle.toLowerCase().includes(q) ||
        e.excerpt.toLowerCase().includes(q) ||
        e.tableOrSection.toLowerCase().includes(q)
      );
    }

    return list;
  }

  getEvidenceById(id: string, userRole: UserRole): EvidenceRecord | null {
    const item = this.evidence.get(id);
    if (!item) return null;
    if (!this.canAccessClassification(userRole, item.classification)) {
      return null;
    }
    return item;
  }

  addEvidenceRecord(record: EvidenceRecord): EvidenceRecord {
    this.evidence.set(record.id, record);
    return record;
  }

  // --- Audit Logging ---
  logAudit(entry: Omit<AuditLogRecord, 'id' | 'timestamp'>): AuditLogRecord {
    const record: AuditLogRecord = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.auditLogs.unshift(record);
    // Keep max 500 records
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return record;
  }

  getAuditLogs(filters?: { userRole?: UserRole; action?: string; search?: string }): AuditLogRecord[] {
    let logs = [...this.auditLogs];
    if (filters?.userRole) {
      logs = logs.filter(l => l.user.role === filters.userRole);
    }
    if (filters?.action) {
      logs = logs.filter(l => l.action === filters.action);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      logs = logs.filter(l =>
        l.query?.toLowerCase().includes(q) ||
        l.user.name.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
      );
    }
    return logs;
  }
}

export const evidenceStore = new EvidenceStore();
