export interface SingleTask {
  id: string;
  description?: string;
  bucket: string;
  parent_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  order: number;
  editing?: boolean;
}
