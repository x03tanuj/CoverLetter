import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Save,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Download,
  Award
} from 'lucide-react';

const Result = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [letter, setLetter] = useState(null);
  const [currentText, setCurrentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Action Loading States
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    fetchLetterDetails();
  }, [id]);

  const fetchLetterDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await API.get(`/cover-letter/${id}`);
      setLetter(data);
      setCurrentText(data.editedText || data.generatedText || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cover letter.');
    } finally {
      setLoading(false);
    }
  };

  // Saved baseline to compare for unsaved changes
  const savedBaseline = letter ? (letter.editedText || letter.generatedText || '') : '';
  const isDirty = currentText !== savedBaseline;

  // Save Edits
  const handleSave = async (statusOverride = null) => {
    setSaving(true);
    setSaveSuccessMsg('');
    setError('');

    try {
      const payload = { editedText: currentText };
      if (statusOverride) {
        payload.status = statusOverride;
      }

      const { data } = await API.put(`/cover-letter/${id}`, payload);
      setLetter(data);
      setCurrentText(data.editedText || data.generatedText || '');
      setSaveSuccessMsg(statusOverride === 'final' ? 'Marked as Final!' : 'Changes saved successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Final/Draft Status
  const handleToggleStatus = () => {
    const nextStatus = letter.status === 'final' ? 'draft' : 'final';
    handleSave(nextStatus);
  };

  // Regenerate Cover Letter
  const handleRegenerate = async () => {
    if (!letter) return;
    setRegenerating(true);
    setError('');

    try {
      const { data } = await API.post('/cover-letter/generate', {
        jobTitle: letter.jobTitle,
        company: letter.company,
        jobDescriptionText: letter.jobDescriptionText,
        resumeId: letter.resumeIdUsed,
        achievements: letter.achievements,
        tone: letter.tone,
        length: letter.length
      });

      setLetter(data);
      setCurrentText(data.generatedText);
      setSaveSuccessMsg('Regenerated new cover letter!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to regenerate cover letter.');
    } finally {
      setRegenerating(false);
    }
  };

  // Copy to Clipboard
  const handleCopy = () => {
    if (!currentText) return;
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Helper to sanitize unicode and markdown text for clean jsPDF rendering
  const sanitizeTextForPDF = (text) => {
    if (!text) return '';
    return text
      .replace(/\r\n|\r/g, '\n')
      .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\u2022/g, '-')
      .replace(/\u2026/g, '...')
      .replace(/\*\*(.+?)\*\*/g, (_match, p1) => p1)
      .replace(/\*([^*]+)\*/g, (_match, p1) => p1)
      .replace(/_([^_]+)_/g, (_match, p1) => p1)
      .replace(/^#+\s+/gm, '')
      .replace(/^[*\-]\s+/gm, '- ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Export PDF - Formatted Standard Business Cover Letter
  const handleExportPDF = async () => {
    if (!currentText || !letter) return;

    setExporting(true);
    setError('');

    try {
      const doc = new jsPDF({
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 50; // Standard 50pt margin (~0.7in)
      const contentWidth = pageWidth - margin * 2;

      let cursorY = margin;

      const checkPageBreak = (neededHeight) => {
        if (cursorY + neededHeight > pageHeight - margin - 20) {
          doc.addPage();
          cursorY = margin;
        }
      };

      // 1. Candidate Header (Name & Contact Email)
      const candidateName = user?.name ? sanitizeTextForPDF(user.name) : 'Applicant';
      const candidateEmail = user?.email ? sanitizeTextForPDF(user.email) : '';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text(candidateName, margin, cursorY);
      cursorY += 18;

      if (candidateEmail) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(75, 85, 99);
        doc.text(candidateEmail, margin, cursorY);
        cursorY += 14;
      }

      // 2. Subtle Divider Line
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.75);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 16;

      // 3. Metadata Line: Date & Target Info
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(107, 114, 128);
      const formattedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(formattedDate, margin, cursorY);

      const targetInfo = letter.jobTitle && letter.company
        ? `Position: ${letter.jobTitle} @ ${letter.company}`
        : letter.company ? `Company: ${letter.company}` : '';

      if (targetInfo) {
        doc.text(targetInfo, pageWidth - margin, cursorY, { align: 'right' });
      }
      cursorY += 22;

      // 4. Letter Body (paragraphs with clean line wrapping and standard spacing)
      const cleanText = sanitizeTextForPDF(currentText);
      const paragraphs = cleanText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

      const fontSize = 10.5;
      const lineHeight = 15;
      const paragraphSpacing = 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(31, 41, 55);

      paragraphs.forEach((para, pIdx) => {
        const lines = para.split('\n');
        lines.forEach((lineText) => {
          const wrappedLines = doc.splitTextToSize(lineText.trim(), contentWidth);
          wrappedLines.forEach((line) => {
            checkPageBreak(lineHeight);
            doc.text(line, margin, cursorY);
            cursorY += lineHeight;
          });
        });

        if (pIdx < paragraphs.length - 1) {
          cursorY += paragraphSpacing;
        }
      });

      // 5. Multi-page Pagination (if applicable)
      const totalPages = doc.internal.getNumberOfPages();
      if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(156, 163, 175);
          doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 25, { align: 'center' });
        }
      }

      const sanitizedCompany = (letter.company || 'cover_letter')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .toLowerCase();
      doc.save(`cover-letter-${sanitizedCompany}.pdf`);

      setSaveSuccessMsg('PDF downloaded successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Word count
  const letterWordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '4rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <div className="neo-badge neo-badge-teal" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
          <Loader2 size={18} className="spin" style={{ marginRight: '8px' }} /> Loading Cover Letter...
        </div>
      </div>
    );
  }

  if (error && !letter) {
    return (
      <div style={{ maxWidth: '700px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div className="neo-card-lg" style={{ textAlign: 'center' }}>
          <AlertCircle size={40} color="#9B1C1C" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Error Loading Letter</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <Link to="/" className="neo-btn neo-btn-primary">
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link to="/history" className="neo-btn" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to History
        </Link>

        {isDirty && (
          <span className="neo-badge neo-badge-yellow" style={{ padding: '0.3rem 0.75rem' }}>
            ● Unsaved Changes
          </span>
        )}
      </div>

      {saveSuccessMsg && (
        <div style={{
          backgroundColor: '#DEF7EC',
          border: '2.5px solid var(--border-dark)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          color: '#03543F',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-hard)'
        }}>
          <CheckCircle2 size={18} /> {saveSuccessMsg}
        </div>
      )}

      {/* Main Container Card */}
      <div className="neo-card-lg" style={{ marginBottom: '2rem' }}>
        
        {/* Header Title & Status Badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              {letter.jobTitle}
            </h1>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              @ {letter.company}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`neo-badge ${letter.status === 'final' ? 'neo-badge-teal' : 'neo-badge-coral'}`}>
              {letter.status === 'final' ? 'FINAL' : 'DRAFT'}
            </span>
          </div>
        </div>

        {/* Metadata Row */}
        <div style={{
          display: 'flex',
          gap: '1rem 2rem',
          flexWrap: 'wrap',
          fontSize: '0.85rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-main)',
          border: '2px solid var(--border-dark)',
          borderRadius: '10px',
          marginBottom: '1.75rem'
        }}>
          <div>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Tone: </span>
            <span style={{ fontWeight: 600 }}>{letter.tone}</span>
          </div>
          <div>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Length: </span>
            <span style={{ fontWeight: 600 }}>{letter.length}</span>
          </div>
          <div>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Created: </span>
            <span style={{ fontWeight: 600 }}>{new Date(letter.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Toolbar Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
          
          {/* Save Button */}
          <button
            onClick={() => handleSave()}
            className="neo-btn neo-btn-yellow"
            disabled={saving || !isDirty}
            style={{ opacity: !isDirty && !saving ? 0.6 : 1 }}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          {/* Regenerate Button */}
          <button
            onClick={handleRegenerate}
            className="neo-btn neo-btn-teal"
            disabled={regenerating}
          >
            {regenerating ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
            <span>{regenerating ? 'Regenerating...' : 'Regenerate'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="neo-btn"
          >
            {copied ? <Check size={16} color="green" /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            className="neo-btn neo-btn-primary"
            disabled={exporting}
          >
            {exporting ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
            <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>

          {/* Mark Final / Draft Toggle */}
          <button
            onClick={handleToggleStatus}
            className="neo-btn"
            style={{ marginLeft: 'auto' }}
          >
            <Award size={16} />
            <span>{letter.status === 'final' ? 'Revert to Draft' : 'Mark as Final'}</span>
          </button>
        </div>

        {/* Editable Text Area */}
        <div style={{ position: 'relative' }}>
          <textarea
            className="neo-input"
            rows={14}
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              lineHeight: '1.6',
              padding: '1.25rem',
              minHeight: '340px',
              resize: 'vertical'
            }}
          />

          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            backgroundColor: '#FFFFFF',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid #DDD'
          }}>
            {letterWordCount} words | {currentText.length} chars
          </div>
        </div>

      </div>

    </div>
  );
};

export default Result;
