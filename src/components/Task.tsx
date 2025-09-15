import React, { useState, useRef, useEffect, useMemo } from 'react';

import { SingleTask } from '../types/index.js';
import './Task.scss';
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

  /*  const showDebugDivBasedOnRect = (rect: DOMRect, color: string) => {
    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'fixed';
    debugDiv.style.left = `${rect.left}px`;
    debugDiv.style.top = `${rect.top}px`;
    debugDiv.style.width = `${rect.width}px`;
    debugDiv.style.height = `${rect.height}px`;
    debugDiv.style.borderTop = `2px solid ${color}`;
    debugDiv.style.borderBottom = `2px solid ${color}`;
    debugDiv.style.zIndex = '9999';
    debugDiv.style.pointerEvents = 'none';
    debugDiv.className = 'debug-rect-overlay';
    document.body.appendChild(debugDiv);
    setTimeout(() => {
      if (debugDiv.parentNode) {
        debugDiv.parentNode.removeChild(debugDiv);
      }
    }, 1000);
  }; */

  const handleDescriptionKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 's' && e.ctrlKey) {
      e.preventDefault();
      handleSaveDescription();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelDescription();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const element = descriptionRef.current;
      if (!element) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const commonLineHeight = 15;

      const getCursoPosition = (testRange: Range) => {
        const startContainer = testRange.startContainer;

        let rect = testRange.getBoundingClientRect();

        if (startContainer instanceof Text) {
          const range = document.createRange();
          range.setStart(startContainer, testRange.startOffset);
          range.setEnd(startContainer, testRange.endOffset);

          // Get position directly
          rect = range.getBoundingClientRect();
        } else {
          rect = (startContainer as Element).getBoundingClientRect();
        }

        if (rect.width === 0) {
          rect.width = 20;
        }

        return rect;
      };

      const isAtLastLine = () => {
        // Get the actual cursor position using a different approach
        const selection = window.getSelection();
        if (!selection || !selection.focusNode) return false;
        const testRange = selection.getRangeAt(0);
        if (testRange.startContainer === element) return false;
        const rect = getCursoPosition(testRange);
        const elementRect = element.getBoundingClientRect();
        //showDebugDivBasedOnRect(elementRect, 'green');
        //showDebugDivBasedOnRect(rect, 'red');
        return rect.top + commonLineHeight >= elementRect.bottom - 5;
      };

      const isAtFirstLine = () => {
        // Get the actual cursor position using a different approach
        const selection = window.getSelection();
        if (!selection || !selection.focusNode) return false;
        const testRange = selection.getRangeAt(0);
        if (testRange.startContainer === element) return false;
        const rect = getCursoPosition(testRange);
        const elementRect = element.getBoundingClientRect();
        //showDebugDivBasedOnRect(elementRect, 'green');
        //showDebugDivBasedOnRect(rect, 'red');
        return rect.top <= elementRect.top + commonLineHeight; // Within 5px of top
      };

      // Check if we're at the boundaries where navigation should occur
      const shouldNavigateDown = e.key === 'ArrowDown' && isAtLastLine();
      const shouldNavigateUp = e.key === 'ArrowUp' && isAtFirstLine();

      if (shouldNavigateDown || shouldNavigateUp) {
        e.preventDefault();

        // Find all task elements in the page
        const bucketElement = element.closest('.bucket-list');
        const allTasks = bucketElement?.querySelectorAll(
          '.task-description-input'
        );
        if (!allTasks) return;

        const currentIndex = Array.from(allTasks).indexOf(element);
        let nextIndex = -1;

        if (e.key === 'ArrowDown' && currentIndex < allTasks.length - 1) {
          nextIndex = currentIndex + 1;
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          nextIndex = currentIndex - 1;
        }

        if (nextIndex >= 0) {
          const nextTask = allTasks[nextIndex] as HTMLElement;
          const nextTaskId = nextTask.getAttribute('data-task-id');

          if (nextTaskId) {
            // Focus and position cursor, focus will set editing stateß
            nextTask.focus();

            // Position cursor at beginning (ArrowUp) or end (ArrowDown)
            setTimeout(() => {
              const newRange = document.createRange();
              const newSelection = window.getSelection();

              if (e.key === 'ArrowDown') {
                // Place cursor at beginning of next task
                newRange.setStart(nextTask, 0);
                newRange.collapse(true);
              } else {
                // Place cursor at end of previous task
                newRange.selectNodeContents(nextTask);
                newRange.collapse(false);
              }

              newSelection?.removeAllRanges();
              newSelection?.addRange(newRange);
            }, 0);
          }
        }
      }
    }
  };

  // Effect to update refs when card data changes
  useEffect(() => {
    originalDescription.current = task.description || '';
  }, [task.description]);

  useEffect(() => {
    if (task.editing && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [task.editing]);

  const descriptionKlass = useMemo(
    () =>
      clsx('task-description-input', {
        'empty-description': !task.description,
        editing: task.editing,
      }),
    [task.editing, task.description]
  );

  return (
    <>
      <div
        className={clsx('task', `state-${task.state}`, {
          editing: task.editing,
        })}
      >
        <div className='task-header'>
          <div className='task-id'>{task.id.slice(0, 8)}</div>
          <div className='task-options'>
            <span className='task-state-icon'>•</span>
          </div>
        </div>
        <div className='task-content'>
          <div
            tabIndex={0}
            data-task-id={task.id}
            ref={descriptionRef}
            className={descriptionKlass}
            contentEditable={task.editing}
            suppressContentEditableWarning={true}
            onKeyDown={handleDescriptionKeyPress}
            onFocus={() => editingTask(task.id)}
            onClick={() => editingTask(task.id)}
            onBlur={handleSaveDescription}
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
