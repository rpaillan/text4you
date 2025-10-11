import { describe, it, expect } from 'vitest';
import { obfuscateText, obfuscateTask, obfuscateTasks, generatePlaceholderTasks } from './obfuscation';
import { Task } from '../types';

describe('obfuscation utilities', () => {
  describe('obfuscateText', () => {
    it('should obfuscate text while preserving first and last characters', () => {
      const result = obfuscateText('Hello World');
      expect(result).toBe('H***o W***d');
    });

    it('should obfuscate short words completely', () => {
      const result = obfuscateText('Hi to be');
      expect(result).toBe('** ** **');
    });

    it('should handle single characters', () => {
      const result = obfuscateText('a');
      expect(result).toBe('*');
    });

    it('should handle empty strings', () => {
      const result = obfuscateText('');
      expect(result).toBe('');
    });

    it('should preserve word structure and spaces', () => {
      const result = obfuscateText('Create wireframes and mockups');
      expect(result).toBe('C****e w********s a*d m*****s');
    });

    it('should handle special characters', () => {
      const result = obfuscateText('Test-task with_underscore');
      // underscore is part of word character class, so "with_underscore" is treated as one word
      expect(result).toBe('T**t-t**k w*************e');
    });
  });

  describe('obfuscateTask', () => {
    it('should obfuscate task description while preserving other fields', () => {
      const task: Task = {
        id: '1',
        description: 'Create wireframes',
        bucket: 'idea',
        parent_id: null,
        tags: ['design'],
        order: 1000,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        editing: false,
        state: 'todo',
      };

      const result = obfuscateTask(task);

      expect(result.description).toBe('C****e w********s');
      expect(result.id).toBe('1');
      expect(result.bucket).toBe('idea');
      expect(result.tags).toEqual(['design']);
      expect(result.state).toBe('todo');
    });

    it('should handle empty description', () => {
      const task: Task = {
        id: '1',
        description: '',
        bucket: 'idea',
        parent_id: null,
        tags: [],
        order: 1000,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        editing: false,
        state: 'todo',
      };

      const result = obfuscateTask(task);
      expect(result.description).toBe('');
    });
  });

  describe('obfuscateTasks', () => {
    it('should obfuscate an array of tasks', () => {
      const tasks: Task[] = [
        {
          id: '1',
          description: 'First task',
          bucket: 'idea',
          parent_id: null,
          tags: [],
          order: 1000,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          editing: false,
          state: 'todo',
        },
        {
          id: '2',
          description: 'Second task',
          bucket: 'idea',
          parent_id: null,
          tags: [],
          order: 2000,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          editing: false,
          state: 'todo',
        },
      ];

      const result = obfuscateTasks(tasks);

      expect(result).toHaveLength(2);
      expect(result[0].description).toBe('F***t t**k');
      expect(result[1].description).toBe('S****d t**k');
    });

    it('should return empty array for empty input', () => {
      const result = obfuscateTasks([]);
      expect(result).toEqual([]);
    });
  });

  describe('generatePlaceholderTasks', () => {
    it('should generate specified number of placeholder tasks', () => {
      const result = generatePlaceholderTasks('test-bucket', 3);

      expect(result).toHaveLength(3);
      expect(result[0].bucket).toBe('test-bucket');
      expect(result[1].bucket).toBe('test-bucket');
      expect(result[2].bucket).toBe('test-bucket');
    });

    it('should have sequential orders', () => {
      const result = generatePlaceholderTasks('test-bucket', 3);

      expect(result[0].order).toBe(1000);
      expect(result[1].order).toBe(1100);
      expect(result[2].order).toBe(1200);
    });

    it('should have unique IDs', () => {
      const result = generatePlaceholderTasks('test-bucket', 3);
      const ids = result.map(t => t.id);

      expect(new Set(ids).size).toBe(3);
    });

    it('should cycle through placeholders if count exceeds placeholder array length', () => {
      const result = generatePlaceholderTasks('test-bucket', 7);

      expect(result).toHaveLength(7);
      // First description should repeat after 5 items
      expect(result[0].description).toBe(result[5].description);
    });

    it('should use default count of 3 if not specified', () => {
      const result = generatePlaceholderTasks('test-bucket');
      expect(result).toHaveLength(3);
    });
  });
});
