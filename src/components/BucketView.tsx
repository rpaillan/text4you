import React, { useEffect, useState } from 'react';
import { Task, Bucket } from '../types/index.js';
import './Board.scss'; // Reuse existing styles
import { TaskView } from './Task.js';
import { useKanbanStore } from '../store/kanbanStore.js';
import { useNavigate } from 'react-router-dom';
import { obfuscateTasks } from '../utils/obfuscation.js';

interface BucketViewProps {
  bucket: string;
  token: string;
}

const BucketView: React.FC<BucketViewProps> = ({ bucket, token }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const buckets: Bucket[] = useKanbanStore(state => state.buckets);
  const addTempTask = useKanbanStore(state => state.addTempTask);
  const tasks = useKanbanStore(state => state.tasks);
  const getBucketConfig = useKanbanStore(state => state.getBucketConfig);
  const initializeWithSampleData = useKanbanStore(
    state => state.initializeWithSampleData
  );
  const loading = useKanbanStore(state => state.loading);
  const error = useKanbanStore(state => state.error);
  const navigate = useNavigate();

  const bucketConfig = getBucketConfig(bucket);
  let bucketTasks = tasks.filter(task => task.bucket === bucket);

  if (!isAuthenticated) {
    bucketTasks = obfuscateTasks(bucketTasks);
  }

  useEffect(() => {
    // Initialize with sample data if no buckets exist
    if (buckets.length === 0) {
      initializeWithSampleData();
    }
  }, [buckets.length, initializeWithSampleData]);

  useEffect(() => {
    // Attempt authentication when component mounts or token changes
    if (bucketConfig?.token) {
      const success = bucketConfig.token === token;
      setIsAuthenticated(success);
    } else {
      // No token required, always authenticated
      setIsAuthenticated(true);
    }
  }, [bucket, token, bucketConfig]);

  const handleAddTask = () => {
    // Only allow adding tasks if authenticated
    if (isAuthenticated) {
      addTempTask(bucket);
    }
  };

  if (loading) {
    return <div className='loading'>Loading...</div>;
  }

  if (error) {
    return <div className='error'>Error: {error}</div>;
  }

  return (
    <div className='kanban-board'>
      <div className='bucket-view-header'>
        <button className='back-button' onClick={() => navigate('/')}>
          ← Back to Board
        </button>
      </div>

      <div className='vertical-card-list'>
        <div className='bucket-list'>
          <div className='bucket-wrapper'>
            <div className={`bucket ${bucketConfig?.token ? 'protected' : ''}`}>
              /{bucketConfig?.name || bucket}
              {bucketConfig?.token && <span className='lock-icon'>🔒</span>}
              <div className='bucket-options'>
                <div
                  className='button'
                  onClick={handleAddTask}
                  title={
                    !isAuthenticated ? 'Authentication required' : 'Add task'
                  }
                  style={{ opacity: !isAuthenticated ? 0.5 : 1 }}
                >
                  +
                </div>
              </div>
            </div>
            <div className='bucket-tasks'>
              {bucketTasks.length === 0 ? (
                <div className='no-tasks'>
                  No tasks found in bucket "{bucketConfig?.name || bucket}"
                </div>
              ) : (
                bucketTasks
                  .sort((a, b) => a.order - b.order)
                  .map((task, index) => (
                    <TaskView
                      key={task.id}
                      task={task as Task}
                      index={index}
                      isObfuscated={!isAuthenticated}
                    />
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BucketView;
