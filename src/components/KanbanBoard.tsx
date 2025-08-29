import React, { useState } from 'react';
import Card from './Card';
import {
  Card as CardType,
  CardStatus,
  CreateCardData,
  Column,
} from '../types/index.js';
import './KanbanBoard.scss';

export const NEW_CARD_TITLE = 'Click to edit title...';
export const NEW_CARD_DESCRIPTION = 'Click to add description...';

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

  const columns: Column[] = [
    {
      id: 'in_progress' as const,
      title: 'Work in Motion 🔄',
      color: '#f59e0b',
    },
    { id: 'idea' as const, title: 'Brain Blast 💡', color: '#6366f1' },
    { id: 'done' as const, title: 'Done', color: '#10b981' },
  ];

  const startCreatingCard = (status: CardStatus): void => {
    // Create a temporary card with placeholder content
    const newTempCard: CardType = {
      id: -1, // Temporary ID (negative to distinguish from real cards)
      title: NEW_CARD_TITLE,
      description: NEW_CARD_DESCRIPTION,
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

    if (title === NEW_CARD_TITLE && description === NEW_CARD_DESCRIPTION) {
      setTempCard(null);
      return;
    }

    // If title is still placeholder but description was changed, use empty title
    const finalTitle = title === NEW_CARD_TITLE ? '' : title;
    const finalDescription =
      description === NEW_CARD_DESCRIPTION ? undefined : description;

    const createData: CreateCardData = {
      title: finalTitle,
      description: finalDescription,
      status: tempCard.status,
      priority: _cardData.priority || tempCard.priority,
    };

    await onAddCard(createData);

    setTempCard(null);
  };

  const handleTempCardDelete = async (): Promise<void> => {
    setTempCard(null);
  };

  return (
    <div className='kanban-board'>
      <div className='vertical-card-list'>
        {columns.map(column => {
          const columnCards = cards.filter(card => card.status === column.id);

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
                      columns={columns}
                      key={tempCard.id}
                      card={tempCard}
                      index={-1}
                      onUpdate={handleTempCardUpdate}
                      onDelete={handleTempCardDelete}
                    />
                  </div>
                )}

                {columnCards.length === 0 &&
                  (!tempCard || tempCard.status !== column.id) && (
                    <div className='empty-section-message'>
                      <p>No cards in {column.title.toLowerCase()}</p>
                      <span>Click "Add to {column.title}" to get started</span>
                    </div>
                  )}

                {columnCards.map((card, index) => (
                  <Card
                    columns={columns}
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
      </div>
    </div>
  );
};

export default KanbanBoard;
