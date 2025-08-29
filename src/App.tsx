import React, { useState, useEffect } from 'react';

import KanbanBoard from './components/KanbanBoard';

import { Card } from './types/index.js';
import './App.scss';

function App(): React.JSX.Element {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const addCard = async (
    cardData: Omit<Card, 'id' | 'created_at' | 'updated_at'>
  ): Promise<void> => {
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

  const updateCard = async (
    id: number,
    cardData: Partial<Omit<Card, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<void> => {
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
        prevCards.map(card => (card.id === id ? updatedCard : card))
      );
      // Card updated successfully
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
    return <div className='loading'>Loading...</div>;
  }

  if (error) {
    return <div className='error'>Error: {error}</div>;
  }

  return (
    <div className='app'>
      <header className='app-header'>
        <h1>Kanban Board</h1>
      </header>
      <KanbanBoard
        cards={cards}
        onAddCard={addCard}
        onUpdateCard={updateCard}
        onDeleteCard={deleteCard}
      />
    </div>
  );
}

export default App;
