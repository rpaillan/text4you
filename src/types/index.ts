export interface Card {
  id: number;
  title: string;
  description?: string;
  status: CardStatus;
  priority: Priority;
  created_at: string;
  updated_at: string;
}

export type CardStatus = 'idea' | 'in_progress' | 'done';

export type Priority = 'low' | 'medium' | 'high';

export interface CreateCardData {
  title: string;
  description?: string;
  status: CardStatus;
  priority: Priority;
}

export interface UpdateCardData {
  title?: string;
  description?: string;
  status?: CardStatus;
  priority?: Priority;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface Column {
  id: CardStatus;
  title: string;
  color: string;
}