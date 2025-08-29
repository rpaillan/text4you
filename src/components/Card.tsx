import React, { useState } from 'react';

import { Card as CardType, Priority, CreateCardData } from '../types/index.js';
import './Card.scss';

interface CardProps {
  card: CardType;
  index: number;
  onUpdate: (id: number, cardData: Partial<CreateCardData>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (card: CardType) => void;
}

const Card: React.FC<CardProps> = ({ card, onUpdate, onDelete, onEdit }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');

  const handleSaveTitle = async () => {
    if (editTitle.trim() && editTitle !== card.title) {
      await onUpdate(card.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setEditTitle(card.title);
    setIsEditingTitle(false);
  };

  const handleSaveDescription = async () => {
    if (editDescription !== card.description) {
      await onUpdate(card.id, { description: editDescription.trim() || undefined });
    }
    setIsEditingDescription(false);
  };

  const handleCancelDescription = () => {
    setEditDescription(card.description || '');
    setIsEditingDescription(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelTitle();
    }
  };

  const handleDescriptionKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveDescription();
    } else if (e.key === 'Escape') {
      handleCancelDescription();
    }
  };

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="card-priority">
            <span 
              className="priority-dot"
              style={{ backgroundColor: getPriorityColor(card.priority) }}
            />
            {card.priority}
          </div>
          <div className="card-actions">
            <button 
              className="edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
              }}
            >
              ✏️ 
            </button>
            <button 
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card.id);
              }}
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div className="card-content">
          {/* Title Section */}
          <div className="card-title-section">
            {isEditingTitle ? (
              <div className="inline-edit-container">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleTitleKeyPress}
                  onBlur={handleSaveTitle}
                  className="inline-edit-input"
                  autoFocus
                />
                <div className="inline-edit-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSaveTitle}
                    title="Save (Enter)"
                  >
                    ✓
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancelTitle}
                    title="Cancel (Esc)"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <h4 
                className="card-title"
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit"
              >
                {card.title}
              </h4>
            )}
          </div>
          
          {/* Description Section */}
          <div className="card-description-section">
            {isEditingDescription ? (
              <div className="inline-edit-container">
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onKeyDown={handleDescriptionKeyPress}
                  onBlur={handleSaveDescription}
                  className="inline-edit-textarea"
                  placeholder="Add a description..."
                  autoFocus
                />
                <div className="inline-edit-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSaveDescription}
                    title="Save (Ctrl+Enter)"
                  >
                    ✓
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancelDescription}
                    title="Cancel (Esc)"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <p 
                className={`card-description ${!card.description ? 'empty-description' : ''}`}
                onClick={() => setIsEditingDescription(true)}
                title="Click to edit"
              >
                {card.description || 'Click to add description...'}
              </p>
            )}
          </div>
          
          <div className="card-footer">
            <span className="card-date">
              Created: {formatDate(card.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Remove the local EditCardModal component */}
    </>
  );
};

export default Card;
