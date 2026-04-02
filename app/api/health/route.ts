// /app/api/todos/route.ts
import { ok } from "@/lib/http";
import { createTodo, listTodos } from "@/lib/todo-store";

export async function GET() {
  return ok({ items: listTodos() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.title !== "string" || body.title.trim() === "") {
    // http.ts에 badRequest 같은 헬퍼가 없다면 일단 ok로 통일
    return ok({ error: "title is required" });
  }

  const todo = createTodo({ title: body.title.trim(), done: !!body.done });
  return ok({ item: todo });
}