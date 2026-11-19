"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Item = { variantId: string; qty: number };
type S = { items: Item[]; wish: string[]; add: (i: Item) => void; setQty: (id: string, q: number) => void; remove: (id: string) => void; clear: () => void; toggleWish: (id: string) => void };
export const useCart = create<S>()(persist((set) => ({
  items: [], wish: [],
  add: (i) => set(s => { const e = s.items.find(x => x.variantId === i.variantId); return { items: e ? s.items.map(x => x === e ? { ...x, qty: Math.min(10, x.qty + i.qty) } : x) : [...s.items, i] }; }),
  setQty: (id, q) => set(s => ({ items: q < 1 ? s.items.filter(x => x.variantId !== id) : s.items.map(x => x.variantId === id ? { ...x, qty: Math.min(10, q) } : x) })),
  remove: (id) => set(s => ({ items: s.items.filter(x => x.variantId !== id) })),
  clear: () => set({ items: [] }),
  toggleWish: (id) => set(s => ({ wish: s.wish.includes(id) ? s.wish.filter(x => x !== id) : [...s.wish, id] })),
}), { name: "raasta-cart" }));
