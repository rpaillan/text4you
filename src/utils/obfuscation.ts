import { Task } from '../types/index.js';

/**
 * Obfuscates text by replacing characters with asterisks while preserving structure
 */
export const obfuscateText = (text: string): string => {
  if (!text) return '';

  // Keep first and last characters of words, replace middle with asterisks
  return text.replace(/\b\w+\b/g, word => {
    if (word.length <= 2) {
      return '*'.repeat(word.length);
    }
    return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1];
  });
};

/**
 * Creates an obfuscated version of a task
 */
export const obfuscateTask = (task: Task): Task => {
  return {
    ...task,
    description: obfuscateText(task.description || ''),
  };
};

/**
 * Obfuscates an array of tasks
 */
export const obfuscateTasks = (tasks: Task[]): Task[] => {
  return tasks.map(obfuscateTask);
};

/**
 * Generates placeholder obfuscated tasks for empty buckets
 */
export const generatePlaceholderTasks = (
  bucket: string,
  count: number = 3
): Task[] => {
  const placeholders = [
    'T*** i* p*****s',
    'A****** t**k f** t*** b****t',
    'S*****g i*****t f** t*** a**a',
    'R***w a** u***e c****t',
    'I*****t n*w f*****e',
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: `placeholder-${bucket}-${index}`,
    description: placeholders[index % placeholders.length],
    bucket,
    parent_id: null,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order: 1000 + index * 100,
    editing: false,
    state: 'todo' as const,
  }));
};
