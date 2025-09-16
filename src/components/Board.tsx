import React, { useEffect } from 'react';
import { Task, Bucket } from '../types/index.js';
import './Board.scss';
import { TaskView } from './Task.js';
import { useKanbanStore } from '../store/kanbanStore.js';
import { useRouter } from '../hooks/useRouter.js';

export const NEW_CARD_DESCRIPTION = 'Click to add description...';

const KanbanBoard: React.FC = () => {
  const buckets: Bucket[] = useKanbanStore(state => state.buckets);
  const addTempTask = useKanbanStore(state => state.addTempTask);
  const getBucketTasks = useKanbanStore(state => state.getBucketTasks);

  const initializeWithSampleData = useKanbanStore(
    state => state.initializeWithSampleData
  );
  const loading = useKanbanStore(state => state.loading);
  const error = useKanbanStore(state => state.error);
  const { navigate } = useRouter();

  useEffect(() => {
    if (buckets.length === 0) {
      initializeWithSampleData();
    }
  }, [buckets.length, initializeWithSampleData]);

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
          {buckets.map(bucketConfig => {
            const bucketTasks = getBucketTasks(bucketConfig.name);
            const hasProtection = !!bucketConfig.token;

            return (
              <div key={bucketConfig.name} className='bucket-wrapper'>
                <div
                  className={`bucket ${hasProtection ? 'protected' : ''}`}
                  onClick={() =>
                    navigate('/bucket', {
                      bucket: bucketConfig.name,
                      token: bucketConfig.token || '',
                    })
                  }
                >
                  /{bucketConfig.name}
                  {hasProtection && <span className='lock-icon'>🔒</span>}
                  <div className='bucket-options'>
                    <div
                      className='button'
                      onClick={() => addTempTask(bucketConfig.name)}
                      title={
                        hasProtection ? 'Requires authentication' : 'Add task'
                      }
                    >
                      +
                    </div>
                  </div>
                </div>
                <div className='bucket-tasks'>
                  {bucketTasks
                    .sort((a, b) => a.order - b.order)
                    .map((task, index) => (
                      <TaskView
                        key={task.id}
                        task={task as Task}
                        index={index}
                        isObfuscated={hasProtection}
                      />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
