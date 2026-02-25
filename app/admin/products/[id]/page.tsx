"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<any>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("관리자 로그인이 필요합니다.");
      setLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => {
        setProduct(data);
        setName(data.name || "");
        setPrice(data.price?.amount?.toString() || "");
        setStock(data.stock?.toString() || "");
        setStatus(data.status || "ACTIVE");
      })
      .catch(() => setError("상품 정보를 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("관리자 로그인이 필요합니다.");
      setSaving(false);
      return;
    }
    const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        price: { amount: Number(price), currency: "KRW" },
        stock: Number(stock),
        status,
      }),
    });
    if (res.ok) {
      router.push("/admin/products");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.message || "상품 수정에 실패했습니다.");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setError("");
    setSaving(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("관리자 로그인이 필요합니다.");
      setSaving(false);
      return;
    }
    const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      router.push("/admin/products");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.message || "상품 삭제에 실패했습니다.");
    }
    setSaving(false);
  };

  if (loading) return <div className="py-16 text-center text-zinc-500">로딩 중...</div>;
  if (error) return <div className="py-16 text-center text-red-500">{error}</div>;
  if (!product) return null;

  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">상품 수정</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          className="border rounded px-4 py-2"
          type="text"
          placeholder="상품명"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="border rounded px-4 py-2"
          type="number"
          placeholder="가격(원)"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />
        <input
          className="border rounded px-4 py-2"
          type="number"
          placeholder="재고"
          value={stock}
          onChange={e => setStock(e.target.value)}
          required
        />
        <select
          className="border rounded px-4 py-2"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="ACTIVE">판매중</option>
          <option value="INACTIVE">비활성</option>
          <option value="SOLD_OUT">품절</option>
        </select>
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            className="px-8 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            disabled={saving}
          >
            {saving ? "수정 중..." : "상품 수정"}
          </button>
          <button
            type="button"
            className="px-8 py-3 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            onClick={handleDelete}
            disabled={saving}
          >
            삭제
          </button>
        </div>
      </form>
    </main>
  );
}
