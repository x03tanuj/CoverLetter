import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
  Briefcase,
  Sliders,
  Award,
  ArrowRight
} from 'lucide-react';

const GenerateForm = () => {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loadingResumes, setLoadingResumes] = useState(true);

  // Form Fields
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [achievements, setAchievements] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('standard');

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Generation State
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  // Load Resumes
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async (autoSelectId = null) => {
    try {
      setLoadingResumes(true);
      const { data } = await API.get('/resume');
      setResumes(data);
      if (autoSelectId) {
        setSelectedResumeId(autoSelectId);
      } else if (data.length > 0 && !selectedResumeId) {
        setSelectedResumeId(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoadingResumes(false);
    }
  };

  // Upload New Resume Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchResumes(data.resumeId);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to parse resume file.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Word Count Calculation
  const wordCount = jobDescriptionText.trim() ? jobDescriptionText.trim().split(/\s+/).length : 0;
  const isWordCountExcessive = wordCount > 2000;

  const isFormValid =
    selectedResumeId &&
    jobTitle.trim() &&
    company.trim() &&
    jobDescriptionText.trim();

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setGenerating(true);
    setGenError('');

    try {
      const { data } = await API.post('/cover-letter/generate', {
        jobTitle,
        company,
        jobDescriptionText,
        resumeId: selectedResumeId,
        achievements,
        tone,
        length
      });

      navigate(`/result/${data._id}`);
    } catch (err) {
      setGenError(err.response?.data?.message || 'Failed to generate cover letter. Please try again.');
      setGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1.5rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="neo-badge neo-badge-coral" style={{ marginBottom: '0.75rem' }}>
          <Sparkles size={14} style={{ marginRight: '6px' }} /> GENERATE COVER LETTER
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Create Your Custom Cover Letter
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Select your resume and enter the target job details to generate an aligned, high-converting letter.
        </p>
      </div>

      {genError && (
        <div style={{
          backgroundColor: '#FDE8E8',
          border: '2.5px solid var(--border-dark)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: '#9B1C1C',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: 'var(--shadow-hard)'
        }}>
          <AlertCircle size={20} /> {genError}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit}>

        {/* Section 1: Resume Selection (18a) */}
        <div className="neo-card-lg" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>1. Select Resume Source</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Choose a parsed resume or upload a new PDF/DOCX file.
              </p>
            </div>

            {/* Quick Upload Button */}
            <label className="neo-btn neo-btn-teal" style={{ cursor: 'pointer', margin: 0 }}>
              {uploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
              <span>{uploading ? 'Parsing...' : 'Upload New Resume'}</span>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
          </div>

          {uploadError && (
            <div style={{ color: '#9B1C1C', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
              ⚠️ {uploadError}
            </div>
          )}

          {loadingResumes ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading resumes...
            </div>
          ) : resumes.length === 0 ? (
            <div style={{
              border: '2px dashed var(--border-dark)',
              borderRadius: '10px',
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-main)'
            }}>
              <FileText size={32} style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }} />
              <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>No resumes uploaded yet</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Upload your resume (PDF or DOCX) to get started.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {resumes.map((r) => {
                const isSelected = selectedResumeId === r._id;
                return (
                  <div
                    key={r._id}
                    onClick={() => setSelectedResumeId(r._id)}
                    style={{
                      border: '2.5px solid var(--border-dark)',
                      borderRadius: '12px',
                      padding: '1rem',
                      backgroundColor: isSelected ? 'var(--color-yellow)' : '#FFFFFF',
                      boxShadow: isSelected ? '4px 4px 0px var(--border-dark)' : '2px 2px 0px var(--border-dark)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', wordBreak: 'break-all' }}>
                        {r.originalFileName}
                      </span>
                      {isSelected && <CheckCircle2 size={18} color="var(--border-dark)" />}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: isSelected ? '#1A1A1A' : 'var(--text-muted)', lineHeight: '1.4' }}>
                      Uploaded: {new Date(r.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Target Job Details (18b) */}
        <div className="neo-card-lg" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>2. Target Job Details</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="neo-label">Job Title *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="neo-input"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="neo-label">Company Name *</label>
              <input
                type="text"
                className="neo-input"
                placeholder="e.g. Stripe / Acme Corp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="neo-label" style={{ margin: 0 }}>Job Description *</label>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                color: isWordCountExcessive ? '#9B1C1C' : 'var(--text-muted)'
              }}>
                {wordCount} words {isWordCountExcessive && '(Exceeds recommended 2,000 words limit)'}
              </span>
            </div>
            <textarea
              className="neo-input"
              rows={6}
              placeholder="Paste full job description requirements here..."
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <label className="neo-label">Key Achievements / Highlights to Include (Optional)</label>
            <textarea
              className="neo-input"
              rows={3}
              placeholder="e.g. Led a team of 5 engineers, increased API performance by 40%, built high-scale payment processing."
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Section 3: Tone & Length Customization (18c) */}
        <div className="neo-card-lg" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>3. Tone & Length Preferences</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label className="neo-label">Writing Tone</label>
              <select
                className="neo-input"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="professional">Professional (Balanced & Articulate)</option>
                <option value="confident">Confident (Bold & Result-driven)</option>
                <option value="formal">Formal (Traditional & Executive)</option>
                <option value="conversational">Conversational (Modern & Tech-forward)</option>
                <option value="modern">Modern Startup (Crisp & Direct)</option>
              </select>
            </div>

            <div>
              <label className="neo-label">Target Length</label>
              <select
                className="neo-input"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              >
                <option value="standard">Standard (~250-350 words, 3-4 paragraphs)</option>
                <option value="short">Short (~150-200 words, 2-3 paragraphs)</option>
                <option value="detailed">Detailed (~400-500 words, 4-5 paragraphs)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            className="neo-btn neo-btn-primary"
            disabled={!isFormValid || generating}
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.15rem',
              opacity: !isFormValid || generating ? 0.6 : 1,
              cursor: !isFormValid || generating ? 'not-allowed' : 'pointer'
            }}
          >
            {generating ? (
              <>
                <Loader2 size={22} className="spin" /> Generating Cover Letter...
              </>
            ) : (
              <>
                Generate Cover Letter <Sparkles size={20} />
              </>
            )}
          </button>
        </div>

      </form>

      {/* Loading Overlay Modal during generation */}
      {generating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(26, 26, 26, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="neo-card-lg" style={{ textAlign: 'center', maxWidth: '450px', backgroundColor: '#FFFFFF' }}>
            <div className="neo-badge neo-badge-yellow" style={{ marginBottom: '1.25rem', padding: '0.5rem 1rem' }}>
              <Loader2 size={18} className="spin" style={{ marginRight: '6px' }} /> AI GENERATION IN PROGRESS
            </div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>Drafting Your Letter</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Connecting candidate experience with job requirements using Llama 3.3 AI...
            </p>
            <div style={{
              height: '8px',
              backgroundColor: 'var(--color-light-gray)',
              border: '2px solid var(--border-dark)',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                backgroundColor: 'var(--color-coral)',
                width: '70%',
                animation: 'pulse 1.5s infinite ease-in-out'
              }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GenerateForm;
