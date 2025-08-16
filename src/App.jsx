import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanBoard from './components/KanbanBoard';
import './App.scss';

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards');
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      const data = await response.json();
      setCards(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeCard = cards.find(card => card.id === active.id);
    const overCard = cards.find(card => card.id === over.id);
    
    if (!activeCard || !overCard) return;
    
    if (activeCard.status === overCard.status) {
      // Same column, just reorder
      const columnCards = cards.filter(card => card.status === activeCard.status);
      const oldIndex = columnCards.findIndex(card => card.id === active.id);
      const newIndex = columnCards.findIndex(card => card.id === over.id);
      
      const newCards = arrayMove(cards, oldIndex, newIndex);
      setCards(newCards);
    } else {
      // Different column, update status
      try {
        const response = await fetch(`/api/cards/${active.id}/status`, {
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
            card.id === active.id
              ? { ...card, status: overCard.status }
              : card
          )
        );
      } catch (err) {
        setError(err.message);
        // Revert the change on error
        fetchCards();
      }
    }
  };

  const addCard = async (cardData) => {
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

      const newCard = await response.json();
      setCards(prevCards => [newCard, ...prevCards]);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateCard = async (id, cardData) => {
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

      const updatedCard = await response.json();
      setCards(prevCards =>
        prevCards.map(card =>
          card.id === id ? updatedCard : card
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteCard = async (id) => {
    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      setCards(prevCards => prevCards.filter(card => card.id !== id));
    } catch (err) {
      setError(err.message);
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
