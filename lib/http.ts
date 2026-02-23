import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "PRODUCT_NOT_FOUND"
  | "CART_ITEM_NOT_FOUND"
  | "OUT_OF_STOCK"
  | "INVALID_REQUEST"
  | "ORDER_NOT_FOUND";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function fail(code: ApiErrorCode, message: string, status: number, details?: any) {
  return NextResponse.json({ code, message, details }, { status });
}

export function parseJson<T>(req: Request): Promise<T> {
  return req.json() as Promise<T>;
}

export function getQuery(req: Request) {
  const url = new URL(req.url);
  return url.searchParams;
}
