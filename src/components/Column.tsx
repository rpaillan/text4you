import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Card from './Card';
import { Card as CardType, CardStatus, CreateCardData } from '../types/index.js';
import './Column.scss';

interface ColumnProps {
  id: CardStatus;
  title: string;
  color: string;
  cards: CardType[];
  onAddCard: () => void;
  onUpdateCard: (id: number, cardData: Partial<CreateCardData>) => Promise<void>;
  onDeleteCard: (id: number) => Promise<void>;
  onEditCard: (card: CardType) => void;
}

const Column: React.FC<ColumnProps> = ({ 
  id, 
  title, 
  color, 
  cards, 
  onAddCard, 
  onUpdateCard, 
  onDeleteCard,
  onEditCard
}) => {
  // Add back useDroppable for individual columns to accept drops
  const { setNodeRef, isOver, active } = useDroppable({
    id: id,
    data: {
      accepts: ['card'],
      type: 'column',
      status: id,
      priority: 'high' // Higher priority than board
    }
  });
  
  // Determine if we should show the drop preview and where
  const shouldShowDropPreview = isOver && active && active.data?.current?.type === 'card';
  if (id === 'done') {
    console.log('shouldShowDropPreview', {
      id,
      shouldShowDropPreview,
      isOver,
      active,
      cards: cards.length,
      type: active?.data?.current?.type
    });
  }
  return (
    <div className="column">
      <div className="column-header" style={{ borderTopColor: color }}>
        <h3 className="column-title">{title}</h3>
        <span className="card-count">{cards.length}</span>
        <button 
          className="add-card-btn"
          onClick={() => onAddCard()}
          style={{ backgroundColor: color }}
        >
          +
        </button>
      </div>
      
      <div
        ref={setNodeRef}
        className={`column-content ${isOver ? 'dragging-over' : ''}`}
      >
        <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              index={index}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
              onEdit={onEditCard}
            />
          ))}
          
          {/* Smart drop preview placeholder - shows at the end when dragging over */}
          {shouldShowDropPreview && (
            <div className="drop-preview-placeholder">
              <div className="placeholder-content">
                <div className="placeholder-priority"></div>
                <div className="placeholder-title"></div>
                <div className="placeholder-description"></div>
                <div className="placeholder-footer"></div>
              </div>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;
