import React, { useEffect } from 'react';
import { Task, Bucket } from '../types/index.js';
import './Board.scss';
import { TaskView } from './Task.js';
import ProgressBar from './ProgressBar.js';
import { useKanbanStore } from '../store/kanbanStore.js';
import { useNavigate } from 'react-router-dom';
import { obfuscateTasks } from '../utils/obfuscation.js';

export const NEW_CARD_DESCRIPTION = 'Click to add description...';

const KanbanBoard: React.FC = () => {
  const buckets: Bucket[] = useKanbanStore(state => state.buckets);
  const tasks = useKanbanStore(state => state.tasks);
  const addTempTask = useKanbanStore(state => state.addTempTask);

  const initializeWithSampleData = useKanbanStore(
    state => state.initializeWithSampleData
  );
  const loading = useKanbanStore(state => state.loading);
  const error = useKanbanStore(state => state.error);
  const navigate = useNavigate();

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
            const hasProtection = bucketConfig.token !== '';
            let bucketTasks = tasks.filter(
              task => task.bucket === bucketConfig.name
            );
            if (hasProtection) {
              bucketTasks = obfuscateTasks(bucketTasks);
            }

            return (
              <div key={bucketConfig.name} className='bucket-wrapper'>
                <div className={`bucket ${hasProtection ? 'protected' : ''}`}>
                  <ProgressBar tasks={bucketTasks} />
                  <span className='lock-icon'>{hasProtection && '🔒'}</span>
                  <span
                    className='bucket-name'
                    onClick={() => {
                      const url = `/bucket/${bucketConfig.name}${
                        bucketConfig.token !== ''
                          ? `?token=${encodeURIComponent(bucketConfig.token)}`
                          : ''
                      }`;
                      navigate(url);
                    }}
                  >
                    {bucketConfig.name}
                  </span>
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
