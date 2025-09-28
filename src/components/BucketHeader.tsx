import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, Bucket } from '../types/index.js';
import ProgressBar from './ProgressBar.js';
import './BucketHeader.scss';

interface BucketHeaderProps {
  bucket: string;
  bucketConfig?: Bucket;
  bucketTasks: Task[];
  onAddTask: () => void;
}

const BucketHeader: React.FC<BucketHeaderProps> = ({ bucket, bucketConfig, bucketTasks, onAddTask }) => {
  const navigate = useNavigate();
  const [hasBackground, setHasBackground] = useState(false);

  const onScroll = () => {
    if (window.scrollY > 5) {
      setHasBackground(true);
    } else {
      setHasBackground(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className={`app-header ${hasBackground ? 'has-background' : ''}`}>
      <div className="cbutton" onClick={() => navigate('/')}>
        Back to Board
      </div>
      <div className="cbutton" onClick={onAddTask}>
        Add Task
      </div>
      <div>
        <ProgressBar tasks={bucketTasks} />
      </div>
      <div className={`bucket ${bucketConfig?.token ? 'protected' : ''}`}>
        bucket / {bucketConfig?.name || bucket}
        {bucketConfig?.token && <span className="lock-icon">🔒</span>}
        <div className="bucket-options"></div>
      </div>
    </div>
  );
};

export default BucketHeader;
