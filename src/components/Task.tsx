import React, { useState, useRef, useEffect, useMemo } from 'react';

import {
  Card as CardType,
  Priority,
  CreateCardData,
  CardStatus,
  Column,
} from '../types/index.js';
import './Task.scss';
import { NEW_CARD_TITLE, NEW_CARD_DESCRIPTION } from './KanbanBoard.js';
import clsx from 'clsx';

interface CardProps {
  columns: Column[];
  card: CardType;
  index: number;
  onUpdate: (_id: number, _cardData: Partial<CreateCardData>) => Promise<void>;
  onDelete: (_id: number) => Promise<void>;
}

const Task: React.FC<CardProps> = ({ columns, card, onUpdate, onDelete }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const originalTitle = useRef<string>(card.title);
  const originalDescription = useRef<string>(card.description || '');
  const confirmationDialogRef = useRef<HTMLDivElement>(null);

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
    // lets try to store html content instead of plain text.

    if (!descriptionRef.current) return;

    // Convert HTML content to plain text with newlines
    const htmlContent = descriptionRef.current.innerHTML;

    if (htmlContent !== (card.description || '')) {
      await onUpdate(card.id, { description: htmlContent || undefined });
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
      if (card.title === NEW_CARD_TITLE) {
        titleRef.current.innerHTML = '';
      }

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
      if (descriptionRef.current.textContent === NEW_CARD_DESCRIPTION) {
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

  // Focus the confirmation dialog when it opens
  useEffect(() => {
    if (showDeleteConfirmation && confirmationDialogRef.current) {
      confirmationDialogRef.current.focus();
    }
  }, [showDeleteConfirmation]);

  // Handle clicking outside the status dropdown
  useEffect(() => {
    if (showStatusDropdown) {
      const handleDocumentClick = () => {
        setShowStatusDropdown(false);
      };

      document.addEventListener('click', handleDocumentClick);
      return () => {
        document.removeEventListener('click', handleDocumentClick);
      };
    }
  }, [showStatusDropdown]);

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
    // Calculate "time since" using native JS primitives
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();

    let sinceInWords = '';
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));

    if (years > 0) {
      sinceInWords = `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (months > 0) {
      sinceInWords = `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
      sinceInWords = `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      sinceInWords = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      sinceInWords = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      sinceInWords = 'just now';
    }

    return new Date(dateString).toLocaleDateString() + ' (' + sinceInWords + ')';
  };

  const handleDeleteClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (card.id === -1) {
      // if it's a temporary card, let remove without confirmation
      onDelete(card.id);
      return;
    }
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = (): void => {
    onDelete(card.id);
    setShowDeleteConfirmation(false);
  };

  const handleCancelDelete = (): void => {
    setShowDeleteConfirmation(false);
  };

  const handleConfirmationKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      handleCancelDelete();
    } else if (e.key === 'Enter') {
      handleConfirmDelete();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget) {
      handleCancelDelete();
    }
  };

  const handleStatusDropdownClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowStatusDropdown(!showStatusDropdown);
  };

  const handleStatusChange = async (newStatus: CardStatus): Promise<void> => {
    if (newStatus !== card.status) {
      await onUpdate(card.id, { status: newStatus });
    }
    setShowStatusDropdown(false);
  };

  const descriptionKlass = useMemo(() => clsx('card-description', {
    'empty-description': !card.description,
    'editing': isEditingDescription,
  }), [isEditingDescription, card.description]);

  const titleKlass = useMemo(() => clsx('card-title', {
    'empty-title': !card.title,
    'editing': isEditingTitle,
  }), [isEditingTitle, card.title]);

  return (
    <>
      <div className='task'>
        <div className='task-header'>
          <div className='task-id'>{card.id}</div>
          <div className='card-actions'>
            <div className='status-dropdown-container'>
              <button
                className='status-btn'
                onClick={handleStatusDropdownClick}
                title='Move to different status'
              >
                📋
              </button>
              {showStatusDropdown && (
                <div className='status-dropdown'>
                  {columns.map(column => (
                    <div
                      key={column.id}
                      className={`status-option ${card.status === column.id ? 'current' : ''}`}
                      onClick={() => handleStatusChange(column.id)}
                    >
                      {column.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className='delete-btn' onClick={handleDeleteClick}>
              🗑️
            </button>
          </div>
          {/* <div className='task-priority'>{card.priority}</div>
         <div className='task-status'>{card.status}</div>
         <div className='task-created-at'>{formatDate(card.created_at)}</div>
         <div className='task-updated-at'>{formatDate(card.updated_at)}</div> */}
        </div>
        <div className='task-content'>

          <div
            ref={titleRef}
            className={titleKlass}
            contentEditable={isEditingTitle}
            suppressContentEditableWarning={true}
            onKeyDown={handleTitleKeyPress}
            onBlur={handleSaveTitle}
            onClick={() => !isEditingTitle && setIsEditingTitle(true)}
            data-placeholder={NEW_CARD_TITLE}
            title={
              isEditingTitle
                ? 'Enter to save, Esc to cancel'
                : 'Click to edit'
            }
          >
            {card.title
              ? card.title
              : !isEditingTitle
                ? NEW_CARD_TITLE
                : ''}
          </div>



          <div
            ref={descriptionRef}
            className={descriptionKlass}
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
            data-placeholder={NEW_CARD_DESCRIPTION}
            dangerouslySetInnerHTML={{
              __html: card.description
                ? card.description.replace(/\n/g, '<br>')
                : !isEditingDescription
                  ? NEW_CARD_DESCRIPTION
                  : '',
            }}
          />
        </div>
      </div>




      {/* Delete Confirmation Dialog */}
      {
        showDeleteConfirmation && (
          <div
            className='delete-confirmation-overlay'
            onClick={handleOverlayClick}
          >
            <div
              className='delete-confirmation-dialog'
              onKeyDown={handleConfirmationKeyPress}
              tabIndex={-1}
              ref={confirmationDialogRef}
            >
              <div className='confirmation-header'>
                <h3>Confirm Delete</h3>
              </div>
              <div className='confirmation-content'>
                <p>
                  Are you sure you want to delete <strong>"{card.title}"</strong>?
                </p>
                <p>This action cannot be undone.</p>
              </div>
              <div className='confirmation-actions'>
                <button className='cancel-btn' onClick={handleCancelDelete}>
                  Cancel
                </button>
                <button
                  className='confirm-delete-btn'
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};

export default Task;
