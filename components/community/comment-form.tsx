"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TurnstileWidget } from "@/components/antiabuse/turnstile-widget";

type Props = {
  postId: string;
  turnstileSiteKey: string;
  labels: {
    authorField: string;
    commentField: string;
    submit: string;
    rateLimit: string;
  };
};

const KEY = "community_comment_last_submit";
const COOLDOWN_MS = 30_000;

export function CommentForm({ postId, turnstileSiteKey, labels }: Props) {
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const now = Date.now();
    const last = Number(localStorage.getItem(KEY) || 0);
    if (now - last < COOLDOWN_MS) {
      setError(labels.rateLimit);
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the Turnstile check.");
      return;
    }

    setPending(true);
    const response = await fetch(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author_name: author, body, turnstileToken }),
    });

    setPending(false);

    if (!response.ok) {
      setError("Submit failed.");
      return;
    }

    localStorage.setItem(KEY, String(now));
    setBody("");
    setTurnstileToken("");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-white/12 bg-white/[0.03] p-5">
      <input
        required
        value={author}
        onChange={(event) => setAuthor(event.target.value)}
        placeholder={labels.authorField}
        className="w-full rounded-lg border border-white/20 bg-[#0c1018] px-3 py-2 text-sm text-zinc-100 outline-none"
      />
      <textarea
        required
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={labels.commentField}
        rows={4}
        className="w-full rounded-lg border border-white/20 bg-[#0c1018] px-3 py-2 text-sm text-zinc-100 outline-none"
      />
      <TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
      >
        {labels.submit}
      </button>
    </form>
  );
}
