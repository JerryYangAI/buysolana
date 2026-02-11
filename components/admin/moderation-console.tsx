"use client";

import { useMemo, useState } from "react";

type Entity = "posts" | "comments" | "asks";
type Action = "publish" | "hide";

type PostItem = {
  id: string;
  locale: string;
  title: string;
  body: string;
  author_name: string | null;
  status: string;
  created_at: string;
};

type CommentItem = {
  id: string;
  post_id: string;
  body: string;
  author_name: string | null;
  status: string;
  created_at: string;
};

type AskItem = {
  id: string;
  locale: string;
  subject: string;
  body: string;
  email: string | null;
  status: string;
  created_at: string;
};

type Section<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

type ModerationResponse = {
  posts: Section<PostItem>;
  comments: Section<CommentItem>;
  asks: Section<AskItem>;
};

function dateText(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

export function ModerationConsole({
  initialAuthenticated,
  initialData,
}: {
  initialAuthenticated: boolean;
  initialData: ModerationResponse | null;
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState<ModerationResponse | null>(initialData);

  const maxPage = useMemo(() => {
    if (!data) return 1;
    const totals = [data.posts.total, data.comments.total, data.asks.total];
    const maxTotal = Math.max(...totals, 0);
    return Math.max(1, Math.ceil(maxTotal / pageSize));
  }, [data, pageSize]);

  const loadData = async (targetPage: number, targetPageSize: number) => {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/moderation?page=${targetPage}&pageSize=${targetPageSize}`, {
      cache: "no-store",
    });

    setLoading(false);

    if (res.status === 401) {
      setAuthenticated(false);
      setData(null);
      return;
    }

    if (!res.ok) {
      setError("Failed to load moderation data.");
      return;
    }

    const json = (await res.json()) as ModerationResponse;
    setData(json);
    setPage(targetPage);
    setPageSize(targetPageSize);
  };

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Login failed.");
      return;
    }

    setAuthenticated(true);
    setPassword("");
    await loadData(1, pageSize);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    setAuthenticated(false);
    setData(null);
    setError("");
  };

  const moderate = async (entity: Entity, id: string, action: Action) => {
    setError("");

    const res = await fetch("/api/admin/moderation/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entity, id, action }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        setAuthenticated(false);
        setData(null);
        return;
      }
      setError("Failed to update status.");
      return;
    }

    await loadData(page, pageSize);
  };

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-white/12 bg-white/[0.03] p-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Admin Moderation Login</h1>
        <form onSubmit={login} className="mt-4 space-y-3">
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="ADMIN_PASSWORD"
            className="w-full rounded-lg border border-white/20 bg-[#0c1018] px-3 py-2 text-sm text-zinc-100 outline-none"
          />
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button type="submit" className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.03] p-4">
        <h1 className="text-xl font-semibold text-zinc-100">Moderation Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-zinc-300">Page</label>
          <input
            type="number"
            min={1}
            value={page}
            onChange={(event) => {
              const nextPage = Math.max(1, Number.parseInt(event.target.value || "1", 10));
              setPage(nextPage);
            }}
            className="w-20 rounded border border-white/20 bg-[#0c1018] px-2 py-1 text-sm text-zinc-100"
          />
          <select
            value={pageSize}
            onChange={(event) => {
              const nextPageSize = Number.parseInt(event.target.value, 10);
              setPageSize(nextPageSize);
              setPage(1);
            }}
            className="rounded border border-white/20 bg-[#0c1018] px-2 py-1 text-sm text-zinc-100"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <button
            type="button"
            onClick={() => void loadData(page, pageSize)}
            className="rounded-lg border border-white/20 px-3 py-1 text-sm text-zinc-200"
          >
            Refresh
          </button>
          <button type="button" onClick={logout} className="rounded-lg border border-rose-300/40 px-3 py-1 text-sm text-rose-200">
            Logout
          </button>
        </div>
      </section>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {loading ? <p className="text-sm text-zinc-400">Loading...</p> : null}

      <section className="space-y-3 rounded-2xl border border-white/12 bg-white/[0.03] p-4">
        <h2 className="text-lg font-semibold text-zinc-100">Pending Posts ({data?.posts.total || 0})</h2>
        {(data?.posts.items || []).map((item) => (
          <article key={item.id} className="rounded-xl border border-white/10 bg-[#0d111a] p-3">
            <p className="text-xs text-zinc-500">{dateText(item.created_at)} / {item.locale}</p>
            <h3 className="mt-1 text-base font-semibold text-zinc-100">{item.title}</h3>
            <p className="mt-1 line-clamp-3 text-sm text-zinc-300">{item.body}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void moderate("posts", item.id, "publish")} className="rounded bg-emerald-300 px-3 py-1 text-xs font-medium text-black">Publish</button>
              <button type="button" onClick={() => void moderate("posts", item.id, "hide")} className="rounded bg-rose-300 px-3 py-1 text-xs font-medium text-black">Hide</button>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border border-white/12 bg-white/[0.03] p-4">
        <h2 className="text-lg font-semibold text-zinc-100">Pending Comments ({data?.comments.total || 0})</h2>
        {(data?.comments.items || []).map((item) => (
          <article key={item.id} className="rounded-xl border border-white/10 bg-[#0d111a] p-3">
            <p className="text-xs text-zinc-500">{dateText(item.created_at)} / post: {item.post_id}</p>
            <p className="mt-1 text-sm text-zinc-300">{item.body}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void moderate("comments", item.id, "publish")} className="rounded bg-emerald-300 px-3 py-1 text-xs font-medium text-black">Publish</button>
              <button type="button" onClick={() => void moderate("comments", item.id, "hide")} className="rounded bg-rose-300 px-3 py-1 text-xs font-medium text-black">Hide</button>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border border-white/12 bg-white/[0.03] p-4">
        <h2 className="text-lg font-semibold text-zinc-100">Pending Asks ({data?.asks.total || 0})</h2>
        {(data?.asks.items || []).map((item) => (
          <article key={item.id} className="rounded-xl border border-white/10 bg-[#0d111a] p-3">
            <p className="text-xs text-zinc-500">{dateText(item.created_at)} / {item.locale}</p>
            <h3 className="mt-1 text-base font-semibold text-zinc-100">{item.subject}</h3>
            <p className="mt-1 line-clamp-3 text-sm text-zinc-300">{item.body}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void moderate("asks", item.id, "publish")} className="rounded bg-emerald-300 px-3 py-1 text-xs font-medium text-black">Publish</button>
              <button type="button" onClick={() => void moderate("asks", item.id, "hide")} className="rounded bg-rose-300 px-3 py-1 text-xs font-medium text-black">Hide</button>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 text-sm text-zinc-300">
        <p>
          Page {page} / {maxPage}
        </p>
      </section>
    </div>
  );
}
