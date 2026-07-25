import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import API from '../services/api';
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

  const [letter, setLetter] = useState(null);
  const [currentText, setCurrentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Action Loading States
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
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

  // Export PDF (21c)
  const handleExportPDF = () => {
    if (!currentText || !letter) return;

    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const maxLineWidth = pageWidth - margin * 2;

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`${letter.jobTitle} - Cover Letter`, margin, 60);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Company: ${letter.company}  |  Date: ${new Date(letter.createdAt).toLocaleDateString()}`, margin, 78);

    // Line separator
    doc.setDrawColor(200);
    doc.setLineWidth(1);
    doc.line(margin, 90, pageWidth - margin, 90);

    // Body text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30);

    const lines = doc.splitTextToSize(currentText, maxLineWidth);
    
    let cursorY = 115;
    const lineHeight = 16;

    lines.forEach((line) => {
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    const sanitizedCompany = letter.company.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    doc.save(`cover-letter-${sanitizedCompany}.pdf`);
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

          {/* Export PDF Button (21b) */}
          <button
            onClick={handleExportPDF}
            className="neo-btn neo-btn-primary"
          >
            <Download size={16} />
            <span>Export PDF</span>
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
