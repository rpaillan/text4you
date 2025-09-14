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
  const { addTempTask, addTaskAfter } = useKanbanActions();

  const getTaskIdFronmDOM = (
    currentTarget: HTMLDivElement
  ): SingleTask | null => {
    // find the current div that has enabled contentEditable attribute.
    const currentTaskId = (
      currentTarget.querySelector('div[contentEditable="true"]') as HTMLElement
    )?.dataset.taskId;

    if (currentTaskId) {
      const currentTask = cards.find(card => card.id === currentTaskId);
      return currentTask || null;
    }
    return null;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey) {
      if (event.key === 'Enter') {
        const currentTask = getTaskIdFronmDOM(
          event.currentTarget as HTMLDivElement
        );
        if (currentTask) {
          onKeyboardCommand('add-new-next-task', currentTask);
        }
      }
      if (event.key === 'Down') {
        // TODO create next task as a subtask of current task.
      }
    }
  };

  const onKeyboardCommand = (
    command: string,
    currentTask: SingleTask | null
  ) => {
    console.log('onKeyboardCommand', command, currentTask);
    // if used control + enter, create a new task under current task.
    // if used control + down, create a new subtask under current task.

    if (command === 'add-new-next-task') {
      if (currentTask) {
        addTaskAfter(currentTask.id, currentTask.bucket);
      }
    }
  };
  return (
    <div className='kanban-board' onKeyDown={onKeyDown}>
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
