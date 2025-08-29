import React, { useState, useRef, useEffect } from 'react';

import { Card as CardType, Priority, CreateCardData } from '../types/index.js';
import './Card.scss';

interface CardProps {
  card: CardType;
  index: number;
  onUpdate: (_id: number, _cardData: Partial<CreateCardData>) => Promise<void>;
  onDelete: (_id: number) => Promise<void>;
  onEdit: (_card: CardType) => void;
}

const Card: React.FC<CardProps> = ({
  card,
  onUpdate,
  onDelete,
  onEdit: _onEdit,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const originalTitle = useRef<string>(card.title);
  const originalDescription = useRef<string>(card.description || '');

  const handleSaveTitle = async () => {
    const currentTitle = titleRef.current?.textContent?.trim() || '';
    if (currentTitle && currentTitle !== card.title) {
      await onUpdate(card.id, { title: currentTitle });
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    if (titleRef.current) {
      titleRef.current.textContent = originalTitle.current;
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = async () => {
    if (!descriptionRef.current) return;

    // Convert HTML content to plain text with newlines
    const htmlContent = descriptionRef.current.innerHTML;

    // Replace <br> tags with newlines and decode HTML entities
    const textWithNewlines = htmlContent
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    // Remove any remaining HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = textWithNewlines;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    const trimmedDescription = plainText.replace(/^\s+|\s+$/g, '');
    if (trimmedDescription !== (card.description || '')) {
      await onUpdate(card.id, { description: trimmedDescription || undefined });
    }
    setIsEditingDescription(false);
  };

  const handleCancelDescription = () => {
    if (descriptionRef.current) {
      // Restore original content with proper HTML formatting
      const originalText = originalDescription.current;
      if (originalText) {
        // Convert newlines back to <br> tags for display
        descriptionRef.current.innerHTML = originalText.replace(/\n/g, '<br>');
      } else {
        descriptionRef.current.textContent = '';
      }
    }
    setIsEditingDescription(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelTitle();
    }
  };

  const handleDescriptionKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSaveDescription();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelDescription();
    }
  };

  // Effect to update refs when card data changes
  useEffect(() => {
    originalTitle.current = card.title;
    originalDescription.current = card.description || '';
  }, [card.title, card.description]);

  // Effect to focus and select content when editing starts
  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(titleRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionRef.current) {
      // If the content is placeholder text, clear it
      if (
        descriptionRef.current.textContent === 'Click to add description...'
      ) {
        descriptionRef.current.innerHTML = '';
      }

      descriptionRef.current.focus();
      // Place cursor at end
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(descriptionRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditingDescription]);

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className='card'>
        <div className='card-header'>
          <div className='card-priority'>
            <span
              className='priority-dot'
              style={{ backgroundColor: getPriorityColor(card.priority) }}
            />
            {card.priority}
          </div>
          <div className='card-actions'>
            <button
              className='edit-btn'
              onClick={e => {
                e.stopPropagation();
                _onEdit(card);
              }}
            >
              ✏️
            </button>
            <button
              className='delete-btn'
              onClick={e => {
                e.stopPropagation();
                onDelete(card.id);
              }}
            >
              🗑️
            </button>
          </div>
        </div>

        <div className='card-content'>
          {/* Title Section */}
          <div className='card-title-section'>
            <div
              className={`title-container ${isEditingTitle ? 'editing' : ''}`}
            >
              <h4
                ref={titleRef}
                className='card-title'
                contentEditable={isEditingTitle}
                suppressContentEditableWarning={true}
                onKeyDown={handleTitleKeyPress}
                onBlur={handleSaveTitle}
                onClick={() => !isEditingTitle && setIsEditingTitle(true)}
                title={
                  isEditingTitle
                    ? 'Enter to save, Esc to cancel'
                    : 'Click to edit'
                }
              >
                {card.title}
              </h4>
              {isEditingTitle && (
                <div className='inline-edit-actions'>
                  <button
                    className='save-btn'
                    onClick={handleSaveTitle}
                    title='Save (Enter)'
                  >
                    ✓
                  </button>
                  <button
                    className='cancel-btn'
                    onClick={handleCancelTitle}
                    title='Cancel (Esc)'
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className='card-description-section'>
            <div
              className={`description-container ${isEditingDescription ? 'editing' : ''}`}
            >
              <div
                ref={descriptionRef}
                className={`card-description ${!card.description ? 'empty-description' : ''}`}
                contentEditable={isEditingDescription}
                suppressContentEditableWarning={true}
                onKeyDown={handleDescriptionKeyPress}
                onBlur={handleSaveDescription}
                onClick={() =>
                  !isEditingDescription && setIsEditingDescription(true)
                }
                title={
                  isEditingDescription
                    ? 'Ctrl+Enter to save, Esc to cancel'
                    : 'Click to edit'
                }
                style={{ whiteSpace: 'pre-wrap' }}
                data-placeholder='Click to add description...'
                dangerouslySetInnerHTML={{
                  __html: card.description
                    ? card.description.replace(/\n/g, '<br>')
                    : !isEditingDescription
                      ? 'Click to add description...'
                      : '',
                }}
              />

              {isEditingDescription && (
                <div className='inline-edit-actions'>
                  <button
                    className='save-btn'
                    onClick={handleSaveDescription}
                    title='Save (Ctrl+Enter)'
                  >
                    ✓
                  </button>
                  <button
                    className='cancel-btn'
                    onClick={handleCancelDescription}
                    title='Cancel (Esc)'
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className='card-footer'>
            <span className='card-date'>
              Created: {formatDate(card.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Remove the local EditCardModal component */}
    </>
  );
};

export default Card;
