export interface SingleTask {
  id: number;
  description?: string;
  bucket: string;
  parent_id: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  order: number;
}
