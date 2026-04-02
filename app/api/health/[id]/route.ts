// /app/api/todos/[id]/route.ts
import { ok } from "@/lib/http";
import { deleteTodo, getTodo, patchTodo, replaceTodo } from "@/lib/todo-store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const item = getTodo(id);
  return ok({ item });
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;

  const body = await req.json().catch(() => null);

  if (
    !body ||
    typeof body.title !== "string" ||
    typeof body.done !== "boolean" ||
    body.title.trim() === ""
  ) {
    return ok({ error: "PUT requires { title: string, done: boolean }" });
  }

  const item = replaceTodo(id, { title: body.title.trim(), done: body.done });
  return ok({ item });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;

  const body = await req.json().catch(() => null);

  if (!body || (body.title === undefined && body.done === undefined)) {
    return ok({ error: "PATCH requires { title?: string, done?: boolean }" });
  }

  if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim() === "")) {
    return ok({ error: "title must be non-empty string" });
  }
  if (body.done !== undefined && typeof body.done !== "boolean") {
    return ok({ error: "done must be boolean" });
  }

  const item = patchTodo(id, {
    title: body.title?.trim(),
    done: body.done,
  });

  return ok({ item });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;

  const item = deleteTodo(id);
  return ok({ item });
}