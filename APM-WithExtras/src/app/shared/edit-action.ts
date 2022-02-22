// Edit actions for any entity that supports edit
type ActionType = 'add' | 'update' | 'delete';

export interface Action<T> {
  item: T;
  action: ActionType;
}
