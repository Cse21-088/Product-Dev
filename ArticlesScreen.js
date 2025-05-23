import React, { useState, useEffect } from 'react';
import { FaNewspaper, FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { firestore } from '../../database/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-toastify';

const ArticlesScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    published: false
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const q = query(collection(firestore, 'articles'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const articlesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArticles(articlesList);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const articleData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        updatedAt: new Date(),
        ...(editingArticle ? {} : { createdAt: new Date() })
      };

      if (editingArticle) {
        await updateDoc(doc(firestore, 'articles', editingArticle.id), articleData);
        toast.success('Article updated successfully');
      } else {
        await addDoc(collection(firestore, 'articles'), articleData);
        toast.success('Article published successfully');
      }

      setShowModal(false);
      setEditingArticle(null);
      setFormData({
        title: '',
        content: '',
        category: '',
        tags: '',
        published: false
      });
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags.join(', '),
      published: article.published
    });
    setShowModal(true);
  };

  const handleDelete = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteDoc(doc(firestore, 'articles', articleId));
        toast.success('Article deleted successfully');
        fetchArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
        toast.error('Failed to delete article');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-indigo-500/20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Published Articles</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 p-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FaPlus /> New Article
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin text-indigo-400 text-4xl mx-auto" />
            <p className="text-gray-400 mt-2">Loading articles...</p>
          </div>
        ) : articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium">{article.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Published on {article.createdAt?.toDate().toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {article.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(article)}
                      className="p-2 hover:bg-indigo-500/20 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaNewspaper className="text-gray-700 text-4xl mx-auto" />
            <p className="text-gray-500 mt-2">No articles published yet</p>
          </div>
        )}
      </div>

      {/* Add/Edit Article Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingArticle ? 'Edit Article' : 'New Article'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white h-40"
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
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
                  placeholder="tech, business, innovation"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded border-indigo-500/20 text-indigo-500 focus:ring-indigo-500"
                />
                <label htmlFor="published" className="text-sm text-gray-300">
                  Publish immediately
                </label>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingArticle(null);
                    setFormData({
                      title: '',
                      content: '',
                      category: '',
                      tags: '',
                      published: false
                    });
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingArticle ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlesScreen; 