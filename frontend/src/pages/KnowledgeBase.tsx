import { useState } from 'react';
import { BookOpen, Plus, Search, ChevronDown, ChevronRight, Edit2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KnowledgeCategory } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { uploadKnowledge } from '@/api/businesses';
import { getApiErrorMessage } from '@/api/client';

export default function KnowledgeBase() {
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(categories[0]?.id || null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const businessId = useAuthStore((s) => s.user?.business_id || '');

  const startEdit = (cat: KnowledgeCategory) => {
    setEditingId(cat.id);
    setEditContent(cat.content);
  };

  const saveEdit = async (id: string) => {
    const target = categories.find((c) => c.id === id);
    if (!target || !businessId) return;
    setSaving(true);
    setError(null);
    try {
      await uploadKnowledge(businessId, { category: target.name, content: editContent });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, content: editContent, updated_at: new Date().toISOString().split('T')[0] } : c));
    setEditingId(null);
  };

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.content.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      {!businessId && (
        <div className="text-sm text-muted-foreground">
          Link a business to upload knowledge entries.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your AI's knowledge</p>
        </div>
        <button
          onClick={() => {
            if (!newName || !newContent) return;
            const next: KnowledgeCategory = {
              id: crypto.randomUUID(),
              name: newName,
              content: newContent,
              updated_at: new Date().toISOString().split('T')[0],
            };
            setCategories((prev) => [next, ...prev]);
            setExpandedId(next.id);
            setNewName('');
            setNewContent('');
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="glass-card p-4 space-y-3">
        <h3 className="text-sm font-semibold">New Knowledge Entry</h3>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Category name"
          className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm"
        />
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Content"
          className="w-full h-28 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm font-mono"
        />
        <button
          onClick={async () => {
            if (!newName || !newContent || !businessId) return;
            setSaving(true);
            setError(null);
            try {
              await uploadKnowledge(businessId, { category: newName, content: newContent });
            } catch (err) {
              setError(getApiErrorMessage(err));
            } finally {
              setSaving(false);
            }
          }}
          disabled={!businessId || !newName || !newContent || saving}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save to API'}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((cat) => {
          const isExpanded = expandedId === cat.id;
          const isEditing = editingId === cat.id;
          return (
            <div key={cat.id} className="glass-card overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Updated {cat.updated_at}</span>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-48 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(cat.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90">
                          <Save className="w-3 h-3" /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap">
                        {cat.content}
                      </div>
                      <button onClick={() => startEdit(cat)} className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium transition-colors">
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
