"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/routing";

type Props = {
  locale: Locale;
  labels: {
    title: string;
    placeholder: string;
    send: string;
    refusal: string;
    routeHint: string;
  };
};

function isTradingQuestion(value: string) {
  return /(buy|sell|entry|exit|all in|leverage|抄底|卖出|买入|止盈|止损)/i.test(value);
}

export function ChatWidget({ locale, labels }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");

  const onSend = () => {
    const value = input.trim();
    if (!value) return;

    if (isTradingQuestion(value)) {
      setReply(labels.refusal);
    } else {
      setReply(labels.routeHint);
    }
    setInput("");
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 w-[min(90vw,22rem)]">
      {open ? (
        <div className="rounded-2xl border border-white/15 bg-[#111420] p-3 shadow-2xl shadow-black/40">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-100">{labels.title}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Close
            </button>
          </div>

          {reply && <p className="mb-3 text-sm text-zinc-200">{reply}</p>}

          <div className="mb-3 flex gap-2 text-xs">
            <Link href={withLocale(locale, "/learn")} className="rounded bg-white/10 px-2 py-1 text-zinc-200">
              /learn
            </Link>
            <Link href={withLocale(locale, "/glossary")} className="rounded bg-white/10 px-2 py-1 text-zinc-200">
              /glossary
            </Link>
            <Link href={withLocale(locale, "/security")} className="rounded bg-white/10 px-2 py-1 text-zinc-200">
              /security
            </Link>
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={labels.placeholder}
              className="flex-1 rounded-md border border-white/20 bg-[#090b11] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-300"
            />
            <button
              type="button"
              onClick={onSend}
              className="rounded-md bg-cyan-300 px-3 py-2 text-sm font-semibold text-black"
            >
              {labels.send}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto block rounded-full border border-cyan-300/40 bg-[#0e1620] px-4 py-2 text-sm font-medium text-cyan-200"
        >
          {labels.title}
        </button>
      )}
    </div>
  );
}
