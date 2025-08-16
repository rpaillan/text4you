import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanBoard from './components/KanbanBoard';
import EditCardModal from './components/EditCardModal';
import { Card, CardStatus } from './types/index.js';
import './App.scss';

function App(): JSX.Element {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async (): Promise<void> => {
    try {
      const response = await fetch('/api/cards');
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      const data: Card[] = await response.json();
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeId = typeof active.id === 'string' ? parseInt(active.id) : active.id;
    const activeCard = cards.find(card => card.id === activeId);
    
    if (!activeCard) return;
    
    // Check if we're dropping on a column, the board, or a card
    if (over.id === 'idea' || over.id === 'in_progress' || over.id === 'done') {
      // Dropping on a column - move card to that column
      const targetStatus = over.id as CardStatus;
      
      if (activeCard.status === targetStatus) return; // Already in the same column
      
      try {
        const response = await fetch(`/api/cards/${activeId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: targetStatus }),
        });

        if (!response.ok) {
          throw new Error('Failed to update card status');
        }

        // Update local state
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === activeId
              ? { ...card, status: targetStatus }
              : card
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Revert the change on error
        fetchCards();
      }
    } else if (over.id === 'kanban-board') {
      // Dropping on the board area - keep card in current column
      // This prevents the drag from resetting when leaving a column
      return;
    } else {
      // Dropping on another card - reorder within the same column
      const overId = typeof over.id === 'string' ? parseInt(over.id) : over.id;
      const overCard = cards.find(card => card.id === overId);
      
      if (!overCard || activeCard.status !== overCard.status) return;
      
      // Same column, just reorder
      const columnCards = cards.filter(card => card.status === activeCard.status);
      const oldIndex = columnCards.findIndex(card => card.id === activeId);
      const newIndex = columnCards.findIndex(card => card.id === overId);
      
      const newCards = arrayMove(cards, oldIndex, newIndex);
      setCards(newCards);
    }
  };

  const addCard = async (cardData: Omit<Card, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        throw new Error('Failed to create card');
      }

      const newCard: Card = await response.json();
      setCards(prevCards => [newCard, ...prevCards]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateCard = async (id: number, cardData: Partial<Omit<Card, 'id' | 'created_at' | 'updated_at'>>): Promise<void> => {
    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        throw new Error('Failed to update card');
      }

      const updatedCard: Card = await response.json();
      setCards(prevCards =>
        prevCards.map(card =>
          card.id === id ? updatedCard : card
        )
      );
      setEditingCard(null); // Close modal after successful update
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteCard = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      setCards(prevCards => prevCards.filter(card => card.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kanban Board</h1>
      </header>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <KanbanBoard
          cards={cards}
          onAddCard={addCard}
          onUpdateCard={updateCard}
          onDeleteCard={deleteCard}
          onEditCard={setEditingCard}
        />
      </DndContext>
      
      {editingCard && (
        <EditCardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSubmit={(updatedData) => updateCard(editingCard.id, updatedData)}
        />
      )}
    </div>
  );
}

export default App;
