import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/testUtils';
import ProgressBar from './ProgressBar';
import { Task } from '../types';

describe('ProgressBar', () => {
  const createTask = (id: string, state: Task['state']): Task => ({
    id,
    description: `Task ${id}`,
    bucket: 'test',
    parent_id: null,
    tags: [],
    order: 1000,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    editing: false,
    state,
  });

  it('should render with empty tasks', () => {
    const { container } = render(<ProgressBar tasks={[]} />);
    expect(container.textContent).toContain('0%');
  });

  it('should calculate percentage correctly', () => {
    const tasks = [createTask('1', 'done'), createTask('2', 'done'), createTask('3', 'prog'), createTask('4', 'todo')];

    const { container } = render(<ProgressBar tasks={tasks} />);
    // 2 done out of 4 = 50%
    expect(container.textContent).toContain('50%');
  });

  it('should show 100% when all tasks are done', () => {
    const tasks = [createTask('1', 'done'), createTask('2', 'done'), createTask('3', 'done')];

    const { container } = render(<ProgressBar tasks={tasks} />);
    expect(container.textContent).toContain('100%');
  });

  it('should show 0% when no tasks are done', () => {
    const tasks = [createTask('1', 'todo'), createTask('2', 'prog'), createTask('3', 'todo')];

    const { container } = render(<ProgressBar tasks={tasks} />);
    expect(container.textContent).toContain('0%');
  });

  it('should have tooltip with task counts', () => {
    const tasks = [createTask('1', 'done'), createTask('2', 'done'), createTask('3', 'prog'), createTask('4', 'todo')];

    render(<ProgressBar tasks={tasks} />);
    const progressBar = screen.getByTitle('2 done, 1 in progress, 4 total');
    expect(progressBar).toBeInTheDocument();
  });

  it('should render with custom bar length', () => {
    const tasks = [createTask('1', 'done'), createTask('2', 'todo')];

    const { container } = render(<ProgressBar tasks={tasks} barLength={20} />);
    expect(container).toBeTruthy();
  });

  it('should hide percentage when showPercentage is false', () => {
    const tasks = [createTask('1', 'done')];

    const { container } = render(<ProgressBar tasks={tasks} showPercentage={false} />);
    expect(container.textContent).not.toContain('%');
  });

  it('should render progress bars correctly', () => {
    const tasks = [createTask('1', 'done'), createTask('2', 'done'), createTask('3', 'prog'), createTask('4', 'todo')];

    const { container } = render(<ProgressBar tasks={tasks} barLength={10} />);

    // Should contain progress bar characters
    expect(container.textContent).toContain('[');
    expect(container.textContent).toContain(']');
  });

  it('should handle custom styles', () => {
    const tasks = [createTask('1', 'done')];

    render(<ProgressBar tasks={tasks} fontSize="16px" fontFamily="Arial" marginLeft="20px" />);

    const progressBar = screen.getByTitle(/total/);
    expect(progressBar).toHaveStyle({ fontSize: '16px' });
    expect(progressBar).toHaveStyle({ fontFamily: 'Arial' });
    expect(progressBar).toHaveStyle({ marginLeft: '20px' });
  });
});
