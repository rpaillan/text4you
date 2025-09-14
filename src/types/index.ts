export interface SingleTask {
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
