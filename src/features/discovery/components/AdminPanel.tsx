import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, Upload, Save, X, MapPin, Phone, Globe, Star, Calendar, TrendingUp, Filter, Search, Image as ImageIcon } from 'lucide-react-native';
import { useFeaturedPlaces } from '../hooks/use-featured-places';
import { categoriesService } from '../../../services/firebase/firestore/categories-service';
import { imageUploadService } from '../../../services/firebase/storage/image-upload-service';
import type { FeaturedPlace, CreateFeaturedPlaceRequest, UpdateFeaturedPlaceRequest } from '../types/featured-place-types';

const AdminPanel = () => {
  const [places, setPlaces] = useState<FeaturedPlace[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<FeaturedPlace | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Use the real Firebase hook
  const { 
    loadPlaces, 
    createPlace, 
    updatePlace, 
    deletePlace, 
    archivePlace,
    recordImpression,
    recordSwipe,
    recordProfileView
  } = useFeaturedPlaces();

  // File input refs
  const heroImageRef = useRef<HTMLInputElement>(null);
  const galleryImagesRef = useRef<HTMLInputElement>(null);

  // Load places and categories on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load places
      await loadPlaces();
      
      // Load categories
      const loadedCategories = await categoriesService.getCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
    setLoading(false);
  };

  // Filter places based on category and search
  const filteredPlaces = places.filter(place => {
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         place.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         place.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const PlaceForm = ({ place, onSave, onCancel }: { 
    place?: FeaturedPlace | null; 
    onSave: (data: any) => Promise<void>; 
    onCancel: () => void; 
  }) => {
    const [formData, setFormData] = useState<Partial<FeaturedPlace>>(place || {
      name: '',
      category: 'restaurant',
      cuisine: '',
      description: '',
      location: { 
        address: '', 
        city: '', 
        region: 'Metro Manila',
        lat: 0, 
        lng: 0 
      },
      contact: { 
        phone: '', 
        website: '', 
        instagram: '' 
      },
      business_info: { 
        price_range: '₱₱', 
        features: [],
        hours: {},
        payment_methods: []
      },
      discovery: { 
        tags: [], 
        perfect_for: [], 
        unique_features: '' 
      },
      partnership: { 
        tier: 'standard', 
        monthly_fee: 3000, 
        active: true,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      images: {
        hero: '',
        gallery: []
      }
    });

    const [heroImage, setHeroImage] = useState<File | null>(null);
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<{
      hero: string;
      gallery: string[];
    }>({
      hero: formData.images?.hero || '',
      gallery: formData.images?.gallery || []
    });

    const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setHeroImage(file);
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(prev => ({
            ...prev,
            hero: e.target?.result as string
          }));
        };
        reader.readAsDataURL(file);
      }
    };

    const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        setGalleryImages(prev => [...prev, ...files]);
        
        // Create previews
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(prev => ({
              ...prev,
              gallery: [...prev.gallery, e.target?.result as string]
            }));
          };
          reader.readAsDataURL(file);
        });
      }
    };

    const removeGalleryImage = (index: number) => {
      setGalleryImages(prev => prev.filter((_, i) => i !== index));
      setImagePreview(prev => ({
        ...prev,
        gallery: prev.gallery.filter((_, i) => i !== index)
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        // Upload images first if they exist
        let finalImageData = { ...formData.images };
        
        if (heroImage) {
          const heroResult = await imageUploadService.uploadHeroImage(
            place?.id || 'temp-' + Date.now(),
            heroImage
          );
          if (heroResult.success) {
            finalImageData.hero = heroResult.url;
          }
        }
        
        if (galleryImages.length > 0) {
          const galleryResults = await imageUploadService.uploadGalleryImages(
            place?.id || 'temp-' + Date.now(),
            galleryImages
          );
          const galleryUrls = galleryResults.map(result => result.url).filter(Boolean);
          finalImageData.gallery = [...(finalImageData.gallery || []), ...galleryUrls];
        }

        await onSave({
          ...formData,
          images: finalImageData,
          metadata: {
            ...formData.metadata,
            updated_at: new Date().toISOString(),
            status: 'active'
          }
        });
      } catch (error) {
        console.error('Error saving place:', error);
      }
    };

    const updateField = (path: string, value: any) => {
      setFormData(prev => {
        const newData = { ...prev };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {place ? 'Edit Place' : 'Add New Place'}
              </h2>
              <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Place Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category || 'restaurant'}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Discovery Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Write an exciting 75-word description that makes people want to discover this place..."
                  required
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Images</h3>
                
                {/* Hero Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">Hero Image</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageChange}
                      className="hidden"
                      ref={heroImageRef}
                    />
                    <button
                      type="button"
                      onClick={() => heroImageRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {heroImage ? 'Change Hero Image' : 'Upload Hero Image'}
                    </button>
                    {imagePreview.hero && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border">
                        <img 
                          src={imagePreview.hero} 
                          alt="Hero preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Images */}
                <div>
                  <label className="block text-sm font-medium mb-2">Gallery Images</label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImagesChange}
                      className="hidden"
                      ref={galleryImagesRef}
                    />
                    <button
                      type="button"
                      onClick={() => galleryImagesRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Add Gallery Images
                    </button>
                    
                    {/* Gallery Preview */}
                    {imagePreview.gallery.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {imagePreview.gallery.map((url, index) => (
                          <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                            <img 
                              src={url} 
                              alt={`Gallery ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.location?.address || ''}
                    onChange={(e) => updateField('location.address', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={formData.location?.city || ''}
                    onChange={(e) => updateField('location.city', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="text"
                    value={formData.contact?.phone || ''}
                    onChange={(e) => updateField('contact.phone', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.contact?.website || ''}
                    onChange={(e) => updateField('contact.website', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Instagram</label>
                  <input
                    type="text"
                    value={formData.contact?.instagram || ''}
                    onChange={(e) => updateField('contact.instagram', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="@username"
                  />
                </div>
              </div>

              {/* Discovery Features */}
              <div>
                <label className="block text-sm font-medium mb-2">Unique Features</label>
                <input
                  type="text"
                  value={formData.discovery?.unique_features || ''}
                  onChange={(e) => updateField('discovery.unique_features', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="What makes this place special?"
                />
              </div>

              {/* Partnership */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Partnership Tier</label>
                  <select
                    value={formData.partnership?.tier || 'standard'}
                    onChange={(e) => updateField('partnership.tier', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="standard">Standard (₱3,000)</option>
                    <option value="premium">Premium (₱6,000)</option>
                    <option value="priority">Priority (₱10,000)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Fee (₱)</label>
                  <input
                    type="number"
                    value={formData.partnership?.monthly_fee || 3000}
                    onChange={(e) => updateField('partnership.monthly_fee', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  disabled={uploadingImages}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {uploadingImages ? 'Uploading...' : 'Save Place'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const handleSavePlace = async (placeData: any) => {
    try {
      setLoading(true);
      setUploadingImages(true);
      
      if (editingPlace) {
        // Update existing place
        await updatePlace(editingPlace.id, placeData as UpdateFeaturedPlaceRequest);
        console.log('Place updated successfully');
      } else {
        // Add new place
        const placeId = await createPlace(placeData as CreateFeaturedPlaceRequest);
        console.log('Place created successfully with ID:', placeId);
      }
      
      // Reload places to get updated data
      await loadPlaces();
      
      setShowAddForm(false);
      setEditingPlace(null);
    } catch (error) {
      console.error('Error saving place:', error);
      alert('Failed to save place. Please try again.');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const handleDeletePlace = async (placeId: string) => {
    if (confirm('Are you sure you want to delete this place? This action cannot be undone.')) {
      try {
        setLoading(true);
        await deletePlace(placeId);
        console.log('Place deleted successfully');
        
        // Reload places to get updated data
        await loadPlaces();
      } catch (error) {
        console.error('Error deleting place:', error);
        alert('Failed to delete place. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleArchivePlace = async (placeId: string) => {
    if (confirm('Are you sure you want to archive this place? It will no longer be visible to users.')) {
      try {
        setLoading(true);
        await archivePlace(placeId);
        console.log('Place archived successfully');
        
        // Reload places to get updated data
        await loadPlaces();
      } catch (error) {
        console.error('Error archiving place:', error);
        alert('Failed to archive place. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Featured Places</h1>
              <p className="text-gray-600">Manage your discovery app's partner locations</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Place
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search places..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 w-full md:w-80"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <div key={place.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Place Header */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{place.name}</h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{place.location.city}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingPlace(place)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleArchivePlace(place.id)}
                      className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                      title="Archive place"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlace(place.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    place.category === 'restaurant' ? 'bg-green-100 text-green-800' :
                    place.category === 'activity' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {place.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    place.partnership.tier === 'standard' ? 'bg-gray-100 text-gray-800' :
                    place.partnership.tier === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {place.partnership.tier}
                  </span>
                </div>

                {/* Hero Image Preview */}
                {place.images?.hero && (
                  <div className="mb-4">
                    <img 
                      src={place.images.hero} 
                      alt={place.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{place.description}</p>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {place.contact.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {place.contact.phone}
                    </div>
                  )}
                  {place.contact.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="w-4 h-4 mr-2" />
                      <a href={place.contact.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Analytics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{place.analytics.impressions}</div>
                    <div className="text-xs text-gray-500">Impressions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{place.analytics.swipe_right}</div>
                    <div className="text-xs text-gray-500">Swipe Right</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {place.analytics.impressions > 0 
                        ? Math.round((place.analytics.swipe_right / place.analytics.impressions) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>
                </div>

                {/* Partnership Info */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Monthly Fee:</span>
                    <span className="font-semibold">₱{place.partnership.monthly_fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      place.partnership.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {place.partnership.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPlaces.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first featured place'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Place
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingPlace) && (
        <PlaceForm
          place={editingPlace}
          onSave={handleSavePlace}
          onCancel={() => {
            setShowAddForm(false);
            setEditingPlace(null);
          }}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
