// Edit actions for any entity that supports edit
type ActionType = 'add' | 'update' | 'delete' | 'none';

export interface Action<T> {
  item: T;
  action: ActionType;
}
