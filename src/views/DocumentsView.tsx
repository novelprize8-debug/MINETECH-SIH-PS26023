import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Upload,
  Plus,
  Shield,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  FileCheck,
  X
} from 'lucide-react';
import { Classification, DocumentRecord, EvidenceRecord, UserProfile } from '../types';

interface DocumentsViewProps {
  currentUser: UserProfile | null;
  onInspectEvidence: (evidence: EvidenceRecord) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ currentUser, onInspectEvidence }) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [docEvidence, setDocEvidence] = useState<EvidenceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDocNumber, setUploadDocNumber] = useState('');
  const [uploadAuthority, setUploadAuthority] = useState('');
  const [uploadSummary, setUploadSummary] = useState('');
  const [uploadClaimValue, setUploadClaimValue] = useState('208.50');
  const [uploadClaimPeriod, setUploadClaimPeriod] = useState('FY2023-24');
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
        if (!selectedDoc && data.documents.length > 0) {
          selectDocument(data.documents[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDoc(data.document);
        setDocEvidence(data.evidence || []);
      } else {
        const err = await res.json();
        alert(err.message || 'Access restricted');
      }
    } catch (err) {
      console.error('Error fetching doc details:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentUser?.role]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setIsUploading(true);
    try {
      const payload = {
        title: uploadTitle,
        docNumber: uploadDocNumber || `DOC-USR-${Date.now().toString().slice(-4)}`,
        issuingAuthority: uploadAuthority || `${currentUser?.name} (Researcher)`,
        summary: uploadSummary || 'User uploaded document.',
        classification: 'PUBLIC',
        pageCount: 18,
        isPrivate: currentUser?.role === 'RESEARCHER',
        extractedClaims: [
          {
            entity: 'MCL',
            metric: 'Raw Coal Production',
            value: Number(uploadClaimValue) || 208.5,
            unit: 'Million Tonnes (MT)',
            period: uploadClaimPeriod,
            scope: 'Company Total',
            miningMethod: 'TOTAL',
            page: 12,
            tableOrSection: 'Field Survey Table 3',
            excerpt: `Field estimate indicates MCL produced ${uploadClaimValue} MT for ${uploadClaimPeriod}. Labeled PRIVATE / UNVERIFIED.`
          }
        ]
      };

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchDocuments();
        setShowUploadModal(false);
        setUploadTitle('');
        setUploadSummary('');
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClassification =
      classificationFilter === 'ALL' || doc.classification === classificationFilter;
    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'OFFICIAL' && doc.isOfficial) ||
      (typeFilter === 'PRIVATE' && doc.isPrivate);

    return matchesSearch && matchesClassification && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Statutory Document Workspace</h2>
          <p className="text-xs text-slate-500">
            Authorized repository of official filings, provisional notes, and user-submitted research
          </p>
        </div>
        <button
          id="upload-doc-modal-btn"
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload PDF / Research Paper</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents by title, number, or authority…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Source Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white text-slate-800"
          >
            <option value="ALL">All Sources</option>
            <option value="OFFICIAL">Official Statutory Only</option>
            <option value="PRIVATE">Private / User Uploaded</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Classification:</span>
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white text-slate-800"
          >
            <option value="ALL">All Clearances</option>
            <option value="PUBLIC">PUBLIC</option>
            <option value="INTERNAL">INTERNAL</option>
            <option value="CONFIDENTIAL">CONFIDENTIAL</option>
            <option value="HIGHLY_RESTRICTED">HIGHLY RESTRICTED</option>
          </select>
        </div>
      </div>

      {/* Master Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List (Left 5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Documents ({filteredDocs.length})</span>
            <span className="text-[10px] text-slate-400 font-mono">Role Clearance: {currentUser?.clearanceLevel}</span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => selectDocument(doc.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-bold text-slate-900 line-clamp-1">{doc.title}</span>
                    {doc.isPrivate ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                        PRIVATE / UNVERIFIED
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                        OFFICIAL
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="font-mono text-slate-700">{doc.docNumber}</span>
                    <span>v{doc.version}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-1">{doc.issuingAuthority}</div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{doc.date}</span>
                    <span className="font-mono font-semibold text-slate-600">{doc.classification}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Document Details & Extracted Evidence (Right 7 Cols) */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-5">
              {/* Header */}
              <div className="space-y-2 pb-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {selectedDoc.sourceType}
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedDoc.isPrivate && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        PRIVATE / UNVERIFIED
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                      {selectedDoc.classification}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{selectedDoc.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedDoc.summary}</p>
              </div>

              {/* Metadata Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Document Ref</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedDoc.docNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Issuing Authority</span>
                  <span className="font-semibold text-slate-800">{selectedDoc.issuingAuthority}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Release Date</span>
                  <span className="font-semibold text-slate-800">{selectedDoc.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Version</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedDoc.version}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Page Count</span>
                  <span className="font-semibold text-slate-800">{selectedDoc.pageCount} Pages</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">File Size</span>
                  <span className="font-semibold text-slate-800">{selectedDoc.fileSize || '2.4 MB'}</span>
                </div>
              </div>

              {/* Extracted Evidence Claims Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Extracted Evidence Records ({docEvidence.length})
                  </h4>
                  <span className="text-[10px] text-slate-400">Audited extraction points</span>
                </div>

                {docEvidence.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    No evidence extracted for this document or active clearance insufficient.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {docEvidence.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => onInspectEvidence(ev)}
                        className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{ev.metric}</span>
                          <span className="font-mono font-bold text-emerald-700">
                            {ev.value} {ev.unit}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">
                          "{ev.excerpt}"
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>
                            Page {ev.page} • {ev.tableOrSection}
                          </span>
                          <span className="text-emerald-700 font-semibold">Inspect Provenance →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              Select a document to inspect metadata and extracted evidence.
            </div>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Upload PDF / Research Document</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Drone Lidar Volumetric Survey Report: Mahanadi Coalfields"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Ref #</label>
                  <input
                    type="text"
                    placeholder="e.g., IIT-DRN-2024-08"
                    value={uploadDocNumber}
                    onChange={(e) => setUploadDocNumber(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issuing Authority</label>
                  <input
                    type="text"
                    placeholder="e.g., IIT Kharagpur Mining Dept"
                    value={uploadAuthority}
                    onChange={(e) => setUploadAuthority(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Summary / Context</label>
                <textarea
                  rows={2}
                  placeholder="Independent research findings regarding MCL production or coal stock volumes…"
                  value={uploadSummary}
                  onChange={(e) => setUploadSummary(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs outline-hidden"
                />
              </div>

              {/* Research Claim Extraction Preview */}
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="font-semibold text-amber-900 flex items-center justify-between">
                  <span>Simulated Extractable Metric Finding:</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                    AUTOMATIC CLAIM NLP
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-600 text-[11px] block">Claimed Production (MT):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={uploadClaimValue}
                      onChange={(e) => setUploadClaimValue(e.target.value)}
                      className="w-full p-1.5 bg-white border border-amber-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-[11px] block">Period:</label>
                    <input
                      type="text"
                      value={uploadClaimPeriod}
                      onChange={(e) => setUploadClaimPeriod(e.target.value)}
                      className="w-full p-1.5 bg-white border border-amber-300 rounded font-mono"
                    />
                  </div>
                </div>
                <div className="text-[10px] text-amber-800 italic">
                  Notice: Research uploads will be marked <strong>PRIVATE / UNVERIFIED</strong>. They will never override official statutory evidence.
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold flex items-center gap-1.5"
                >
                  {isUploading ? 'Registering Document…' : 'Save to Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
