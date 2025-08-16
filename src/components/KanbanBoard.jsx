import React, { useState } from 'react';
import Column from './Column';
import AddCardModal from './AddCardModal';
import './KanbanBoard.scss';

const KanbanBoard = ({ cards, onAddCard, onUpdateCard, onDeleteCard }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('idea');

  const columns = [
    { id: 'idea', title: 'Idea', color: '#6366f1' },
    { id: 'in_progress', title: 'In Progress', color: '#f59e0b' },
    { id: 'done', title: 'Done', color: '#10b981' }
  ];

  const handleAddCard = (cardData) => {
    onAddCard({ ...cardData, status: selectedStatus });
    setShowAddModal(false);
  };

  const openAddModal = (status) => {
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
