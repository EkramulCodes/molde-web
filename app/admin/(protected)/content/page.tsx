'use client';

import { useState, useEffect } from 'react';
import { 
  FiSave, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiUploadCloud, 
  FiTrash2, 
  FiCopy, 
  FiCheck, 
  FiImage, 
  FiExternalLink 
} from 'react-icons/fi';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
}

export default function ContentManager() {
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'contact' | 'footer'>('hero');
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Media state
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const loadContent = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      setContent(data);
    } catch (err) {
      console.error('Failed to load content', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    setMediaLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMediaList(data);
      }
    } catch (e) {
      console.error('Error loading media', e);
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchAll = async () => {
      try {
        const [cRes, mRes] = await Promise.all([
          fetch('/api/content'),
          fetch('/api/media')
        ]);
        if (active) {
          if (cRes.ok) setContent(await cRes.json());
          if (mRes.ok) {
            const data = await mRes.json();
            if (Array.isArray(data)) setMediaList(data);
          }
        }
      } catch (err) {
        console.error('Failed to load content', err);
      } finally {
        if (active) {
          setLoading(false);
          setMediaLoading(false);
        }
      }
    };
    fetchAll();
    return () => { active = false; };
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });
      }
      await loadMedia();
    } catch (e) {
      alert('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string, filename: string) => {
    if (!confirm(`Delete media file "${filename}"?`)) return;

    try {
      const res = await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadMedia();
      }
    } catch (e) {
      alert('Error deleting media.');
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const absoluteUrl = window.location.origin + url;
    navigator.clipboard.writeText(absoluteUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleChange = (section: string, field: string, value: string) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast('');

    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      if (res.ok) {
        setToast('Content updated successfully! Changes are live.');
        setTimeout(() => setToast(''), 4000);
      } else {
        setToast('Error saving content.');
      }
    } catch (err) {
      setToast('Network error while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate">
        <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={24} />
        <p>Loading editable content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Website Text & Copy Editor</h1>
          <p className="text-slate text-sm">Edit headlines, paragraphs, and UI copy in English & Norwegian.</p>
        </div>

        {toast && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2 rounded-lg flex items-center space-x-2 animate-fade-in">
            <FiCheckCircle size={16} />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {/* Section Tabs */}
      <div className="flex space-x-2 border-b border-slate/10 overflow-x-auto pb-2">
        {[
          { id: 'hero', label: 'Hero Section' },
          { id: 'about', label: 'About Page' },
          { id: 'contact', label: 'Contact Section' },
          { id: 'footer', label: 'Footer Copy' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-teal text-white shadow-md'
                : 'text-slate hover:bg-slate/10 hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* HERO TAB */}
        {activeTab === 'hero' && content?.hero && (
          <div className="bg-bg-primary rounded-2xl p-8 border border-slate/10 shadow-sm space-y-6">
            <h2 className="font-display text-xl font-bold text-ink border-b border-slate/10 pb-4">Hero Section Text</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate">Headline (English)</label>
                <input
                  type="text"
                  value={content.hero.headlineEn || ''}
                  onChange={(e) => handleChange('hero', 'headlineEn', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate">Headline (Norwegian)</label>
                <input
                  type="text"
                  value={content.hero.headlineNo || ''}
                  onChange={(e) => handleChange('hero', 'headlineNo', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate">Subheadline Paragraph (English)</label>
                <textarea
                  rows={3}
                  value={content.hero.subheadlineEn || ''}
                  onChange={(e) => handleChange('hero', 'subheadlineEn', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate">Subheadline Paragraph (Norwegian)</label>
                <textarea
                  rows={3}
                  value={content.hero.subheadlineNo || ''}
                  onChange={(e) => handleChange('hero', 'subheadlineNo', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate">Primary CTA Button (English)</label>
                <input
                  type="text"
                  value={content.hero.ctaPrimaryEn || ''}
                  onChange={(e) => handleChange('hero', 'ctaPrimaryEn', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate">Primary CTA Button (Norwegian)</label>
                <input
                  type="text"
                  value={content.hero.ctaPrimaryNo || ''}
                  onChange={(e) => handleChange('hero', 'ctaPrimaryNo', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate">Secondary CTA Button (English)</label>
                <input
                  type="text"
                  value={content.hero.ctaSecondaryEn || ''}
                  onChange={(e) => handleChange('hero', 'ctaSecondaryEn', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate">Secondary CTA Button (Norwegian)</label>
                <input
                  type="text"
                  value={content.hero.ctaSecondaryNo || ''}
                  onChange={(e) => handleChange('hero', 'ctaSecondaryNo', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && content?.about && (
          <div className="bg-bg-primary rounded-2xl p-8 border border-slate/10 shadow-sm space-y-6">
            <h2 className="font-display text-xl font-bold text-ink border-b border-slate/10 pb-4">About Page Copy</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate">Main Title (English)</label>
                <input
                  type="text"
                  value={content.about.titleEn || ''}
                  onChange={(e) => handleChange('about', 'titleEn', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate">Main Title (Norwegian)</label>
                <input
                  type="text"
                  value={content.about.titleNo || ''}
                  onChange={(e) => handleChange('about', 'titleNo', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate">Header Subtitle (English)</label>
                <textarea
                  rows={2}
                  value={content.about.descEn || ''}
                  onChange={(e) => handleChange('about', 'descEn', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate">Header Subtitle (Norwegian)</label>
                <textarea
                  rows={2}
                  value={content.about.descNo || ''}
                  onChange={(e) => handleChange('about', 'descNo', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2 md:col-span-2 border-t border-slate/10 pt-4">
                <label className="block text-xs font-bold uppercase text-slate">Approach Paragraph 1 (English)</label>
                <textarea
                  rows={3}
                  value={content.about.approachP1En || ''}
                  onChange={(e) => handleChange('about', 'approachP1En', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate">Approach Paragraph 1 (Norwegian)</label>
                <textarea
                  rows={3}
                  value={content.about.approachP1No || ''}
                  onChange={(e) => handleChange('about', 'approachP1No', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && content?.contact && (
          <div className="bg-bg-primary rounded-2xl p-8 border border-slate/10 shadow-sm space-y-6">
            <h2 className="font-display text-xl font-bold text-ink border-b border-slate/10 pb-4">Contact Form Section Copy</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate">Section Title (English)</label>
                <input
                  type="text"
                  value={content.contact.titleEn || ''}
                  onChange={(e) => handleChange('contact', 'titleEn', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate">Section Title (Norwegian)</label>
                <input
                  type="text"
                  value={content.contact.titleNo || ''}
                  onChange={(e) => handleChange('contact', 'titleNo', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate">Subtitle (English)</label>
                <input
                  type="text"
                  value={content.contact.subtitleEn || ''}
                  onChange={(e) => handleChange('contact', 'subtitleEn', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate">Subtitle (Norwegian)</label>
                <input
                  type="text"
                  value={content.contact.subtitleNo || ''}
                  onChange={(e) => handleChange('contact', 'subtitleNo', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>
            </div>
          </div>
        )}

        {/* FOOTER TAB */}
        {activeTab === 'footer' && content?.footer && (
          <div className="bg-bg-primary rounded-2xl p-8 border border-slate/10 shadow-sm space-y-6">
            <h2 className="font-display text-xl font-bold text-ink border-b border-slate/10 pb-4">Footer Text</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate">Rights Reserved Line (English)</label>
                <input
                  type="text"
                  value={content.footer.rightsEn || ''}
                  onChange={(e) => handleChange('footer', 'rightsEn', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate">Rights Reserved Line (Norwegian)</label>
                <input
                  type="text"
                  value={content.footer.rightsNo || ''}
                  onChange={(e) => handleChange('footer', 'rightsNo', e.target.value)}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
              </div>
            </div>
          </div>
        )}

        {/* MEDIA SECTION - ALWAYS VISIBLE */}
        <div className="mt-12 pt-8 border-t border-slate/10 space-y-6">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-ink">Media Upload & Assets</h2>
            <p className="text-slate text-sm">Upload images and media assets to use across your content.</p>
          </div>
          {/* Drag & Drop Upload Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive 
                  ? 'border-teal bg-teal/10' 
                  : 'border-slate/20 bg-bg-primary hover:border-teal/50'
              }`}
            >
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-teal/10 text-teal rounded-2xl flex items-center justify-center mx-auto">
                  <FiUploadCloud size={32} />
                </div>
      
                <div>
                  <p className="font-display font-bold text-lg text-ink">
                    {uploading ? 'Uploading File...' : 'Drag and drop images here'}
                  </p>
                  <p className="text-xs text-slate mt-1">Supports PNG, JPG, WEBP, SVG up to 10MB</p>
                </div>
      
                <div>
                  <label className="inline-flex items-center space-x-2 px-6 py-2.5 bg-teal text-white font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer hover:bg-teal/90 transition-colors shadow-lg shadow-teal/20">
                    <FiImage size={16} />
                    <span>Browse Files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
      
            {/* Gallery Grid */}
            <div className="bg-bg-primary rounded-2xl p-6 border border-slate/10 space-y-4">
              <div className="flex justify-between items-center border-b border-slate/10 pb-4">
                <h2 className="font-display text-lg font-bold text-ink">Uploaded Media Assets ({mediaList.length})</h2>
                <button
                  onClick={loadMedia}
                  type="button"
                  className="text-xs text-slate hover:text-teal flex items-center space-x-1"
                >
                  <FiRefreshCw size={14} />
                  <span>Refresh</span>
                </button>
              </div>
      
              {mediaLoading ? (
                <div className="py-12 text-center text-slate">Loading media files...</div>
              ) : mediaList.length === 0 ? (
                <div className="py-12 text-center text-slate space-y-2">
                  <FiImage size={40} className="mx-auto text-slate/30" />
                  <p className="text-sm">No uploaded media files yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mediaList.map((media) => (
                    <div
                      key={media.id}
                      className="bg-bg-deep border border-slate/15 rounded-xl overflow-hidden group hover:border-teal/40 transition-all flex flex-col justify-between"
                    >
                      <div className="aspect-video relative overflow-hidden bg-black/20 flex items-center justify-center">
                        <img
                          src={media.url}
                          alt={media.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <a
                          href={media.url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="View Full Resolution"
                        >
                          <FiExternalLink size={14} />
                        </a>
                      </div>
      
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-xs font-bold text-ink truncate" title={media.filename}>
                            {media.filename}
                          </p>
                          <div className="flex justify-between items-center text-[11px] text-slate font-mono mt-1">
                            <span>{formatFileSize(media.size)}</span>
                            <span>{new Date(media.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
      
                        <div className="flex items-center space-x-2 pt-2 border-t border-slate/10">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(media.url, media.id)}
                            className="flex-1 py-1.5 px-2 bg-slate/10 hover:bg-teal/20 text-teal rounded text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                          >
                            {copiedId === media.id ? <FiCheck size={14} /> : <FiCopy size={14} />}
                            <span>{copiedId === media.id ? 'Copied!' : 'Copy URL'}</span>
                          </button>
      
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(media.id, media.filename)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                            title="Delete Image"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-teal text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-teal/90 transition-colors shadow-lg shadow-teal/20 flex items-center space-x-2 disabled:opacity-50"
          >
            <FiSave size={18} />
            <span>{saving ? 'Saving Live Content...' : 'Save All Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
