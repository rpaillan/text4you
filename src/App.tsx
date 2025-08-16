import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
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
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
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

    console.log('Drag End Event:', { active, over });
    console.log('Active ID:', active.id, 'Over ID:', over?.id);
    console.log('Over Data:', over?.data);
    
    if (!over || active.id === over.id) {
      console.log('No valid drop target or same element');
      setDraggedCard(null);
      return;
    }

    const activeId = typeof active.id === 'string' ? parseInt(active.id) : active.id;
    const activeCard = cards.find(card => card.id === activeId);
    
    if (!activeCard) {
      console.log('Active card not found');
      setDraggedCard(null);
      return;
    }
    
    console.log('Active Card:', activeCard);
    console.log('Over Element Type:', over.data);
    
    // Check if we're dropping on a column, the board, or a card
    if (over.id === 'idea' || over.id === 'in_progress' || over.id === 'done') {
      console.log('Dropping on column:', over.id);
      console.log('Column ID type:', typeof over.id, 'Value:', over.id);
      console.log('Target status:', over.id as CardStatus);
      
      // Dropping on a column - move card to that column
      const targetStatus = over.id as CardStatus;
      
      if (activeCard.status === targetStatus) {
        console.log('Card already in target column');
        setDraggedCard(null);
        return; // Already in the same column
      }
      
      try {
        console.log('Making API call to move card to status:', targetStatus);
        
        // Update local state immediately for smooth animation
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === activeId
              ? { ...card, status: targetStatus }
              : card
          )
        );
        
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

        console.log('Successfully moved card to column:', targetStatus);
        // Local state is already updated, no need to update again
      } catch (err) {
        console.error('Error moving card:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Revert the change on error by refetching
        fetchCards();
      }
    } else {
      console.log('Dropping on card or other element:', over.id);
      // Dropping on another card - reorder within the same column
      const overId = typeof over.id === 'string' ? parseInt(over.id) : over.id;
      const overCard = cards.find(card => card.id === overId);
      
      if (!overCard || activeCard.status !== overCard.status) {
        console.log('Invalid card drop or different columns');
        setDraggedCard(null);
        return;
      }
      
      console.log('Reordering cards within same column');
      // Same column, just reorder
      const columnCards = cards.filter(card => card.status === activeCard.status);
      const oldIndex = columnCards.findIndex(card => card.id === activeId);
      const newIndex = columnCards.findIndex(card => card.id === overId);
      
      const newCards = arrayMove(cards, oldIndex, newIndex);
      setCards(newCards);
    }
    
    setDraggedCard(null);
  };

  const handleDragStart = (event: DragStartEvent): void => {
    const { active } = event;
    const activeId = typeof active.id === 'string' ? parseInt(active.id) : active.id;
    const activeCard = cards.find(card => card.id === activeId);
    if (activeCard) {
      setDraggedCard(activeCard);
    }
  };

  const handleDragCancel = (): void => {
    setDraggedCard(null);
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
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
      >
        <KanbanBoard
          cards={cards}
          onAddCard={addCard}
          onUpdateCard={updateCard}
          onDeleteCard={deleteCard}
          onEditCard={setEditingCard}
        />
        
        <DragOverlay>
          {draggedCard ? (
            <div className="dragged-card-overlay">
              <div className="card-preview">
                <h4>{draggedCard.title}</h4>
                {draggedCard.description && <p>{draggedCard.description}</p>}
              </div>
            </div>
          ) : null}
        </DragOverlay>
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
