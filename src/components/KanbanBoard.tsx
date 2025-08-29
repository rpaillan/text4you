import React, { useState } from 'react';
import Card from './Card';
import {
  Card as CardType,
  CardStatus,
  CreateCardData,
} from '../types/index.js';
import './KanbanBoard.scss';

interface KanbanBoardProps {
  cards: CardType[];
  onAddCard: (_cardData: CreateCardData) => Promise<void>;
  onUpdateCard: (
    _id: number,
    _cardData: Partial<CreateCardData>
  ) => Promise<void>;
  onDeleteCard: (_id: number) => Promise<void>;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
}) => {
  const [tempCard, setTempCard] = useState<CardType | null>(null);

  const columns = [
    { id: 'idea' as const, title: 'Idea', color: '#6366f1' },
    { id: 'in_progress' as const, title: 'In Progress', color: '#f59e0b' },
    { id: 'done' as const, title: 'Done', color: '#10b981' },
  ];

  const startCreatingCard = (status: CardStatus): void => {
    // Create a temporary card with placeholder content
    const newTempCard: CardType = {
      id: -1, // Temporary ID (negative to distinguish from real cards)
      title: 'Click to edit title...',
      description: 'Click to add description...',
      status,
      priority: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTempCard(newTempCard);
  };

  const handleTempCardUpdate = async (
    _id: number,
    _cardData: Partial<CreateCardData>
  ): Promise<void> => {
    if (!tempCard) return;

    // If both title and description are still placeholders, cancel creation
    const title = _cardData.title || tempCard.title;
    const description = _cardData.description || tempCard.description;

    if (
      title === 'Click to edit title...' &&
      description === 'Click to add description...'
    ) {
      setTempCard(null);
      return;
    }

    // If title is still placeholder but description was changed, use empty title
    const finalTitle = title === 'Click to edit title...' ? '' : title;
    const finalDescription =
      description === 'Click to add description...' ? undefined : description;

    // Only save if we have a meaningful title
    if (finalTitle.trim()) {
      const createData: CreateCardData = {
        title: finalTitle,
        description: finalDescription,
        status: tempCard.status,
        priority: _cardData.priority || tempCard.priority,
      };

      await onAddCard(createData);
    }

    setTempCard(null);
  };

  const handleTempCardDelete = async (): Promise<void> => {
    setTempCard(null);
  };

  return (
    <div className='kanban-board'>
      <div className='board-header'>
        <button
          className='add-card-btn'
          onClick={() => startCreatingCard('idea')}
        >
          + Add Card
        </button>
      </div>

      <div className='vertical-card-list'>
        {columns.map(column => {
          const columnCards = cards.filter(card => card.status === column.id);

          if (columnCards.length === 0) return null;

          return (
            <div key={column.id} className='status-section'>
              <div
                className='status-header'
                style={{ borderLeftColor: column.color }}
              >
                <h2 className='status-title'>{column.title}</h2>
                <span className='status-count'>{columnCards.length}</span>
                <button
                  className='add-status-card-btn'
                  onClick={() => startCreatingCard(column.id)}
                  style={{ backgroundColor: column.color }}
                >
                  + Add to {column.title}
                </button>
              </div>

              <div className='status-cards'>
                {tempCard && tempCard.status === column.id && (
                  <div className='temp-card-wrapper'>
                    <Card
                      key={tempCard.id}
                      card={tempCard}
                      index={-1}
                      onUpdate={handleTempCardUpdate}
                      onDelete={handleTempCardDelete}
                    />
                  </div>
                )}

                {columnCards.map((card, index) => (
                  <Card
                    key={card.id}
                    card={card}
                    index={index}
                    onUpdate={onUpdateCard}
                    onDelete={onDeleteCard}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Show message if no cards exist */}
        {cards.length === 0 && !tempCard && (
          <div className='empty-state'>
            <h3>No cards yet</h3>
            <p>Click "Add Card" to create your first task!</p>
          </div>
        )}

        {/* Global temp card for when no sections exist */}
        {cards.length === 0 && tempCard && (
          <div className='global-card-creator'>
            <div className='temp-card-wrapper'>
              <Card
                key={tempCard.id}
                card={tempCard}
                index={-1}
                onUpdate={handleTempCardUpdate}
                onDelete={handleTempCardDelete}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
