import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Task, Bucket } from '../types';

interface KanbanState {
  tasks: Task[];
  buckets: Bucket[];
  loading: boolean;
  error: string | null;
}

const generateUUID = () => {
  return crypto.randomUUID();
};

interface KanbanActions {
  editingTask: (taskId: string) => void;
  // Card CRUD operations
  addTempTask: (bucket: string) => void;
  addTaskAfter: (afterTaskId: string, bucket: string) => void;
  updateTask: (
    id: string,
    cardData: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>
  ) => void;
  deleteTask: (id: string) => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Bucket operations
  getBucketConfig: (bucketName: string) => Bucket | undefined;
  createBucket: (
    name: string,
    token?: string
  ) => { bucket: Bucket; token: string };

  // Initialize with sample data
  initializeWithSampleData: () => void;
}

type KanbanStore = KanbanState & KanbanActions;

// Sample data for initial state
const sampleTasks: Task[] = [
  {
    id: generateUUID(),
    description: 'Create wireframes and mockups for the new dashboard',
    bucket: 'in_progress',
    parent_id: null,
    tags: [],
    order: 1000,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    editing: false,
    state: 'prog',
  },
  {
    id: generateUUID(),
    description: 'Configure PostgreSQL database and create initial tables',
    bucket: 'done',
    parent_id: null,
    tags: [],
    order: 1000,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    editing: false,
    state: 'blck',
  },
  {
    id: generateUUID(),
    description: 'Add user login and registration functionality',
    bucket: 'idea',
    parent_id: null,
    tags: [],
    order: 1000,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    editing: false,
    state: 'prog',
  },
  {
    id: generateUUID(),
    description: 'Document all REST API endpoints with examples',
    bucket: 'idea',
    parent_id: null,
    tags: [],
    order: 2000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    editing: false,
    state: 'prog',
  },
  {
    id: generateUUID(),
    description: 'Profile and improve application performance',
    bucket: 'in_progress',
    parent_id: null,
    tags: [],
    order: 2000,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date().toISOString(),
    editing: false,
    state: 'done',
  },
  // Additional tasks for protected buckets
  {
    id: generateUUID(),
    description: 'Confidential project planning task',
    bucket: 'confidential',
    parent_id: null,
    tags: [],
    order: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    editing: false,
    state: 'todo',
  },
  {
    id: generateUUID(),
    description: 'Secret feature implementation',
    bucket: 'confidential',
    parent_id: null,
    tags: [],
    order: 2000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    editing: false,
    state: 'prog',
  },
  {
    id: generateUUID(),
    description: 'Private client meeting notes',
    bucket: 'private',
    parent_id: null,
    tags: [],
    order: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    editing: false,
    state: 'done',
  },
];

// Sample bucket configurations
const sampleBuckets: Bucket[] = [
  { name: 'idea', token: '' },
  { name: 'in_progress', token: '' },
  { name: 'done', token: '' },
  { name: 'confidential', token: '1234' },
  { name: 'private', token: '5678' },
];

export const useKanbanStore = create<KanbanStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        buckets: [],
        tasks: [],
        authenticatedBuckets: new Set<string>(),
        loading: false,
        error: null,
        nextId: 6, // Start after sample data IDs

        editingTask: (taskId: string) => {
          console.log('editingTask', taskId);
          const task = get().tasks.find(task => task.id === taskId);
          if (!task) return;
          set(state => ({
            tasks: state.tasks.map(task =>
              task.id === taskId
                ? { ...task, editing: true }
                : { ...task, editing: false }
            ),
          }));
        },

        addTempTask: (bucket: string) => {
          // Find the highest order in this bucket and add 1000
          const tasksInBucket = get().tasks.filter(
            task => task.bucket === bucket
          );
          const maxOrder =
            tasksInBucket.length > 0
              ? Math.max(...tasksInBucket.map(task => task.order))
              : 0;

          const newTempCard: Task = {
            id: generateUUID(),
            parent_id: null,
            bucket: bucket,
            tags: [],
            description: '',
            order: maxOrder + 1000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            editing: true,
            state: 'todo',
          };

          set(
            state => ({
              tasks: [newTempCard, ...state.tasks],
              error: null,
            }),
            false,
            'addTempCard'
          );
        },

        addTaskAfter: (afterTaskId: string, bucket: string) => {
          const tasks = get().tasks;
          const afterTask = tasks.find(t => t.id === afterTaskId);
          if (!afterTask) return;

          // Find the next task in the same bucket
          const tasksInBucket = tasks.filter(t => t.bucket === bucket);
          const nextTask = tasksInBucket
            .filter(t => t.order > afterTask.order)
            .sort((a, b) => a.order - b.order)[0];

          // Calculate new order
          let newOrder = nextTask
            ? (afterTask.order + nextTask.order) / 2
            : afterTask.order + 1000;

          // Ensure unique order (Option 1 implementation)
          const existingOrders = tasksInBucket.map(t => t.order);
          while (existingOrders.includes(newOrder)) {
            newOrder += 0.001; // Small increment
          }

          const newTempCard: Task = {
            id: generateUUID(),
            parent_id: null,
            bucket,
            tags: [],
            description: '',
            order: newOrder,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            editing: true,
            state: 'todo',
          };

          set(
            state => ({
              tasks: [...state.tasks, newTempCard],
              error: null,
            }),
            false,
            'addTaskAfter'
          );
        },

        updateTask: (
          id: string,
          cardData: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>
        ) => {
          const now = new Date().toISOString();

          // before updating make sure is has changes.
          // compare only existing fields on cardData.
          const card = get().tasks.find(card => card.id === id);
          if (!card) {
            return;
          }
          let haChanges = false;
          Object.keys(cardData).forEach(key => {
            if (
              cardData[key as keyof typeof cardData] !==
              card[key as keyof typeof cardData]
            ) {
              haChanges = true;
            }
          });
          if (!haChanges) {
            return;
          }
          set(
            state => ({
              tasks: state.tasks.map(card =>
                card.id === id
                  ? { ...card, ...cardData, updated_at: now }
                  : card
              ),
              error: null,
            }),
            false,
            'updateCard'
          );
        },

        deleteTask: (id: string) => {
          set(
            state => ({
              tasks: state.tasks.filter(card => card.id !== id),
              error: null,
            }),
            false,
            'deleteCard'
          );
        },

        setLoading: (loading: boolean) => {
          set({ loading }, false, 'setLoading');
        },

        setError: (error: string | null) => {
          set({ error }, false, 'setError');
        },

        clearError: () => {
          set({ error: null }, false, 'clearError');
        },

        getBucketConfig: (bucketName: string) => {
          return get().buckets.find(b => b.name === bucketName);
        },

        createBucket: (name: string, providedToken?: string) => {
          // If token is provided, use it (private bucket)
          // If no token provided, store empty string (public bucket)
          const token = providedToken || '';
          const bucket: Bucket = { name, token };

          set(
            state => ({
              buckets: [...state.buckets, bucket],
            }),
            false,
            'createBucket'
          );

          return { bucket, token };
        },

        initializeWithSampleData: () => {
          set(
            {
              tasks: sampleTasks,
              buckets: sampleBuckets,
              loading: false,
              error: null,
            },
            false,
            'initializeWithSampleData'
          );
        },
      }),
      {
        name: 'kanban-storage', // unique name for localStorage key
        partialize: state => ({
          tasks: state.tasks,
          buckets: state.buckets,
        }),
      }
    ),
    {
      name: 'tasks-store', // name for devtools
    }
  )
);
