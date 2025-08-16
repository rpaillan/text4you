import React, { useState, useEffect } from 'react';
import './Modal.scss';

const EditCardModal = ({ card, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: ''
  });

  useEffect(() => {
    setFormData({
      title: card.title || '',
      description: card.description || '',
      status: card.status || 'idea',
      priority: card.priority || 'medium'
    });
  }, [card]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Card</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter card title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter card description"
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="idea">Idea</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Update Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCardModal;
