import React, { useState } from 'react';
import Card from './Card';
import AddCardModal from './AddCardModal';
import { Card as CardType, CardStatus, CreateCardData } from '../types/index.js';
import './KanbanBoard.scss';

interface KanbanBoardProps {
  cards: CardType[];
  onAddCard: (cardData: CreateCardData) => Promise<void>;
  onUpdateCard: (id: number, cardData: Partial<CreateCardData>) => Promise<void>;
  onDeleteCard: (id: number) => Promise<void>;
  onEditCard: (card: CardType) => void;
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
      
      <div className="vertical-card-list">
        {columns.map(column => {
          const columnCards = cards.filter(card => card.status === column.id);
          
          if (columnCards.length === 0) return null;
          
          return (
            <div key={column.id} className="status-section">
              <div className="status-header" style={{ borderLeftColor: column.color }}>
                <h2 className="status-title">{column.title}</h2>
                <span className="status-count">{columnCards.length}</span>
                <button 
                  className="add-status-card-btn"
                  onClick={() => openAddModal(column.id)}
                  style={{ backgroundColor: column.color }}
                >
                  + Add to {column.title}
                </button>
              </div>
              
              <div className="status-cards">
                {columnCards.map((card, index) => (
                  <Card
                    key={card.id}
                    card={card}
                    index={index}
                    onUpdate={onUpdateCard}
                    onDelete={onDeleteCard}
                    onEdit={onEditCard}
                  />
                ))}
              </div>
            </div>
          );
        })}
        
        {/* Show message if no cards exist */}
        {cards.length === 0 && (
          <div className="empty-state">
            <h3>No cards yet</h3>
            <p>Click "Add Card" to create your first task!</p>
          </div>
        )}
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
