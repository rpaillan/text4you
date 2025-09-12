import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SingleTask } from '../types';

interface KanbanState {
  tasks: SingleTask[];
  buckets: string[];
  loading: boolean;
  error: string | null;
  nextId: number;
}

interface KanbanActions {
  // Card CRUD operations
  addTempTask: (bucket: string) => void;
  addTaskAfter: (afterTaskId: number, bucket: string) => void;
  updateTask: (
    id: number,
    cardData: Partial<Omit<SingleTask, 'id' | 'created_at' | 'updated_at'>>
  ) => void;
  deleteTask: (id: number) => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Initialize with sample data
  initializeWithSampleData: () => void;
}

type KanbanStore = KanbanState & KanbanActions;

// Sample data for initial state
const sampleTasks: SingleTask[] = [
  {
    id: 1,
    description: 'Create wireframes and mockups for the new dashboard',
    bucket: 'in_progress',
    parent_id: null,
    tags: [],
    order: 1000,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 2,
    description: 'Configure PostgreSQL database and create initial tables',
    bucket: 'done',
    parent_id: null,
    tags: [],
    order: 1000,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 3,
    description: 'Add user login and registration functionality',
    bucket: 'idea',
    parent_id: null,
    tags: [],
    order: 1000,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 4,
    description: 'Document all REST API endpoints with examples',
    bucket: 'idea',
    parent_id: null,
    tags: [],
    order: 2000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    description: 'Profile and improve application performance',
    bucket: 'in_progress',
    parent_id: null,
    tags: [],
    order: 2000,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date().toISOString(),
  },
];

export const useKanbanStore = create<KanbanStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        buckets: ['idea', 'in_progress', 'done'],
        tasks: [],
        loading: false,
        error: null,
        nextId: 6, // Start after sample data IDs

        addTempTask: (bucket: string) => {
          // check that do not exist other task with id -1
          const existingTempCard = get().tasks.find(card => card.id === -1);
          if (existingTempCard) {
            return;
          }

          // Find the highest order in this bucket and add 1000
          const tasksInBucket = get().tasks.filter(
            task => task.bucket === bucket
          );
          const maxOrder =
            tasksInBucket.length > 0
              ? Math.max(...tasksInBucket.map(task => task.order))
              : 0;

          const newTempCard: SingleTask = {
            id: -1, // Temporary ID (negative to distinguish from real cards)
            parent_id: null,
            bucket: bucket,
            tags: [],
            description: '',
            order: maxOrder + 1000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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

        addTaskAfter: (afterTaskId: number, bucket: string) => {
          // check that do not exist other task with id -1
          const existingTempCard = get().tasks.find(card => card.id === -1);
          if (existingTempCard) {
            return;
          }

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

          const newTempCard: SingleTask = {
            id: -1,
            parent_id: null,
            bucket,
            tags: [],
            description: '',
            order: newOrder,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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
          id: number,
          cardData: Partial<
            Omit<SingleTask, 'id' | 'created_at' | 'updated_at'>
          >
        ) => {
          const now = new Date().toISOString();

          if (id === -1) {
            console.log('updateCard', id, cardData);
            if (cardData.description?.trim() === '') {
              // if not text then remove task.
              set(
                state => ({
                  tasks: state.tasks.filter(card => card.id !== id),
                }),
                false,
                'updateCard'
              );
              return;
            }
            const { nextId } = get();
            set(
              state => ({
                tasks: state.tasks.map(card =>
                  card.id === id && cardData.bucket === card.bucket
                    ? { ...card, ...cardData, updated_at: now, id: nextId }
                    : card
                ),
                nextId: nextId + 1,
                error: null,
              }),
              false,
              'updateCard'
            );
          } else {
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
          }
        },

        deleteTask: (id: number) => {
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

        initializeWithSampleData: () => {
          set(
            {
              tasks: sampleTasks,
              buckets: Array.from(
                new Set(sampleTasks.map(card => card.bucket))
              ),
              loading: false,
              error: null,
              nextId: Math.max(...sampleTasks.map(card => card.id)) + 1,
            },
            false,
            'initializeWithSampleData'
          );
        },
      }),
      {
        name: 'kanban-storage', // unique name for localStorage key
        partialize: state => ({
          cards: state.tasks,
          buckets: state.buckets,
          nextId: state.nextId,
        }), // only persist cards and nextId
      }
    ),
    {
      name: 'kanban-store', // name for devtools
    }
  )
);

// Selector hooks for better performance
export const useCards = () => useKanbanStore(state => state.tasks);
export const useBuckets = () => useKanbanStore(state => state.buckets);
export const useLoading = () => useKanbanStore(state => state.loading);
export const useError = () => useKanbanStore(state => state.error);

// Action hooks
export const useKanbanActions = () => {
  const addTempTask = useKanbanStore(state => state.addTempTask);
  const addTaskAfter = useKanbanStore(state => state.addTaskAfter);
  const updateTask = useKanbanStore(state => state.updateTask);
  const deleteTask = useKanbanStore(state => state.deleteTask);
  const setLoading = useKanbanStore(state => state.setLoading);
  const setError = useKanbanStore(state => state.setError);
  const clearError = useKanbanStore(state => state.clearError);
  const initializeWithSampleData = useKanbanStore(
    state => state.initializeWithSampleData
  );

  return {
    addTempTask,
    addTaskAfter,
    updateTask,
    deleteTask,
    setLoading,
    setError,
    clearError,
    initializeWithSampleData,
  };
};

// helpers
