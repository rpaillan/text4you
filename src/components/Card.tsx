import React from 'react';
import { Card as CardType, Priority, CreateCardData } from '../types/index.js';
import './Card.scss';

interface CardProps {
  card: CardType;
  index: number;
  onUpdate: (id: number, cardData: Partial<CreateCardData>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (card: CardType) => void;
}

const Card: React.FC<CardProps> = ({ card, onDelete, onEdit }) => {

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
          <h4 className="card-title">{card.title}</h4>
          
          {card.description && (
            <p className="card-description">{card.description}</p>
          )}
          
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
