import { describe, it, expect, beforeEach } from 'vitest';
import { useKanbanStore } from './kanbanStore';

describe('kanbanStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useKanbanStore.setState({
      tasks: [],
      buckets: [],
      loading: false,
      error: null,
    });
  });

  describe('bucket operations', () => {
    it('should create a public bucket without token', () => {
      const { createBucket } = useKanbanStore.getState();
      const result = createBucket('test-bucket');

      expect(result.bucket.name).toBe('test-bucket');
      expect(result.bucket.token).toBe('');
      expect(result.token).toBe('');

      const buckets = useKanbanStore.getState().buckets;
      expect(buckets).toHaveLength(1);
      expect(buckets[0].name).toBe('test-bucket');
    });

    it('should create a private bucket with token', () => {
      const { createBucket } = useKanbanStore.getState();
      const result = createBucket('private-bucket', 'secret123');

      expect(result.bucket.name).toBe('private-bucket');
      expect(result.bucket.token).toBe('secret123');
      expect(result.token).toBe('secret123');

      const buckets = useKanbanStore.getState().buckets;
      expect(buckets).toHaveLength(1);
      expect(buckets[0].token).toBe('secret123');
    });

    it('should get bucket config by name', () => {
      const { createBucket, getBucketConfig } = useKanbanStore.getState();
      createBucket('test-bucket', 'token123');

      const config = getBucketConfig('test-bucket');
      expect(config).toBeDefined();
      expect(config?.name).toBe('test-bucket');
      expect(config?.token).toBe('token123');
    });

    it('should return undefined for non-existent bucket', () => {
      const { getBucketConfig } = useKanbanStore.getState();
      const config = getBucketConfig('non-existent');
      expect(config).toBeUndefined();
    });
  });

  describe('task operations', () => {
    it('should add a temp task to a bucket', () => {
      const { addTempTask } = useKanbanStore.getState();
      addTempTask('test-bucket');

      const tasks = useKanbanStore.getState().tasks;
      expect(tasks).toHaveLength(1);
      expect(tasks[0].bucket).toBe('test-bucket');
      expect(tasks[0].editing).toBe(true);
      expect(tasks[0].description).toBe('');
      expect(tasks[0].state).toBe('todo');
    });

    it('should add task with correct order when bucket is empty', () => {
      const { addTempTask } = useKanbanStore.getState();
      addTempTask('test-bucket');

      const tasks = useKanbanStore.getState().tasks;
      expect(tasks[0].order).toBe(1000);
    });

    it('should add task with incremented order when bucket has tasks', () => {
      const { addTempTask } = useKanbanStore.getState();
      addTempTask('test-bucket');
      addTempTask('test-bucket');

      const tasks = useKanbanStore.getState().tasks;
      expect(tasks[0].order).toBe(2000);
      expect(tasks[1].order).toBe(1000);
    });

    it('should update task', () => {
      const { addTempTask, updateTask } = useKanbanStore.getState();
      addTempTask('test-bucket');

      const tasks = useKanbanStore.getState().tasks;
      const taskId = tasks[0].id;

      updateTask(taskId, {
        description: 'Updated description',
        state: 'prog',
      });

      const updatedTasks = useKanbanStore.getState().tasks;
      expect(updatedTasks[0].description).toBe('Updated description');
      expect(updatedTasks[0].state).toBe('prog');
    });

    it('should not update task if no changes', () => {
      const { addTempTask, updateTask } = useKanbanStore.getState();
      addTempTask('test-bucket');

      const tasks = useKanbanStore.getState().tasks;
      const taskId = tasks[0].id;
      const originalUpdatedAt = tasks[0].updated_at;

      // Update with same values
      updateTask(taskId, {
        editing: true,
      });

      const updatedTasks = useKanbanStore.getState().tasks;
      expect(updatedTasks[0].updated_at).toBe(originalUpdatedAt);
    });

    it('should delete task', () => {
      const { addTempTask, deleteTask } = useKanbanStore.getState();
      addTempTask('test-bucket');

      const tasks = useKanbanStore.getState().tasks;
      const taskId = tasks[0].id;

      deleteTask(taskId);

      const updatedTasks = useKanbanStore.getState().tasks;
      expect(updatedTasks).toHaveLength(0);
    });

    it('should add task after another task', () => {
      const { addTempTask, addTaskAfter } = useKanbanStore.getState();
      addTempTask('test-bucket');

      const tasks = useKanbanStore.getState().tasks;
      const firstTaskId = tasks[0].id;

      addTaskAfter(firstTaskId, 'test-bucket');

      const updatedTasks = useKanbanStore.getState().tasks;
      expect(updatedTasks).toHaveLength(2);
      expect(updatedTasks[1].editing).toBe(true);
    });

    it('should set editing task', () => {
      const { addTempTask, editingTask, updateTask } = useKanbanStore.getState();
      addTempTask('test-bucket');
      addTempTask('test-bucket');

      // First, set editing to false for both tasks
      const tasks = useKanbanStore.getState().tasks;
      tasks.forEach(task => {
        updateTask(task.id, { editing: false });
      });

      const firstTaskId = tasks[0].id;
      editingTask(firstTaskId);

      const updatedTasks = useKanbanStore.getState().tasks;
      expect(updatedTasks.find(t => t.id === firstTaskId)?.editing).toBe(true);
      expect(updatedTasks.filter(t => t.editing)).toHaveLength(1);
    });
  });

  describe('utility actions', () => {
    it('should set loading state', () => {
      const { setLoading } = useKanbanStore.getState();
      setLoading(true);

      expect(useKanbanStore.getState().loading).toBe(true);

      setLoading(false);
      expect(useKanbanStore.getState().loading).toBe(false);
    });

    it('should set error', () => {
      const { setError } = useKanbanStore.getState();
      setError('Test error');

      expect(useKanbanStore.getState().error).toBe('Test error');
    });

    it('should clear error', () => {
      const { setError, clearError } = useKanbanStore.getState();
      setError('Test error');
      clearError();

      expect(useKanbanStore.getState().error).toBeNull();
    });
  });

  describe('initialize with sample data', () => {
    it('should initialize with sample data', () => {
      const { initializeWithSampleData } = useKanbanStore.getState();
      initializeWithSampleData();

      const state = useKanbanStore.getState();
      expect(state.tasks.length).toBeGreaterThan(0);
      expect(state.buckets.length).toBeGreaterThan(0);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should have expected buckets after initialization', () => {
      const { initializeWithSampleData } = useKanbanStore.getState();
      initializeWithSampleData();

      const buckets = useKanbanStore.getState().buckets;
      const bucketNames = buckets.map(b => b.name);

      expect(bucketNames).toContain('idea');
      expect(bucketNames).toContain('in_progress');
      expect(bucketNames).toContain('done');
    });
  });
});
