// /lib/todo-store.ts
export type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
  updatedAt: number;
};

const store = new Map<string, Todo>();

export function listTodos() {
  return Array.from(store.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function getTodo(id: string) {
  return store.get(id) ?? null;
}

export function createTodo(input: { title: string; done?: boolean }) {
  const now = Date.now();
  const id = crypto.randomUUID();
  const todo: Todo = {
    id,
    title: input.title,
    done: input.done ?? false,
    createdAt: now,
    updatedAt: now,
  };
  store.set(id, todo);
  return todo;
}

export function replaceTodo(id: string, input: { title: string; done: boolean }) {
  const prev = store.get(id);
  if (!prev) return null;
  const now = Date.now();
  const next: Todo = {
    ...prev,
    title: input.title,
    done: input.done,
    updatedAt: now,
  };
  store.set(id, next);
  return next;
}

export function patchTodo(id: string, input: Partial<Pick<Todo, "title" | "done">>) {
  const prev = store.get(id);
  if (!prev) return null;
  const now = Date.now();
  const next: Todo = {
    ...prev,
    title: input.title ?? prev.title,
    done: input.done ?? prev.done,
    updatedAt: now,
  };
  store.set(id, next);
  return next;
}

export function deleteTodo(id: string) {
  const prev = store.get(id);
  if (!prev) return null;
  store.delete(id);
  return prev;
}