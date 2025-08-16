import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanBoard from './components/KanbanBoard';
import { Card } from './types/index.js';
import './App.scss';

function App(): JSX.Element {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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
    const overId = typeof over.id === 'string' ? parseInt(over.id) : over.id;

    const activeCard = cards.find(card => card.id === activeId);
    const overCard = cards.find(card => card.id === overId);
    
    if (!activeCard || !overCard) return;
    
    if (activeCard.status === overCard.status) {
      // Same column, just reorder
      const columnCards = cards.filter(card => card.status === activeCard.status);
      const oldIndex = columnCards.findIndex(card => card.id === activeId);
      const newIndex = columnCards.findIndex(card => card.id === overId);
      
      const newCards = arrayMove(cards, oldIndex, newIndex);
      setCards(newCards);
    } else {
      // Different column, update status
      try {
        const response = await fetch(`/api/cards/${activeId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: overCard.status }),
        });

        if (!response.ok) {
          throw new Error('Failed to update card status');
        }

        // Update local state
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === activeId
              ? { ...card, status: overCard.status }
              : card
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Revert the change on error
        fetchCards();
      }
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
        />
      </DndContext>
    </div>
  );
}

export default App;
