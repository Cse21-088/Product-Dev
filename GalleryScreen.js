import React, { useState, useEffect } from 'react';
import { FaImages, FaPlus, FaTrash, FaSpinner, FaSearch } from 'react-icons/fa';
import { firestore, storage } from '../../database/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { toast } from 'react-toastify';

const GalleryScreen = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const q = query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const imagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setImages(imagesList);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      setFormData({ ...formData, image: file });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.image || !formData.title || !formData.description || !formData.category) {
      toast.error('All fields are required including image');
      return;
    }
  
    setUploading(true);
    try {
      const storageRef = ref(storage, `gallery/${Date.now()}_${formData.image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, formData.image);
  
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          throw error;
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(firestore, 'gallery'), {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            imageUrl: downloadURL,
            createdAt: new Date(),
          });
          toast.success('Image uploaded successfully');
          setShowUploadModal(false);
          setFormData({ title: '', description: '', category: '', image: null });
          setUploadProgress(0);
          fetchImages();
        }
      );
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        // Delete from Storage
        const imageRef = ref(storage, image.imageUrl);
        await deleteObject(imageRef);

        // Delete from Firestore
        await deleteDoc(doc(firestore, 'gallery', image.id));
        
        toast.success('Image deleted successfully');
        fetchImages();
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('Failed to delete image');
      }
    }
  };

  const filteredImages = images.filter(image =>
    image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-indigo-500/20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Gallery Management</h2>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 pl-10 text-white w-64"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 p-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <FaPlus /> Upload Image
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin text-indigo-400 text-4xl mx-auto" />
            <p className="text-gray-400 mt-2">Loading gallery...</p>
          </div>
        ) : filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800/70 transition-colors"
              >
                <div className="relative aspect-video">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                  <button
                    onClick={() => handleDelete(image)}
                    className="absolute top-2 right-2 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium">{image.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{image.description}</p>
                  <span className="inline-block bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded-full mt-2">
                    {image.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaImages className="text-gray-700 text-4xl mx-auto" />
            <p className="text-gray-500 mt-2">No images found</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Upload New Image</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white h-32"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              {uploading && (
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setFormData({
                      title: '',
                      description: '',
                      category: '',
                      image: null
                    });
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full p-4">
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              className="w-full h-auto rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryScreen;