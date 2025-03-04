export interface User {
  avatar?: string;
  defaultTableId: string;
  is_contributor: boolean;
  userName: string;
  email?: string;
  extra?: Record<string, string>;
  _id: string;
}
