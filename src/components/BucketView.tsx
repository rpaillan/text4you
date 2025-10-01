import React, { useEffect, useMemo, useState } from 'react';
import { Task, Bucket } from '../types/index.js';
import './Board.scss'; // Reuse existing styles
import { TaskView } from './Task.js';
import { useKanbanStore } from '../store/kanbanStore.js';
import { obfuscateTasks } from '../utils/obfuscation.js';
import BucketHeader from './BucketHeader.js';

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
  const initializeWithSampleData = useKanbanStore(state => state.initializeWithSampleData);
  const loading = useKanbanStore(state => state.loading);
  const error = useKanbanStore(state => state.error);

  const bucketConfig = getBucketConfig(bucket);
  let bucketTasks = useMemo(() => {
    let list = tasks.filter(task => task.bucket === bucket);
    if (!isAuthenticated) {
      list = obfuscateTasks(list);
    }
    return list;
  }, [tasks, bucket, isAuthenticated]);
  const activeTasks = useMemo(() => bucketTasks.filter(task => task.state !== 'done'), [bucketTasks]);
  const doneTasks = useMemo(() => bucketTasks.filter(task => task.state === 'done'), [bucketTasks]);

  useEffect(() => {
    // Initialize with sample data if no buckets exist
    if (buckets.length === 0) {
      initializeWithSampleData();
    }
  }, [buckets.length, initializeWithSampleData]);

  useEffect(() => {
    // Attempt authentication when component mounts or token changes
    if (bucketConfig?.token && bucketConfig.token !== '') {
      const success = bucketConfig.token === token;
      setIsAuthenticated(success);
    } else {
      // No token required (public bucket), always authenticated
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
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <>
      <BucketHeader bucket={bucket} bucketConfig={bucketConfig} bucketTasks={bucketTasks} onAddTask={handleAddTask} />
      <div className="kanban-board">
        <div className="vertical-card-list">
          <div className="bucket-list">
            <div className="bucket-wrapper">
              <div className="bucket-tasks">
                {activeTasks.length === 0 ? (
                  <div className="no-tasks">No tasks found in bucket "{bucketConfig?.name || bucket}"</div>
                ) : (
                  activeTasks
                    .sort((a, b) => a.order - b.order)
                    .map((task, index) => (
                      <TaskView key={task.id} task={task as Task} index={index} isObfuscated={!isAuthenticated} />
                    ))
                )}
              </div>
              <div className="bucket-tasks">
                {doneTasks.length === 0 ? (
                  <div className="no-tasks">No done tasks found in bucket "{bucketConfig?.name || bucket}"</div>
                ) : (
                  doneTasks
                    .sort((a, b) => a.order - b.order)
                    .map((task, index) => (
                      <TaskView key={task.id} task={task as Task} index={index} isObfuscated={!isAuthenticated} />
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BucketView;
