import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Save, AlertCircle, Camera, Crop } from 'lucide-react';
import api from '../../services/api';

const EditClubModal = ({ isOpen, onClose, club, onClubUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    requirements: '',
    contactEmail: '',
    maxMembers: '',
    isActive: true
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const fileInputRef = useRef(null);

  // Categories for club selection - matching AddClubModal
  const categories = [
    'Basketball',
    'Football',
    'Tennis',
    'Cricket',
    'Badminton',
    'Table Tennis',
    'Volleyball',
    'Swimming',
    'Athletics',
    'Fitness',
    'Martial Arts',
    'Other'
  ];

  useEffect(() => {
    if (club && isOpen) {
      setFormData({
        name: club.name || '',
        category: club.category || '',
        description: club.description || '',
        requirements: club.requirements || '',
        contactEmail: club.contactEmail || '',
        maxMembers: club.maxMembers || '',
        isActive: club.isActive !== undefined ? club.isActive : true
      });
      
      if (club.image) {
        setImagePreview(`http://localhost:5000${club.image}`);
      } else {
        setImagePreview('');
      }
      
      setImageFile(null);
      setErrors({});
    }
  }, [club, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous error
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  // No longer needed since we're uploading original images
  // const resizeImage = (file, maxWidth, maxHeight) => {
  //   return new Promise((resolve) => {
  //     // Just return the original file without resizing
  //     resolve(file);
  //   });
  // };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Club name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    
    if (formData.maxMembers && (isNaN(formData.maxMembers) || formData.maxMembers < 1)) {
      newErrors.maxMembers = 'Max members must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== EditClubModal Submit Debug ===');
    console.log('Club ID:', club._id);
    console.log('Form Data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        // Always send all fields, including empty ones for optional fields
        submitData.append(key, formData[key]);
        console.log(`Adding to FormData: ${key} = ${formData[key]}`);
      });
      
      // Add original image if selected (no resizing)
      if (imageFile) {
        console.log('Adding original image file to FormData');
        submitData.append('image', imageFile);
      }
      
      console.log('Making API call to:', `/clubs/${club._id}`);
      const response = await api.put(`/clubs/${club._id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('API Response:', response.data);
      
      // Backend returns { message, club }, so we need to pass the club object
      if (response.data.club) {
        console.log('Calling onClubUpdated with:', response.data.club);
        onClubUpdated(response.data.club);
      } else {
        console.log('No club object in response, using full response data');
        onClubUpdated(response.data);
      }
      onClose();
      
    } catch (error) {
      console.error('Error updating club:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to update club' });
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Club</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle size={20} className="text-red-600 mr-3" />
              <span className="text-red-700">{errors.submit}</span>
            </div>
          )}

          {/* Club Logo Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Club Logo
            </label>
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Club logo preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ImageIcon size={32} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Camera size={16} className="mr-2" />
                    {imagePreview ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="ml-2 text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Max size: 5MB. Recommended: Square format for best appearance
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {errors.image && (
              <p className="text-red-600 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          {/* Club Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Club Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter club name"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-600 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your club's purpose and activities"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Membership Requirements
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="List any specific requirements for joining this club (optional)"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.contactEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="club@example.com"
            />
            {errors.contactEmail && (
              <p className="text-red-600 text-sm mt-1">{errors.contactEmail}</p>
            )}
          </div>

          {/* Max Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Members
            </label>
            <input
              type="number"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleInputChange}
              min="1"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.maxMembers ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Leave empty for unlimited"
            />
            {errors.maxMembers && (
              <p className="text-red-600 text-sm mt-1">{errors.maxMembers}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Club is active and accepting new members
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Update Club
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClubModal;
