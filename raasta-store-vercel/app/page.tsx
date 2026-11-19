import Link from "next/link";
import { db } from "@/lib/db";
import { tk } from "@/lib/client";

type SP = { q?: string; cat?: string; sort?: string; stock?: string };
export default async function Home({ searchParams }: { searchParams: SP }) {
  const { q, cat, sort, stock } = searchParams;
  const orderBy = sort === "lo" ? { price: "asc" as const } : sort === "hi" ? { price: "desc" as const } : sort === "best" ? { isBest: "desc" as const } : { createdAt: "desc" as const };
  const words = (q || "").split(/\s+/).filter(Boolean);
  const [products, cats] = await Promise.all([
    db.product.findMany({
      where: { active: true, ...(cat ? { category: cat } : {}), ...(stock ? { variants: { some: { stock: { gt: 0 } } } } : {}), AND: words.map(w => ({ OR: [{ name: { contains: w, mode: "insensitive" as const } }, { category: { contains: w, mode: "insensitive" as const } }] })) },
      orderBy, include: { variants: { select: { stock: true } } },
    }),
    db.product.findMany({ where: { active: true }, distinct: ["category"], select: { category: true } }),
  ]);
  const link = (o: Partial<SP>) => { const p = new URLSearchParams(); const m = { ...searchParams, ...o }; for (const [k, v] of Object.entries(m)) if (v) p.set(k, v); return "/?" + p; };
  return (<>
    <section className="hero"><h1>DROP 03</h1><p style={{ maxWidth: "44ch" }}>Heavy cotton, loud details, built for the walk home. Made in small runs in Dhaka.</p></section>
    <form className="tools" action="/">
      <input name="q" defaultValue={q} placeholder="Search tees, hoodies, cargos…" aria-label="Search" />
      {cat && <input type="hidden" name="cat" value={cat} />}
      <select name="sort" defaultValue={sort || ""} aria-label="Sort"><option value="">Newest</option><option value="best">Best selling</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option></select>
      <label><input type="checkbox" name="stock" value="1" defaultChecked={!!stock} style={{ width: "auto" }} /> In stock</label>
      <button className="btn sm">Apply</button>
    </form>
    <div className="tools">
      <Link className={`chip ${!cat ? "on" : ""}`} href={link({ cat: undefined })}>All</Link>
      {cats.map(c => <Link key={c.category} className={`chip ${cat === c.category ? "on" : ""}`} href={link({ cat: c.category })}>{c.category}</Link>)}
    </div>
    {products.length ? <div className="grid">{products.map(p => {
      const out = p.variants.every(v => v.stock < 1), off = p.compareAt && p.compareAt > p.price ? Math.round(100 - (p.price / p.compareAt) * 100) : 0;
      return <Link key={p.id} href={`/products/${p.slug}`} className="card">
        <div className="ph">{p.images[0] ? <img src={p.images[0]} alt={p.name} /> : "RAASTA"}</div>
        {out ? <span className="tag">Sold out</span> : off ? <span className="tag">−{off}%</span> : p.isNew ? <span className="tag">New</span> : null}
        <span className="mu">{p.category}</span><b>{p.name}</b>
        <span>{tk(p.price)} {off ? <s className="mu">{tk(p.compareAt!)}</s> : null}</span>
      </Link>;
    })}</div> : <p>Nothing matches. <Link href="/"><u>Clear filters</u></Link></p>}
  </>);
}
