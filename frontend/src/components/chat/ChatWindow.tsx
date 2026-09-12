'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useChatStore, useDocumentStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { MessageBubble } from './MessageBubble';
import type { Message } from '@/types';

export function ChatWindow() {
  const [input, setInput] = useState('');
  const { messages, isStreaming, addMessage, setStreaming } = useChatStore();
  const selectedDocIds = useDocumentStore((s) => s.selectedDocIds);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    addMessage(userMsg);
    setStreaming(true);

    try {
      const { data } = await apiClient.post('/query', {
        question: text,
        document_ids: selectedDocIds.length > 0 ? selectedDocIds : undefined,
      });

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer,
        citations: data.citations,
        retrieval_ms: data.retrieval_ms,
        created_at: new Date().toISOString(),
      };
      addMessage(assistantMsg);
    } catch {
      toast.error('Failed to get answer. Please try again.');
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-600" />
          <span className="font-semibold text-slate-800">DocMind Chat</span>
        </div>
        <span className="text-xs text-slate-400">Powered by Moss · sub-10ms retrieval</span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <Zap className="w-12 h-12 text-brand-200" />
            <h2 className="text-xl font-semibold text-slate-600">Ask anything about your docs</h2>
            <p className="text-slate-400 text-sm max-w-sm">
              Upload documents from the sidebar, then ask questions. Every answer cites its source.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isStreaming && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="animate-pulse">●</span>
            <span className="animate-pulse delay-75">●</span>
            <span className="animate-pulse delay-150">●</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-slate-200 bg-white">
        <div className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents…"
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
