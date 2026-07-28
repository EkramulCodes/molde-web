'use client';

import { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiArrowUp, 
  FiArrowDown, 
  FiCheckCircle, 
  FiX, 
  FiImage, 
  FiRefreshCw,
  FiLink,
  FiBriefcase
} from 'react-icons/fi';
import { notifyCmsUpdated } from '@/context/LanguageContext';
import { compressImage } from '@/lib/utils';

interface PortfolioItem {
  id: string;
  titleEn: string;
  titleNo: string;
  categoryEn: string;
  categoryNo: string;
  imageUrl: string;
  dimensions?: string;
  descriptionEn: string;
  descriptionNo: string;
  link?: string;
  order: number;
}

export default function PortfolioManager() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<PortfolioItem> | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const loadItems = async () => {
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (e) {
      console.error('Failed to load portfolio items', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadItems();
    };
    init();
  }, []);

  const handleImageUpload = async (rawFile: File) => {
    try {
      const localUrl = URL.createObjectURL(rawFile);
      setImagePreview(localUrl);
    } catch (err) {
      console.warn(err);
    }

    setUploadingImage(true);
    try {
      // Get dimensions
      const img = new Image();
      img.src = localUrl;
      await new Promise((resolve) => {
        img.onload = () => {
          setEditingItem(prev => prev ? { ...prev, dimensions: `${img.width}x${img.height}` } : prev);
          resolve(null);
        };
      });

      const file = await compressImage(rawFile);
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        setEditingItem(prev => prev ? { ...prev, imageUrl: data.data.url } : prev);
        setImagePreview(data.data.url);
      } else {
        alert('Upload failed');
      }
    } catch (e) {
      console.error(e);
      alert('Upload error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenAddModal = () => {
    setImagePreview(null);
    setEditingItem({
      id: `port-${Date.now()}`,
      titleEn: '',
      titleNo: '',
      categoryEn: '',
      categoryNo: '',
      imageUrl: '',
      descriptionEn: '',
      descriptionNo: '',
      link: '',
      order: items.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: PortfolioItem) => {
    setImagePreview(item.imageUrl || null);
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.titleEn || !editingItem?.titleNo) {
      alert('Please provide titles for both languages.');
      return;
    }

    setSaving(true);
    try {
      const isNew = !items.some((s) => s.id === editingItem.id);
      const res = await fetch('/api/portfolio', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        notifyCmsUpdated();
        setToast(`Project ${isNew ? 'created' : 'updated'} successfully!`);
        setIsModalOpen(false);
        setEditingItem(null);
        await loadItems();
        setTimeout(() => setToast(''), 4000);
      } else {
        alert('Failed to save.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        notifyCmsUpdated();
        setToast('Project deleted.');
        await loadItems();
        setTimeout(() => setToast(''), 4000);
      }
    } catch (e) {
      alert('Failed to delete.');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((s, idx) => s.order = idx + 1);
    setItems(newItems);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItems),
      });
      if (res.ok) notifyCmsUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Portfolio Manager</h1>
          <p className="text-slate text-sm">Showcase your best work and success stories.</p>
        </div>

        <div className="flex items-center space-x-3">
          {toast && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-lg flex items-center space-x-1">
              <FiCheckCircle size={14} />
              <span>{toast}</span>
            </div>
          )}
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-gold text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:brightness-110 transition-all flex items-center space-x-2 shadow-lg shadow-gold/20"
          >
            <FiPlus size={16} />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate">
          <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={24} />
          <p>Loading portfolio...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-bg-primary rounded-2xl p-12 text-center border border-slate/10">
          <p className="text-slate">No projects found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div key={item.id} className="bg-bg-primary rounded-2xl border border-slate/15 overflow-hidden group hover:border-teal/30 transition-all shadow-sm">
              <div className="aspect-video relative overflow-hidden bg-bg-deep">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.titleEn} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate/20">
                    <FiBriefcase size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button onClick={() => handleMoveOrder(index, 'up')} disabled={index === 0} className="p-1.5 bg-black/50 text-white rounded-lg hover:bg-teal disabled:opacity-30"><FiArrowUp size={14} /></button>
                  <button onClick={() => handleMoveOrder(index, 'down')} disabled={index === items.length - 1} className="p-1.5 bg-black/50 text-white rounded-lg hover:bg-teal disabled:opacity-30"><FiArrowDown size={14} /></button>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-teal">{item.categoryEn}</span>
                  <h3 className="font-display font-bold text-lg text-ink line-clamp-1">{item.titleEn}</h3>
                  {item.dimensions && (
                    <span className="text-[9px] font-mono text-slate/60 block mt-0.5">Dimensions: {item.dimensions}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleOpenEditModal(item)} className="flex-1 py-2 bg-slate/10 hover:bg-teal/20 text-teal rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2">
                    <FiEdit2 size={14} /> <span>Edit</span>
                  </button>
                  <button onClick={() => handleDeleteItem(item.id, item.titleEn)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-primary border border-slate/20 rounded-2xl max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center border-b border-slate/10 pb-4">
              <h2 className="font-display text-xl font-bold text-ink">
                {items.some((s) => s.id === editingItem.id) ? 'Edit Project' : 'Add Project'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate hover:text-ink"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate">Title (EN)</label>
                  <input type="text" value={editingItem.titleEn || ''} onChange={e => setEditingItem({...editingItem, titleEn: e.target.value})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate">Title (NO)</label>
                  <input type="text" value={editingItem.titleNo || ''} onChange={e => setEditingItem({...editingItem, titleNo: e.target.value})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate">Category (EN)</label>
                  <input type="text" value={editingItem.categoryEn || ''} onChange={e => setEditingItem({...editingItem, categoryEn: e.target.value})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate">Category (NO)</label>
                  <input type="text" value={editingItem.categoryNo || ''} onChange={e => setEditingItem({...editingItem, categoryNo: e.target.value})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate">Project Link (Optional)</label>
                <div className="relative">
                  <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" size={14} />
                  <input type="url" value={editingItem.link || ''} onChange={e => setEditingItem({...editingItem, link: e.target.value})} className="w-full pl-10 pr-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none" placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate">Project Image</label>
                {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg mb-2" />}
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? 'border-teal bg-teal/10' : 'border-slate/20 bg-bg-deep'}`}
                  onDragOver={e => {e.preventDefault(); setDragActive(true)}} onDragLeave={() => setDragActive(false)}
                  onDrop={async e => {e.preventDefault(); setDragActive(false); if(e.dataTransfer.files[0]) await handleImageUpload(e.dataTransfer.files[0])}}
                >
                   <FiImage className="mx-auto mb-2 text-teal" size={24} />
                   <label className="cursor-pointer text-xs font-bold text-teal uppercase">
                     {uploadingImage ? 'Uploading...' : 'Upload Image'}
                     <input type="file" className="hidden" onChange={async e => {if(e.target.files?.[0]) await handleImageUpload(e.target.files[0])}} />
                   </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-slate/10 text-slate rounded-lg text-xs font-bold uppercase">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-teal text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-teal/90 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
