import React, { useRef, useEffect, useMemo } from 'react';

import { Task } from '../types/index.js';
import './Task.scss';
import clsx from 'clsx';
import { useKanbanStore } from '../store/kanbanStore.js';

interface CardProps {
  task: Task;
  index: number;
  isObfuscated?: boolean;
}

export const TaskView: React.FC<CardProps> = ({
  task,
  isObfuscated = false,
}) => {
  const descriptionRef = useRef<HTMLDivElement>(null);
  const originalDescription = useRef<string>(task.description || '');

  const editingTask = useKanbanStore(state => state.editingTask);
  const updateTask = useKanbanStore(state => state.updateTask);
  const deleteTask = useKanbanStore(state => state.deleteTask);
  const addTaskAfter = useKanbanStore(state => state.addTaskAfter);

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
    if (e.key === 's' && e.metaKey) {
      e.preventDefault();
      handleSaveDescription();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelDescription();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
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
    } else if (e.key === '1' && e.metaKey) {
      e.preventDefault();
      // let set state to todo
      updateTask(task.id, {
        state: 'todo',
      });
    } else if (e.key === '2' && e.metaKey) {
      e.preventDefault();
      // let set state to prog
      updateTask(task.id, {
        state: 'prog',
      });
    } else if (e.key === '3' && e.metaKey) {
      e.preventDefault();
      // let set state to done
      updateTask(task.id, {
        state: 'done',
      });
    } else if (e.key === '4' && e.metaKey) {
      e.preventDefault();
      // let set state to blck
      updateTask(task.id, {
        state: 'blck',
      });
    } else if (e.key === 'd' && e.metaKey) {
      e.preventDefault();
      // let delete the task
      deleteTask(task.id);
    }
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      // let create a new task under current task
      addTaskAfter(task.id, task.bucket);
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
        obfuscated: isObfuscated,
      }),
    [task.editing, task.description, isObfuscated]
  );

  return (
    <>
      <div
        className={clsx('task', `state-${task.state}`, {
          editing: task.editing && !isObfuscated,
          obfuscated: isObfuscated,
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
            contentEditable={task.editing && !isObfuscated}
            suppressContentEditableWarning={true}
            onKeyDown={handleDescriptionKeyPress}
            onFocus={() => !isObfuscated && editingTask(task.id)}
            onClick={() => !isObfuscated && editingTask(task.id)}
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
