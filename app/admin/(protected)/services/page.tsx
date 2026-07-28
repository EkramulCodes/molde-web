'use client';

import { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiEyeOff, 
  FiArrowUp, 
  FiArrowDown, 
  FiCheckCircle, 
  FiX, 
  FiImage, 
  FiRefreshCw, 
  FiDollarSign 
} from 'react-icons/fi';
import { notifyCmsUpdated } from '@/context/LanguageContext';
import { compressImage } from '@/lib/utils';

interface ServiceItem {
  id: string;
  slug: string;
  icon: string;
  imageUrl?: string;
  titleEn: string;
  titleNo: string;
  descriptionEn: string;
  descriptionNo: string;
  featuresEn: string[];
  featuresNo: string[];
  price?: string;
  status: 'active' | 'hidden';
  order: number;
  metaTitle?: string;
  metaDescription?: string;
}

export default function ServicesManager() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const loadServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (Array.isArray(data)) {
        setServices(data);
      }
    } catch (e) {
      console.error('Failed to load services', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchServicesData = async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (active && Array.isArray(data)) {
          setServices(data);
        }
      } catch (e) {
        console.error('Failed to load services', e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchServicesData();
    return () => { active = false; };
  }, []);

  const handleImageUpload = async (rawFile: File) => {
    // Generate immediate local preview
    try {
      const localUrl = URL.createObjectURL(rawFile);
      setImagePreview(localUrl);
    } catch (err) {
      console.warn('Failed to create local image preview url', err);
    }

    setUploadingImage(true);
    try {
      const file = await compressImage(rawFile);
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        setEditingService(prev => prev ? { ...prev, imageUrl: data.data.url } : prev);
        setImagePreview(data.data.url);
      } else {
        alert('Upload failed');
        setImagePreview(editingService?.imageUrl || null);
      }
    } catch (e) {
      console.error(e);
      alert('Upload error');
      setImagePreview(editingService?.imageUrl || null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenAddModal = () => {
    setImagePreview(null);
    setEditingService({
      id: `svc-${Date.now()}`,
      slug: 'new-service',
      icon: 'FiMonitor',
      imageUrl: '',
      titleEn: '',
      titleNo: '',
      descriptionEn: '',
      descriptionNo: '',
      featuresEn: ['Custom UI Design', 'Next.js Frontend'],
      featuresNo: ['Skreddersydd UI Design', 'Next.js Utvikling'],
      price: '$1,500',
      status: 'active',
      metaTitle: '',
      metaDescription: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: ServiceItem) => {
    setImagePreview(service.imageUrl || null);
    setEditingService({ ...service });
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.titleEn || !editingService?.titleNo) {
      alert('Please provide titles for both English and Norwegian.');
      return;
    }

    setSaving(true);
    try {
      const isNew = !services.some((s) => s.id === editingService.id);
      const url = isNew ? '/api/services' : `/api/services/${editingService.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService),
      });

      if (res.ok) {
        notifyCmsUpdated();
        setToast(`Service ${isNew ? 'created' : 'updated'} successfully!`);
        setIsModalOpen(false);
        setEditingService(null);
        setImagePreview(null);
        await loadServices();
        setTimeout(() => setToast(''), 4000);
      } else {
        alert('Failed to save service.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving service.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notifyCmsUpdated();
        setToast('Service deleted.');
        await loadServices();
        setTimeout(() => setToast(''), 4000);
      }
    } catch (e) {
      alert('Failed to delete service.');
    }
  };

  const handleToggleStatus = async (service: ServiceItem) => {
    const newStatus = service.status === 'active' ? 'hidden' : 'active';
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...service, status: newStatus }),
      });
      if (res.ok) {
        notifyCmsUpdated();
        await loadServices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === services.length - 1)) {
      return;
    }

    const newServices = [...services];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newServices[index];
    newServices[index] = newServices[targetIndex];
    newServices[targetIndex] = temp;

    // re-assign order property
    newServices.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setServices(newServices);

    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newServices),
      });
      if (res.ok) {
        notifyCmsUpdated();
      }
    } catch (e) {
      console.error('Failed to save reordering', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Services CRUD Manager</h1>
          <p className="text-slate text-sm">Add, edit, reorder, and control visibility of core agency services.</p>
        </div>

        <div className="flex items-center space-x-3">
          {toast && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-lg flex items-center space-x-1 animate-fade-in">
              <FiCheckCircle size={14} />
              <span>{toast}</span>
            </div>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-gold text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:brightness-110 transition-all flex items-center space-x-2 shadow-lg shadow-gold/20"
          >
            <FiPlus size={16} />
            <span>Add New Service</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate">
          <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={24} />
          <p>Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-bg-primary rounded-2xl p-12 text-center border border-slate/10 space-y-4">
          <p className="text-slate">No services found. Click &quot;Add New Service&quot; to create one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`bg-bg-primary rounded-2xl p-6 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                service.status === 'hidden' ? 'opacity-60 border-slate/10' : 'border-slate/15 hover:border-teal/30 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex flex-col space-y-1 text-slate">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, 'up')}
                    className="p-1 hover:text-teal disabled:opacity-20 transition-colors"
                    title="Move Up"
                  >
                    <FiArrowUp size={16} />
                  </button>
                  <button
                    disabled={index === services.length - 1}
                    onClick={() => handleMoveOrder(index, 'down')}
                    className="p-1 hover:text-teal disabled:opacity-20 transition-colors"
                    title="Move Down"
                  >
                    <FiArrowDown size={16} />
                  </button>
                </div>

                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt={service.titleEn}
                    className="w-16 h-16 object-cover rounded-xl border border-slate/20"
                  />
                ) : (
                  <div className="w-16 h-16 bg-teal/10 text-teal rounded-xl flex items-center justify-center font-bold text-lg font-mono">
                    {service.id.slice(0, 3).toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-display font-bold text-lg text-ink">{service.titleEn}</h3>
                    <span className="text-xs text-slate font-mono">({service.titleNo})</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        service.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate/20 text-slate'
                      }`}
                    >
                      {service.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate line-clamp-1 max-w-xl">{service.descriptionEn}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate font-mono">
                    {service.price && <span>Price: <strong className="text-gold">{service.price}</strong></span>}
                    <span>Slug: /{service.slug}</span>
                    <span>Features: {service.featuresEn?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end md:self-center">
                <button
                  onClick={() => handleToggleStatus(service)}
                  className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                    service.status === 'active'
                      ? 'border-slate/20 text-slate hover:bg-slate/10'
                      : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                  }`}
                  title={service.status === 'active' ? 'Hide Service' : 'Activate Service'}
                >
                  {service.status === 'active' ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>

                <button
                  onClick={() => handleOpenEditModal(service)}
                  className="px-3 py-2 bg-slate/10 hover:bg-teal/20 text-teal rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                >
                  <FiEdit2 size={14} />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDeleteService(service.id, service.titleEn)}
                  className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                >
                  <FiTrash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingService && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-primary border border-slate/20 rounded-2xl max-w-3xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate/10 pb-4">
              <h2 className="font-display text-xl font-bold text-ink">
                {services.some((s) => s.id === editingService.id) ? 'Edit Service' : 'Create New Service'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingService(null);
                  setImagePreview(null);
                }}
                className="text-slate hover:text-ink p-1 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate">Service Title (English)</label>
                  <input
                    type="text"
                    required
                    value={editingService.titleEn || ''}
                    onChange={(e) => setEditingService({ ...editingService, titleEn: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                    placeholder="Website Development"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate">Service Title (Norwegian)</label>
                  <input
                    type="text"
                    required
                    value={editingService.titleNo || ''}
                    onChange={(e) => setEditingService({ ...editingService, titleNo: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                    placeholder="Nettsideutvikling"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate">URL Slug</label>
                  <input
                    type="text"
                    value={editingService.slug || ''}
                    onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                    placeholder="website-development"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate">Price / Details Tag</label>
                  <input
                    type="text"
                    value={editingService.price || ''}
                    onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                    placeholder="From $2,500"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate">Description (English)</label>
                  <textarea
                    rows={2}
                    value={editingService.descriptionEn || ''}
                    onChange={(e) => setEditingService({ ...editingService, descriptionEn: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate">Description (Norwegian)</label>
                  <textarea
                    rows={2}
                    value={editingService.descriptionNo || ''}
                    onChange={(e) => setEditingService({ ...editingService, descriptionNo: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate">Service Image</label>
                  
                  {/* Image Preview above the drag-and-drop zone */}
                  {imagePreview && (
                    <div className="relative group rounded-lg overflow-hidden border border-slate/20 bg-bg-deep max-h-[240px] flex items-center justify-center p-2 mb-2 animate-fade-in">
                      <img
                        src={imagePreview}
                        alt="Service preview"
                        className="max-h-[220px] w-auto object-contain rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setEditingService(prev => prev ? { ...prev, imageUrl: '' } : prev);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-lg cursor-pointer"
                        title="Remove image"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  )}

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        await handleImageUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                      dragActive ? 'border-teal bg-teal/10' : 'border-slate/20 hover:border-teal/50 bg-bg-deep'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FiImage size={24} className={uploadingImage ? "text-slate animate-pulse" : "text-teal"} />
                      <p className="text-sm font-medium text-ink">
                        {uploadingImage ? 'Uploading...' : 'Drag & drop service image here'}
                      </p>
                      <p className="text-xs text-slate">Supports JPG, PNG, WEBP (Max 5MB). Recommended size: 754x668 px</p>
                      <p className="text-[11px] text-teal/80">
                        Safe upload: Any size is safe. Large images are automatically resized and compressed to 1200x1200px max (JPEG) for high-performance loading.
                      </p>
                      
                      {!uploadingImage && (
                        <label className="mt-2 inline-flex items-center space-x-2 px-4 py-1.5 bg-teal/10 text-teal hover:text-white hover:bg-teal rounded cursor-pointer transition-colors text-xs font-bold uppercase">
                          <span>Browse File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                await handleImageUpload(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-2">
                    <input
                      type="text"
                      value={editingService.imageUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingService({ ...editingService, imageUrl: val });
                        setImagePreview(val || null);
                      }}
                      className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                      placeholder="Or paste image URL (https://images.unsplash.com/...)"
                    />
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate">
                    Features List EN (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editingService.featuresEn?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        featuresEn: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                    placeholder="Custom UI/UX, Next.js Development, CMS Integration"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate">
                    Features List NO (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editingService.featuresNo?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        featuresNo: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                    placeholder="Skreddersydd UI/UX, Next.js Utvikling, CMS Integrasjon"
                  />
                </div>

                <div className="space-y-1 md:col-span-2 border-t border-slate/10 pt-4">
                  <label className="block text-xs font-bold uppercase text-slate">SEO Meta Title</label>
                  <input
                    type="text"
                    value={editingService.metaTitle || ''}
                    onChange={(e) => setEditingService({ ...editingService, metaTitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={editingService.metaDescription || ''}
                    onChange={(e) => setEditingService({ ...editingService, metaDescription: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingService(null);
                    setImagePreview(null);
                  }}
                  className="px-5 py-2.5 bg-slate/10 text-slate hover:text-ink rounded-lg text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-teal text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-teal/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
