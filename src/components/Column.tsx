import React from 'react';
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
  // Remove useDroppable since we're handling it at the board level
  
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
      
      <div className="column-content">
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
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;
