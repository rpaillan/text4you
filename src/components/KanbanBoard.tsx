import React, { useState } from 'react';
import Column from './Column';
import AddCardModal from './AddCardModal';
import { Card, CardStatus, CreateCardData } from '../types/index.js';
import './KanbanBoard.scss';

interface KanbanBoardProps {
  cards: Card[];
  onAddCard: (cardData: CreateCardData) => Promise<void>;
  onUpdateCard: (id: number, cardData: Partial<CreateCardData>) => Promise<void>;
  onDeleteCard: (id: number) => Promise<void>;
  onEditCard: (card: Card) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  cards, 
  onAddCard, 
  onUpdateCard, 
  onDeleteCard,
  onEditCard
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<CardStatus>('idea');

  const columns = [
    { id: 'idea' as const, title: 'Idea', color: '#6366f1' },
    { id: 'in_progress' as const, title: 'In Progress', color: '#f59e0b' },
    { id: 'done' as const, title: 'Done', color: '#10b981' }
  ];

  const handleAddCard = (cardData: CreateCardData): void => {
    onAddCard({ ...cardData, status: selectedStatus });
    setShowAddModal(false);
  };

  const openAddModal = (status: CardStatus): void => {
    setSelectedStatus(status);
    setShowAddModal(true);
  };

  return (
    <div className="kanban-board">
      <div className="board-header">
        <button 
          className="add-card-btn"
          onClick={() => openAddModal('idea')}
        >
          + Add Card
        </button>
      </div>
      
      <div className="board-columns">
        {columns.map(column => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            cards={cards.filter(card => card.status === column.id)}
            onAddCard={() => openAddModal(column.id)}
            onUpdateCard={onUpdateCard}
            onDeleteCard={onDeleteCard}
            onEditCard={onEditCard}
          />
        ))}
      </div>

      {showAddModal && (
        <AddCardModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCard}
          initialStatus={selectedStatus}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
