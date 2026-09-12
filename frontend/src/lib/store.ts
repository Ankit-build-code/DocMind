import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import type { Document, Message } from '@/types';

// ── Auth ─────────────────────────────────────────────────────────────────────
interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => {
        Cookies.set('docmind_token', token, { expires: 7, sameSite: 'strict' });
        set({ token });
      },
      logout: () => {
        // Read token BEFORE removing it
        const token = Cookies.get('docmind_token');
        Cookies.remove('docmind_token');
        set({ token: null });
        // Best-effort server-side logout signal
        if (token) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
        }
      },
    }),
    { name: 'docmind-auth' }
  )
);

// ── Documents ────────────────────────────────────────────────────────────────
interface DocumentState {
  documents: Document[];
  selectedDocIds: string[];
  setDocuments: (docs: Document[] | ((prev: Document[]) => Document[])) => void;
  toggleDoc: (id: string) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  selectedDocIds: [],
  setDocuments: (docs) =>
    set((s) => ({
      documents: typeof docs === 'function' ? docs(s.documents) : docs,
    })),
  toggleDoc: (id) =>
    set((s) => ({
      selectedDocIds: s.selectedDocIds.includes(id)
        ? s.selectedDocIds.filter((d) => d !== id)
        : [...s.selectedDocIds, id],
    })),
}));

// ── Chat ──────────────────────────────────────────────────────────────────────
interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  addMessage: (msg: Message) => void;
  setStreaming: (v: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  clearMessages: () => set({ messages: [] }),
}));
