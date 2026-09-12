'use client';

import ReactMarkdown from 'react-markdown';
import { BookOpen, Clock } from 'lucide-react';
import type { Message } from '@/types';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-brand-600 text-white rounded-br-sm'
              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
          }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown className="prose prose-sm max-w-none prose-p:my-1 prose-pre:bg-slate-100">
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Retrieval latency badge */}
        {message.retrieval_ms !== undefined && (
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <Clock className="w-3 h-3" />
            <span>Retrieved in {message.retrieval_ms}ms</span>
          </div>
        )}

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="w-full space-y-1">
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Sources
            </p>
            {message.citations.map((c, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600"
              >
                <span className="font-semibold text-brand-600">{c.filename}</span>
                <p className="mt-0.5 line-clamp-2 text-slate-500">{c.chunk_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
