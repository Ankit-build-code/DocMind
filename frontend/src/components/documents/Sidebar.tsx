'use client';

import { useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2, CheckSquare, Square, LogOut, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { useDocumentStore, useAuthStore } from '@/lib/store';
import type { Document } from '@/types';

export function Sidebar() {
  const { documents, selectedDocIds, setDocuments, toggleDoc } = useDocumentStore();
  const logout = useAuthStore((s) => s.logout);

  // Fetch documents on mount
  useEffect(() => {
    apiClient.get<Document[]>('/documents').then(({ data }) => setDocuments(data)).catch(() => {});
  }, [setDocuments]);

  const onDrop = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const form = new FormData();
        form.append('file', file);
        try {
          const { data } = await apiClient.post<Document>('/documents/upload', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          // Use functional update to avoid stale closure over `documents`
          setDocuments((prev: Document[]) => [...prev, data]);
          toast.success(`${file.name} uploaded`);
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    },
    [setDocuments]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'text/markdown': ['.md'] },
    multiple: true,
  });

  async function deleteDoc(id: string) {
    try {
      await apiClient.delete(`/documents/${id}`);
      setDocuments(documents.filter((d) => d.id !== id));
      toast.success('Document removed');
    } catch {
      toast.error('Failed to delete document');
    }
  }

  return (
    <aside className="w-72 border-r border-slate-200 bg-white flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200">
        <Zap className="w-5 h-5 text-brand-600" />
        <span className="font-bold text-slate-800 text-lg">DocMind</span>
      </div>

      {/* Upload zone */}
      <div className="px-4 py-3">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl px-3 py-5 text-center cursor-pointer transition ${
            isDragActive
              ? 'border-brand-500 bg-brand-50'
              : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500">
            {isDragActive ? 'Drop files here' : 'Drop PDFs / TXT / MD or click to upload'}
          </p>
        </div>
      </div>

      {/* Doc list */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
        {documents.length === 0 && (
          <p className="text-xs text-slate-400 text-center mt-6">No documents yet</p>
        )}
        {documents.map((doc) => {
          const selected = selectedDocIds.includes(doc.id);
          return (
            <div
              key={doc.id}
              className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50 group"
            >
              <button onClick={() => toggleDoc(doc.id)} className="flex-shrink-0">
                {selected ? (
                  <CheckSquare className="w-4 h-4 text-brand-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300" />
                )}
              </button>
              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="flex-1 text-xs text-slate-700 truncate">{doc.filename}</span>
              <button
                onClick={() => deleteDoc(doc.id)}
                className="opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400 hover:text-rose-600" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200">
        {selectedDocIds.length > 0 && (
          <p className="text-xs text-brand-600 mb-2 font-medium">
            {selectedDocIds.length} doc{selectedDocIds.length > 1 ? 's' : ''} selected for chat
          </p>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-rose-500 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
