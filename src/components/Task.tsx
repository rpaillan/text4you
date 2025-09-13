import React, { useState, useRef, useEffect, useMemo } from 'react';

import { SingleTask } from '../types/index.js';
import './Task.scss';
import { NEW_CARD_DESCRIPTION } from './Board.js';
import clsx from 'clsx';
import { useKanbanActions, useKanbanStore } from '../store/kanbanStore.js';

interface CardProps {
  task: SingleTask;
  index: number;
}

export const Task: React.FC<CardProps> = ({ task }) => {
  const descriptionRef = useRef<HTMLDivElement>(null);
  const originalDescription = useRef<string>(task.description || '');

  const { updateTask, deleteTask } = useKanbanActions();
  const editingTask = useKanbanStore(state => state.editingTask);

  const handleSaveDescription = () => {
    if (!descriptionRef.current) return;

    // Convert HTML content to plain text with newlines
    const htmlContent = descriptionRef.current.innerHTML;

    if (htmlContent.trim() === '') {
      deleteTask(task.id);
      return;
    }

    if (htmlContent !== (task.description || '')) {
      updateTask(task.id, {
        description: htmlContent || undefined,
        bucket: task.bucket,
        editing: false,
      });
    }
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
    updateTask(task.id, {
      editing: false,
    });
  };

  const handleDescriptionKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 's' && e.ctrlKey) {
      e.preventDefault();
      handleSaveDescription();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelDescription();
    }
  };

  // Effect to update refs when card data changes
  useEffect(() => {
    originalDescription.current = task.description || '';
  }, [task.description]);

  useEffect(() => {
    if (task.editing && descriptionRef.current) {
      descriptionRef.current.focus();
      // Place cursor at end
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(descriptionRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [task.editing]);

  const descriptionKlass = useMemo(
    () =>
      clsx('card-description', {
        'empty-description': !task.description,
        editing: task.editing,
      }),
    [task.editing, task.description]
  );

  return (
    <>
      <div className='task'>
        <div className='task-header'>
          <div className='task-id'>
            {task.id.slice(0, 8)} - {task.order}
          </div>
        </div>
        <div className='task-content'>
          <div
            data-task-id={task.id}
            ref={descriptionRef}
            className={descriptionKlass}
            contentEditable={task.editing}
            suppressContentEditableWarning={true}
            onKeyDown={handleDescriptionKeyPress}
            onFocus={() => editingTask(task.id)}
            onClick={() => editingTask(task.id)}
            onBlur={handleSaveDescription}
            style={{ whiteSpace: 'pre-wrap' }}
            data-placeholder={NEW_CARD_DESCRIPTION}
            dangerouslySetInnerHTML={{
              __html: task.description
                ? task.description.replace(/\n/g, '<br>')
                : '',
            }}
          />
        </div>
      </div>
    </>
  );
};
