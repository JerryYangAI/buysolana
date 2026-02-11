"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/antiabuse/turnstile-widget";

type Props = {
  locale: string;
  turnstileSiteKey: string;
  labels: {
    emailField: string;
    questionField: string;
    autoThread: string;
    submit: string;
  };
};

export function AskForm({ locale, turnstileSiteKey, labels }: Props) {
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [autoThread, setAutoThread] = useState(true);
  const [status, setStatus] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");

    if (!turnstileToken) {
      setStatus("Please complete the Turnstile check.");
      return;
    }

    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale,
        email,
        subject: question.slice(0, 80),
        body: question,
        autoThread,
        turnstileToken,
      }),
    });

    if (!response.ok) {
      setStatus("Submit failed.");
      return;
    }

    setStatus("Submitted.");
    setQuestion("");
    setEmail("");
    setTurnstileToken("");
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-white/12 bg-white/[0.03] p-5">
      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={labels.emailField}
        className="w-full rounded-lg border border-white/20 bg-[#0c1018] px-3 py-2 text-sm text-zinc-100 outline-none"
      />

      <textarea
        required
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder={labels.questionField}
        rows={6}
        className="w-full rounded-lg border border-white/20 bg-[#0c1018] px-3 py-2 text-sm text-zinc-100 outline-none"
      />

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={autoThread}
          onChange={(event) => setAutoThread(event.target.checked)}
        />
        {labels.autoThread}
      </label>

      <TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} />

      {status ? <p className="text-sm text-cyan-200">{status}</p> : null}

      <button type="submit" className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black">
        {labels.submit}
      </button>
    </form>
  );
}
