import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Card from './Card';
import './Column.scss';

const Column = ({ id, title, color, cards, onAddCard, onUpdateCard, onDeleteCard }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

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
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;
