// Channel Form Component for YouTube Clone
// Form for creating and editing channel information
// Includes validation, image upload preview, and responsive design

import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle,
  Image as ImageIcon,
  Loader,
  Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { createSlug } from '../utils/helpers';

/**
 * ChannelForm Component
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onCancel - Cancel/close handler
 * @param {boolean} props.sidebarOpen - Sidebar state for responsive layout
 * @param {Object} props.initialData - Initial form data for editing
 * @param {boolean} props.isEditing - Whether form is in edit mode
 */
const ChannelForm = ({ 
  onSubmit, 
  onCancel, 
  sidebarOpen,
  initialData = null,
  isEditing = false 
}) => {
  // Authentication context
  const { user } = useAuth();

  // Component state
  const [formData, setFormData] = useState({
    name: initialData?.channelName || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Technology',
    tags: initialData?.tags || [],
    website: initialData?.website || '',
    location: initialData?.location || '',
    contactEmail: initialData?.contactEmail || user?.email || ''
  });

  const [bannerImage, setBannerImage] = useState(initialData?.channelBanner || null);
  const [avatarImage, setAvatarImage] = useState(initialData?.avatar || user?.avatar || null);
  const [bannerPreview, setBannerPreview] = useState(initialData?.channelBanner || null);
  const [avatarPreview, setAvatarPreview] = useState(initialData?.avatar || user?.avatar || null);
  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Refs
  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // Channel categories
  const categories = [
    'Technology', 'Education', 'Entertainment', 'Gaming', 'Music', 
    'Sports', 'News', 'Comedy', 'Film & Animation', 'Autos & Vehicles',
    'Pets & Animals', 'Travel & Events', 'Howto & Style', 'Science & Technology',
    'Nonprofits & Activism', 'People & Blogs'
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (file, type) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setValidationErrors(prev => ({
        ...prev,
        [type]: 'Please select a valid image file'
      }));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors(prev => ({
        ...prev,
        [type]: 'Image size must be less than 5MB'
      }));
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    if (type === 'banner') {
      setBannerImage(file);
      setBannerPreview(previewUrl);
    } else if (type === 'avatar') {
      setAvatarImage(file);
      setAvatarPreview(previewUrl);
    }

    // Clear any previous error
    setValidationErrors(prev => ({
      ...prev,
      [type]: null
    }));
  };

  // Handle tag addition
  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle tag input key press
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Channel name validation
    if (!formData.name.trim()) {
      errors.name = 'Channel name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Channel name must be at least 3 characters long';
    } else if (formData.name.length > 50) {
      errors.name = 'Channel name must be less than 50 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Channel description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    } else if (formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    // Website validation (if provided)
    if (formData.website && !isValidUrl(formData.website)) {
      errors.website = 'Please enter a valid website URL';
    }

    // Contact email validation
    if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to validate URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Helper function to validate email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Prepare channel data
      const channelData = {
        ...formData,
        slug: createSlug(formData.name),
        bannerImage,
        avatarImage,
        owner: user.userId,
        createdAt: isEditing ? initialData.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (onSubmit) {
        await onSubmit(channelData);
      }

      setShowSuccess(true);
      
      // Close form after short delay
      setTimeout(() => {
        onCancel();
      }, 1500);

    } catch (error) {
      console.error('Channel creation/update failed:', error);
      setValidationErrors({
        submit: error.message || 'Failed to save channel. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'ml-0'} p-8 max-w-2xl mx-auto`}>
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Channel Updated!' : 'Channel Created!'}
          </h2>
          <p className="text-gray-600">
            {isEditing 
              ? 'Your channel has been updated successfully.' 
              : 'Your channel has been created successfully.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'ml-0'} p-4 max-w-4xl mx-auto`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Form Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Channel' : 'Create Your Channel'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {isEditing 
              ? 'Update your channel information and branding.' 
              : 'Set up your channel to start sharing videos with the world.'
            }
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Global Error */}
          {validationErrors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{validationErrors.submit}</p>
            </div>
          )}

          {/* Channel Images Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Channel Branding</h3>
            
            {/* Banner Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel Banner
              </label>
              <div className="relative">
                <div 
                  className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Channel banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload banner image</p>
                      <p className="text-xs text-gray-500">Recommended: 2560 x 1440 pixels</p>
                    </div>
                  )}
                </div>
                
                {bannerPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setBannerImage(null);
                      setBannerPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
                  className="hidden"
                />
              </div>
              {validationErrors.banner && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.banner}</p>
              )}
            </div>

            {/* Avatar Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel Avatar
              </label>
              <div className="flex items-center space-x-4">
                <div 
                  className="relative w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Channel avatar preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Camera className="h-6 w-6 text-gray-400" />
                  )}
                  
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarImage(null);
                        setAvatarPreview(null);
                      }}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Upload a channel avatar</p>
                  <p className="text-xs text-gray-500">Recommended: 800 x 800 pixels</p>
                </div>
                
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'avatar')}
                  className="hidden"
                />
              </div>
              {validationErrors.avatar && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.avatar}</p>
              )}
            </div>
          </div>

          {/* Channel Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Channel Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your channel name"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  validationErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.name.length}/50 characters
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., United States"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourwebsite.com"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  validationErrors.website ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.website && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.website}</p>
              )}
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="contact@yourdomain.com"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  validationErrors.contactEmail ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.contactEmail && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.contactEmail}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channel Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Tell viewers about your channel. What will they find on your channel? Why should they subscribe?"
              rows="4"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                validationErrors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add a tag and press Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || formData.tags.length >= 10}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
              
              {/* Tag List */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Tags help people discover your channel. Maximum 10 tags.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                isEditing ? 'Update Channel' : 'Create Channel'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChannelForm;