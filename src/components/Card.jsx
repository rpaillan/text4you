import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import EditCardModal from './EditCardModal';
import './Card.scss';

const Card = ({ card, index, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
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
        {...listeners}
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
              onClick={() => setShowEditModal(true)}
            >
              ✏️
            </button>
            <button 
              className="delete-btn"
              onClick={() => onDelete(card.id)}
            >
              🗑️
            </button>
          </div>
        </div>
        
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

      {showEditModal && (
        <EditCardModal
          card={card}
          onClose={() => setShowEditModal(false)}
          onSubmit={(updatedData) => {
            onUpdate(card.id, updatedData);
            setShowEditModal(false);
          }}
        />
      )}
    </>
  );
};

export default Card;
