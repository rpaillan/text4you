export interface Task {
  id: string;
  description?: string;
  bucket: string;
  parent_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  order: number;
  editing: boolean;
  state: 'todo' | 'prog' | 'done' | 'blck'; // todo = todo, prog = in progress, done = done, blck = blocked
}

export interface Bucket {
  name: string;
  token: string; // Token for accessing this bucket (empty string for public buckets)
}
