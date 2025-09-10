import React, { useEffect } from 'react';

import KanbanBoard from './components/Board';
import {
  useCards,
  useLoading,
  useError,
  useKanbanActions,
} from './store/kanbanStore';
import './App.scss';

function App(): React.JSX.Element {
  const cards = useCards();
  const loading = useLoading();
  const error = useError();
  const { initializeWithSampleData } = useKanbanActions();

  useEffect(() => {
    // Initialize with sample data if no cards exist
    if (cards.length === 0) {
      initializeWithSampleData();
    }
  }, [cards.length, initializeWithSampleData]);

  if (loading) {
    return <div className='loading'>Loading...</div>;
  }

  if (error) {
    return <div className='error'>Error: {error}</div>;
  }

  return (
    <div className='app'>
      <KanbanBoard cards={cards} />
    </div>
  );
}

export default App;
