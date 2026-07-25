import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  Sparkles,
  History,
  FileText,
  PlusCircle,
  ExternalLink,
  Trash2,
  Loader2,
  AlertCircle,
  Calendar,
  Briefcase
} from 'lucide-react';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await API.get('/cover-letter');
      setLetters(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cover letter history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title, company) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the cover letter for "${title} at ${company}"?`);
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await API.delete(`/cover-letter/${id}`);
      setLetters((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete cover letter.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="neo-badge neo-badge-teal" style={{ marginBottom: '0.5rem' }}>
            <History size={14} style={{ marginRight: '6px' }} /> ARCHIVE
          </div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Cover Letter History</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Review, edit, and manage all your generated cover letters.
          </p>
        </div>

        <Link to="/generate" className="neo-btn neo-btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          <PlusCircle size={18} /> New Letter
        </Link>
      </div>

      {error && (
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
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div className="neo-badge neo-badge-teal" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
            <Loader2 size={18} className="spin" style={{ marginRight: '8px' }} /> Loading History...
          </div>
        </div>
      ) : letters.length === 0 ? (
        /* Empty State (20d) */
        <div className="neo-card-lg" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>No Cover Letters Yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '450px', margin: '0 auto 2rem auto' }}>
            You haven't generated any cover letters yet. Upload a resume and enter target job details to start.
          </p>
          <Link to="/generate" className="neo-btn neo-btn-yellow" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            <Sparkles size={18} /> Create Your First Letter
          </Link>
        </div>
      ) : (
        /* Cards Grid / List (20b) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {letters.map((letter) => {
            const isFinal = letter.status === 'final';
            const isDeleting = deletingId === letter._id;

            return (
              <div
                key={letter._id}
                className="neo-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  opacity: isDeleting ? 0.5 : 1
                }}
              >
                {/* Left info */}
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`neo-badge ${isFinal ? 'neo-badge-teal' : 'neo-badge-coral'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                      {isFinal ? 'FINAL' : 'DRAFT'}
                    </span>
                    <span className="neo-badge neo-badge-gray" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', textTransform: 'capitalize' }}>
                      {letter.tone}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {new Date(letter.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>
                    {letter.jobTitle}
                  </h3>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    @ {letter.company}
                  </p>
                </div>

                {/* Right Action Buttons (20c) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link
                    to={`/result/${letter._id}`}
                    className="neo-btn neo-btn-teal"
                    style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}
                  >
                    <span>Review & Edit</span> <ExternalLink size={15} />
                  </Link>

                  <button
                    onClick={() => handleDelete(letter._id, letter.jobTitle, letter.company)}
                    className="neo-btn"
                    disabled={isDeleting}
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#FDE8E8',
                      color: '#9B1C1C'
                    }}
                    title="Delete Letter"
                  >
                    {isDeleting ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default HistoryPage;
