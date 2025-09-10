import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SingleTask } from '../types';

interface KanbanState {
  cards: SingleTask[];
  buckets: string[];
  loading: boolean;
  error: string | null;
  nextId: number;
}

interface KanbanActions {
  // Card CRUD operations
  addTempCard: (bucket: string) => void;
  updateCard: (
    id: number,
    cardData: Partial<Omit<SingleTask, 'id' | 'created_at' | 'updated_at'>>
  ) => void;
  deleteCard: (id: number) => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Initialize with sample data
  initializeWithSampleData: () => void;
}

type KanbanStore = KanbanState & KanbanActions;

// Sample data for initial state
const sampleCards: SingleTask[] = [
  {
    id: 1,
    description: 'Create wireframes and mockups for the new dashboard',
    bucket: 'in_progress',
    parent_id: null,
    tags: [],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 2,
    description: 'Configure PostgreSQL database and create initial tables',
    bucket: 'done',
    parent_id: null,
    tags: [],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 3,
    description: 'Add user login and registration functionality',
    bucket: 'idea',
    parent_id: null,
    tags: [],
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 4,
    description: 'Document all REST API endpoints with examples',
    bucket: 'idea',
    parent_id: null,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    description: 'Profile and improve application performance',
    bucket: 'in_progress',
    parent_id: null,
    tags: [],
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
        cards: [],
        loading: false,
        error: null,
        nextId: 6, // Start after sample data IDs

        addTempCard: (bucket: string) => {
          const newTempCard: SingleTask = {
            id: -1, // Temporary ID (negative to distinguish from real cards)
            parent_id: null,
            bucket: bucket,
            tags: [],
            description: 'Click to add description...',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          set(
            state => ({
              cards: [newTempCard, ...state.cards],
              error: null,
            }),
            false,
            'addTempCard'
          );
        },

        updateCard: (
          id: number,
          cardData: Partial<
            Omit<SingleTask, 'id' | 'created_at' | 'updated_at'>
          >
        ) => {
          const now = new Date().toISOString();

          if (id === -1) {
            const { nextId } = get();
            set(
              state => ({
                cards: state.cards.map(card =>
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
            set(
              state => ({
                cards: state.cards.map(card =>
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

        deleteCard: (id: number) => {
          set(
            state => ({
              cards: state.cards.filter(card => card.id !== id),
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
              cards: sampleCards,
              buckets: Array.from(
                new Set(sampleCards.map(card => card.bucket))
              ),
              loading: false,
              error: null,
              nextId: Math.max(...sampleCards.map(card => card.id)) + 1,
            },
            false,
            'initializeWithSampleData'
          );
        },
      }),
      {
        name: 'kanban-storage', // unique name for localStorage key
        partialize: state => ({
          cards: state.cards,
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
export const useCards = () => useKanbanStore(state => state.cards);
export const useBuckets = () => useKanbanStore(state => state.buckets);
export const useLoading = () => useKanbanStore(state => state.loading);
export const useError = () => useKanbanStore(state => state.error);

// Action hooks
export const useKanbanActions = () => {
  const addTempCard = useKanbanStore(state => state.addTempCard);
  const updateCard = useKanbanStore(state => state.updateCard);
  const deleteCard = useKanbanStore(state => state.deleteCard);
  const setLoading = useKanbanStore(state => state.setLoading);
  const setError = useKanbanStore(state => state.setError);
  const clearError = useKanbanStore(state => state.clearError);
  const initializeWithSampleData = useKanbanStore(
    state => state.initializeWithSampleData
  );

  return {
    addTempCard,
    updateCard,
    deleteCard,
    setLoading,
    setError,
    clearError,
    initializeWithSampleData,
  };
};
