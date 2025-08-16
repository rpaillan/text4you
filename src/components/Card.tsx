import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  // Remove the local showEditModal state
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`card ${isDragging ? 'dragging' : ''}`}
      >
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
        
        <div 
          className="card-drag-handle"
          {...listeners}
        >
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
