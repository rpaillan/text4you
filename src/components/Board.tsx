import React, { useEffect } from 'react';
import { SingleTask } from '../types/index.js';
import './Board.scss';
import { Task } from './Task.js';
import { useKanbanStore } from '../store/kanbanStore.js';

export const NEW_CARD_DESCRIPTION = 'Click to add description...';

const KanbanBoard: React.FC = () => {
  const cards: SingleTask[] = useKanbanStore(state => state.tasks);
  const buckets: string[] = useKanbanStore(state => state.buckets);
  const addTempTask = useKanbanStore(state => state.addTempTask);
  const initializeWithSampleData = useKanbanStore(
    state => state.initializeWithSampleData
  );
  const loading = useKanbanStore(state => state.loading);
  const error = useKanbanStore(state => state.error);

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
    <div className='kanban-board'>
      <div className='vertical-card-list'>
        <div className='bucket-list'>
          {buckets.map(bucket => (
            <div key={bucket} className='bucket-wrapper'>
              <div className='bucket'>
                /{bucket}
                <div className='bucket-options'>
                  <div className='button' onClick={() => addTempTask(bucket)}>
                    +
                  </div>
                </div>
              </div>
              <div className='bucket-tasks'>
                {cards
                  .filter(card => card.bucket === bucket)
                  .sort((a, b) => a.order - b.order)
                  .map((card, index) => (
                    <Task key={card.id} task={card} index={index} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
