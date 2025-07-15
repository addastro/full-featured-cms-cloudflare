import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Bot, Eye } from 'lucide-react';
import { apiClient } from '../services/api';

interface ContentData {
  title: string;
  content: string;
  status: 'draft' | 'published';
  author: string;
}

export const ContentEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<ContentData>({
    title: '',
    content: '',
    status: 'draft',
    author: 'Admin'
  });

  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      // For now, using mock data - will connect to API
      setFormData({
        title: 'Sample Content',
        content: 'This is sample content for editing...',
        status: 'draft',
        author: 'Admin'
      });
    }
  }, [isEditing, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Here we'll integrate with the API
      console.log('Saving content:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/content');
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.title) {
      alert('Please enter a title first');
      return;
    }

    try {
      const prompt = `Write detailed content about: ${formData.title}`;
      const aiResponse = await apiClient.generateContent(prompt);
      
      setFormData(prev => ({
        ...prev,
        content: prev.content + (prev.content ? '\n\n' : '') + (aiResponse.content || aiResponse.response || 'AI content generated successfully!')
      }));
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('AI generation failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/content')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Content' : 'New Content'}
            </h1>
            <p className="text-gray-600 mt-1">Create and manage your content</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{preview ? 'Edit' : 'Preview'}</span>
          </button>
          <button
            type="button"
            onClick={handleAIGenerate}
            className="btn-secondary flex items-center space-x-2"
            disabled={!formData.title}
          >
            <Bot className="w-4 h-4" />
            <span>AI Generate</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="content-card">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter content title..."
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                {preview ? (
                  <div className="min-h-96 p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <h2 className="text-2xl font-bold mb-4">{formData.title || 'Preview Title'}</h2>
                    <div className="prose max-w-none whitespace-pre-wrap">
                      {formData.content || 'Preview content will appear here...'}
                    </div>
                  </div>
                ) : (
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full min-h-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="Write your content here..."
                    required
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Author name..."
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Content'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
