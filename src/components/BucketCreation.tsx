import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKanbanStore } from '../store/kanbanStore';
import './Board.scss'; // Reuse existing styles

interface BucketCreationProps {
  bucketName: string;
}

const BucketCreation: React.FC<BucketCreationProps> = ({ bucketName }) => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();
  const createBucket = useKanbanStore(state => state.createBucket);

  const handleCreateBucket = async () => {
    setIsCreating(true);

    try {
      const result = createBucket(bucketName, isPrivate);

      if (result.token) {
        setGeneratedToken(result.token);
        // Navigate to the new bucket with the token
        navigate(
          `/bucket/${bucketName}?token=${encodeURIComponent(result.token)}`
        );
      } else {
        // Navigate to the new bucket without token
        navigate(`/bucket/${bucketName}`);
      }
    } catch (error) {
      console.error('Error creating bucket:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className='kanban-board'>
      <div
        className='bucket-creation-container'
        style={{
          maxWidth: '500px',
          margin: '50px auto',
          padding: '30px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          className='bucket-creation-header'
          style={{ marginBottom: '30px', textAlign: 'center' }}
        >
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>
            Create Bucket: "{bucketName}"
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            This bucket doesn't exist yet. Would you like to create it?
          </p>
        </div>

        <div className='bucket-creation-form'>
          <div className='form-group' style={{ marginBottom: '25px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '15px',
                backgroundColor: isPrivate
                  ? 'var(--accent-color)'
                  : 'var(--bg-primary)',
                border: `2px solid ${isPrivate ? 'var(--accent-color)' : 'var(--border-color)'}`,
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                color: isPrivate ? 'white' : 'var(--text-primary)',
              }}
            >
              <input
                type='checkbox'
                checked={isPrivate}
                onChange={e => setIsPrivate(e.target.checked)}
                style={{ marginRight: '12px', transform: 'scale(1.2)' }}
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  🔒 Make this bucket private
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  Private buckets require a token to access and view tasks
                </div>
              </div>
            </label>
          </div>

          {isPrivate && (
            <div
              className='token-preview'
              style={{
                marginBottom: '25px',
                padding: '15px',
                backgroundColor: 'var(--bg-primary)',
                border: '2px dashed var(--accent-color)',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text-primary)',
                }}
              >
                🔑 Auto-generated Token:
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  padding: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '4px',
                  color: 'var(--accent-color)',
                  wordBreak: 'break-all',
                }}
              >
                A secure token will be generated for this bucket
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  marginTop: '8px',
                }}
              >
                💡 Save this token - you'll need it to access this bucket later
              </div>
            </div>
          )}

          <div
            className='form-actions'
            style={{ display: 'flex', gap: '15px' }}
          >
            <button
              onClick={handleCancel}
              disabled={isCreating}
              style={{
                flex: 1,
                padding: '12px 20px',
                border: '2px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleCreateBucket}
              disabled={isCreating}
              style={{
                flex: 2,
                padding: '12px 20px',
                border: 'none',
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                borderRadius: '8px',
                cursor: isCreating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                opacity: isCreating ? 0.7 : 1,
              }}
            >
              {isCreating
                ? '⏳ Creating...'
                : `✨ Create ${isPrivate ? 'Private' : ''} Bucket`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BucketCreation;
