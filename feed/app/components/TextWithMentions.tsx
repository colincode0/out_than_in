"use client";

import Link from "next/link";
import { parseTextWithMentions } from "@/app/utils/mentions";

interface TextWithMentionsProps {
  text: string;
  className?: string;
}

export default function TextWithMentions({
  text,
  className = "",
}: TextWithMentionsProps) {
  const parts = parseTextWithMentions(text);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === "mention") {
          return (
            <Link
              key={index}
              href={`/${part.content}`}
              className="text-blue-400 hover:text-blue-300 hover:underline"
            >
              @{part.content}
            </Link>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
}
