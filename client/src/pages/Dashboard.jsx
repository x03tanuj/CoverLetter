import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, PlusCircle, History, FileText, Award, Briefcase, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await API.get('/cover-letter');
        setLetters(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute Stats Client-side
  const totalLetters = letters.length;

  const mostAppliedRole = (() => {
    if (!letters || letters.length === 0) return 'None';
    const counts = {};
    letters.forEach((l) => {
      const role = l.jobTitle?.trim();
      if (role) {
        counts[role] = (counts[role] || 0) + 1;
      }
    });
    let topRole = 'None';
    let maxCount = 0;
    Object.entries(counts).forEach(([role, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topRole = role;
      }
    });
    return topRole;
  })();

  const finalizedPercentage = (() => {
    if (totalLetters === 0) return '0%';
    const finalized = letters.filter((l) => l.status === 'final' || l.editedText).length;
    return `${Math.round((finalized / totalLetters) * 100)}%`;
  })();

  return (
    <div style={{ maxWidth: '1000px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="neo-badge neo-badge-coral" style={{ marginBottom: '1rem' }}>
          <Sparkles size={14} style={{ marginRight: '6px' }} /> AI-POWERED GENERATOR
        </div>
        <h1 style={{ fontSize: '2.75rem', lineHeight: '1.2', marginBottom: '1rem' }}>
          Craft the Perfect Cover Letter in Seconds
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>
          Connect your resume background to any job description using tailored AI.
        </p>
      </div>

      {/* Two Large Circular Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2.5rem',
        marginBottom: '4rem',
        flexWrap: 'wrap'
      }}>
        {/* Coral Circle - New Letter */}
        <Link
          to="/generate"
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-coral)',
            border: '3px solid var(--border-dark)',
            boxShadow: '4px 4px 0px var(--border-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#FFFFFF',
            textDecoration: 'none',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '1.15rem',
            transition: 'all 0.15s ease-in-out',
            textAlign: 'center',
            padding: '1rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-3px, -3px)';
            e.currentTarget.style.boxShadow = '6px 6px 0px var(--border-dark)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0px, 0px)';
            e.currentTarget.style.boxShadow = '4px 4px 0px var(--border-dark)';
          }}
        >
          <PlusCircle size={36} />
          <span>New Letter</span>
        </Link>

        {/* Soft Teal Circle - View History */}
        <Link
          to="/history"
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-teal)',
            border: '3px solid var(--border-dark)',
            boxShadow: '4px 4px 0px var(--border-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: 'var(--text-main)',
            textDecoration: 'none',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '1.15rem',
            transition: 'all 0.15s ease-in-out',
            textAlign: 'center',
            padding: '1rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-3px, -3px)';
            e.currentTarget.style.boxShadow = '6px 6px 0px var(--border-dark)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0px, 0px)';
            e.currentTarget.style.boxShadow = '4px 4px 0px var(--border-dark)';
          }}
        >
          <History size={36} />
          <span>View History</span>
        </Link>
      </div>

      {/* Three Stat Cards Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Your Application Stats</h2>
          {loading && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Loader2 size={14} className="spin" /> Syncing...</span>}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          
          {/* Stat 1: Letters Generated */}
          <div className="neo-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="neo-label" style={{ marginBottom: 0 }}>Letters Generated</span>
              <div className="neo-badge neo-badge-yellow" style={{ padding: '0.25rem 0.5rem' }}>
                <FileText size={14} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              {loading ? '...' : totalLetters}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Total letters created to date
            </p>
          </div>

          {/* Stat 2: Customization / Edit Rate */}
          <div className="neo-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="neo-label" style={{ marginBottom: 0 }}>Finalized Rate</span>
              <div className="neo-badge neo-badge-teal" style={{ padding: '0.25rem 0.5rem' }}>
                <Award size={14} />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              {loading ? '...' : finalizedPercentage}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Letters refined & saved as final
            </p>
          </div>

          {/* Stat 3: Most Applied Role */}
          <div className="neo-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="neo-label" style={{ marginBottom: 0 }}>Most Applied Role</span>
              <div className="neo-badge neo-badge-coral" style={{ padding: '0.25rem 0.5rem' }}>
                <Briefcase size={14} />
              </div>
            </div>
            <div style={{
              fontSize: '1.35rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {loading ? '...' : mostAppliedRole}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Top target position frequency
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
