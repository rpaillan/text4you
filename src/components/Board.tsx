import React from 'react';
import { SingleTask } from '../types/index.js';
import './Board.scss';
import { useBuckets, useKanbanActions } from '../store/kanbanStore.js';
import { Task } from './Task.js';

export const NEW_CARD_DESCRIPTION = 'Click to add description...';

interface KanbanBoardProps {
  cards: SingleTask[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ cards }) => {
  const buckets: string[] = useBuckets();
  const { addTempCard } = useKanbanActions();
  return (
    <div className='kanban-board'>
      <div className='vertical-card-list'>
        <div className='bucket-list'>
          {buckets.map(bucket => (
            <div key={bucket} className='bucket-wrapper'>
              <h2>
                {bucket}{' '}
                <button onClick={() => addTempCard(bucket)}>+ Add</button>
              </h2>
              <div className='bucket-tasks'>
                {cards
                  .filter(card => card.bucket === bucket)
                  .map((card, index) => (
                    <Task key={card.id} card={card} index={index} />
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
