import React, { useState, useRef, useEffect, useMemo } from 'react';

import { SingleTask } from '../types/index.js';
import './Task.scss';
import { NEW_CARD_DESCRIPTION } from './Board.js';
import clsx from 'clsx';
import { useBuckets, useKanbanActions } from '../store/kanbanStore.js';

interface CardProps {
  card: SingleTask;
  index: number;
}

export const Task: React.FC<CardProps> = ({ card }) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const descriptionRef = useRef<HTMLDivElement>(null);
  const originalDescription = useRef<string>(card.description || '');
  const confirmationDialogRef = useRef<HTMLDivElement>(null);

  const buckets: string[] = useBuckets();
  const { updateCard, deleteCard } = useKanbanActions();

  const handleSaveDescription = () => {
    // lets try to store html content instead of plain text.

    if (!descriptionRef.current) return;

    // Convert HTML content to plain text with newlines
    const htmlContent = descriptionRef.current.innerHTML;

    if (htmlContent !== (card.description || '')) {
      updateCard(card.id, {
        description: htmlContent || undefined,
        bucket: card.bucket,
      });
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
    originalDescription.current = card.description || '';
  }, [card.description]);

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

  const handleDeleteClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (card.id === -1) {
      // if it's a temporary card, let remove without confirmation
      deleteCard(card.id);
      return;
    }
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = (): void => {
    deleteCard(card.id);
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

  const handleStatusChange = (newBucket: string): void => {
    if (newBucket !== card.bucket) {
      updateCard(card.id, { bucket: newBucket });
    }
    setShowStatusDropdown(false);
  };

  const descriptionKlass = useMemo(
    () =>
      clsx('card-description', {
        'empty-description': !card.description,
        editing: isEditingDescription,
      }),
    [isEditingDescription, card.description]
  );

  return (
    <>
      <div className='task'>
        <div className='task-header'>
          <div className='task-id'>{card.id}</div>
          <div className='card-actions' style={{ display: 'none' }}>
            <div className='status-dropdown-container'>
              <div
                className='status-btn'
                onClick={handleStatusDropdownClick}
                title='Move to different status'
              >
                status
              </div>
              {showStatusDropdown && (
                <div className='status-dropdown'>
                  {buckets.map(bucket => (
                    <div
                      key={bucket}
                      className={`status-option ${card.bucket === bucket ? 'current' : ''}`}
                      onClick={() => handleStatusChange(bucket)}
                    >
                      {bucket}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className='delete-btn' onClick={handleDeleteClick}>
              del
            </div>
          </div>
          {/* <div className='task-priority'>{card.priority}</div>
         <div className='task-status'>{card.status}</div>
         <div className='task-created-at'>{formatDate(card.created_at)}</div>
         <div className='task-updated-at'>{formatDate(card.updated_at)}</div> */}
        </div>
        <div className='task-content'>
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
      {showDeleteConfirmation && (
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
                Are you sure you want to delete task{' '}
                <strong>"{card.id}"</strong>?
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
      )}
    </>
  );
};
