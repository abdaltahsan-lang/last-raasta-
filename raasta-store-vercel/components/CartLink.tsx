"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
export default function CartLink() {
  const n = useCart(s => s.items.reduce((a, i) => a + i.qty, 0));
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return <Link className="ib" href="/cart">Cart ({m ? n : 0})</Link>;
}
