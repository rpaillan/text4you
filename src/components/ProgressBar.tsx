import React from 'react';
import { Task } from '../types/index.js';

interface ProgressBarProps {
  tasks: Task[];
  barLength?: number;
  fontSize?: string;
  fontFamily?: string;
  marginLeft?: string;
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  tasks,
  barLength = 10,
  fontSize = '0.95em',
  fontFamily = 'monospace',
  marginLeft = '8px',
  showPercentage = true,
}) => {
  // Calculate progress statistics
  const total = tasks.length;
  const done = tasks.filter(task => task.state === 'done').length;
  const inProgress = tasks.filter(task => task.state === 'prog').length;

  const donePercent = total === 0 ? 0 : done / total;
  const inProgressPercent = total === 0 ? 0 : inProgress / total;

  const doneLength = Math.round(donePercent * barLength);
  const inProgressLength = Math.round(inProgressPercent * barLength);

  // Ensure the bar doesn't overflow
  const emptyLength = Math.max(0, barLength - doneLength - inProgressLength);

  const completionPercentage =
    total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <span
      style={{
        fontFamily,
        fontSize,
        color: 'var(--accent-color, #888)',
        marginLeft,
        display: 'inline-flex',
        alignItems: 'center',
      }}
      title={`${done} done, ${inProgress} in progress, ${total} total`}
    >
      {showPercentage && (
        <span
          style={{
            marginLeft: '4px',
            width: '35px',
            textAlign: 'right',
            marginRight: '4px',
          }}
        >
          {total === 0 ? '0%' : `${completionPercentage}%`}
        </span>
      )}
      [
      <span style={{ color: 'var(--accent-color, #888)' }}>
        {'█'.repeat(doneLength)}
      </span>
      <span style={{ color: 'green' }}>{'░'.repeat(inProgressLength)}</span>
      <span style={{ color: '#bbb' }}>{'░'.repeat(emptyLength)}</span>]
    </span>
  );
};

export default ProgressBar;
