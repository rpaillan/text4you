import React, { useRef, useEffect, useMemo } from 'react';

import { Task } from '../types/index.js';
import './Task.scss';
import clsx from 'clsx';
import { useKanbanStore } from '../store/kanbanStore.js';
import { htmlEditor } from '../html-editor/html-editor.js';

interface CardProps {
  task: Task;
  index: number;
  isObfuscated?: boolean;
}

export const TaskView: React.FC<CardProps> = ({ task, isObfuscated = false, index }) => {
  const descriptionRef = useRef<HTMLDivElement>(null);
  const originalDescription = useRef<string>(task.description || '');

  const editingTask = useKanbanStore(state => state.editingTask);
  const updateTask = useKanbanStore(state => state.updateTask);
  const deleteTask = useKanbanStore(state => state.deleteTask);
  const addTaskAfter = useKanbanStore(state => state.addTaskAfter);

  const handleSaveDescription = () => {
    if (!descriptionRef.current) return;

    // Convert HTML content to plain text with newlines
    let htmlContent = descriptionRef.current.innerHTML;

    if (htmlContent.trim() === '') {
      deleteTask(task.id);
      return;
    }

    // let look for text inside htmlContent and if it contains text tag:issue, lets replace that with <span class="tag-issue">tag:issue</span>
    htmlContent = htmlContent.replace(/tag:issue/g, '<span class="t4y-tag t4y-tag-issue">issue</span>');
    htmlContent = htmlContent.replace(/tag:following/g, '<span class="t4y-tag t4y-tag-following">following</span>');
    htmlContent = htmlContent.replace(/tag:notice/g, '<span class="t4y-tag t4y-tag-notice">notice</span>');

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
        const allTasks = bucketElement?.querySelectorAll('.task-description-input');
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
    } else if (e.key === 'Tab') {
      // Handle Tab and Shift+Tab for list indentation
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      let node = range.startContainer;

      // Find the closest LI element
      let liElement: HTMLElement | null = null;
      if (node.nodeType === Node.TEXT_NODE) {
        liElement = (node.parentElement?.closest('li') as HTMLElement) || null;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        liElement = element.tagName === 'LI' ? element : (element.closest('li') as HTMLElement) || null;
      }

      if (liElement) {
        e.preventDefault();

        // Store the text content to find the element after DOM manipulation
        const liTextContent = liElement.textContent || '';
        const cursorOffset = range.startOffset;

        if (e.shiftKey) {
          // Shift+Tab: Un-indent (promote) the list item
          htmlEditor.undoTabIdentationOnLists(liElement);
        } else {
          // Tab: Indent (nest) the list item
          htmlEditor.tabIdentationOnLists(liElement);
        }

        // After modifying the DOM, restore cursor position
        setTimeout(() => {
          if (!descriptionRef.current) return;

          // Find all li elements and locate the one with matching text
          const allLis = descriptionRef.current.querySelectorAll('li');
          let targetLi: HTMLElement | null = null;

          for (const li of Array.from(allLis)) {
            if (li.textContent?.includes(liTextContent)) {
              targetLi = li as HTMLElement;
              break;
            }
          }

          if (targetLi && targetLi.firstChild) {
            const newRange = document.createRange();
            const newSelection = window.getSelection();

            try {
              // Try to restore the cursor position
              const textNode = targetLi.firstChild;
              const offset = Math.min(cursorOffset, (textNode.textContent || '').length);
              newRange.setStart(textNode, offset);
              newRange.collapse(true);
              newSelection?.removeAllRanges();
              newSelection?.addRange(newRange);

              // Ensure the element stays focused
              descriptionRef.current?.focus();
            } catch (e) {
              // If positioning fails, just place cursor at the start
              newRange.selectNodeContents(targetLi);
              newRange.collapse(true);
              newSelection?.removeAllRanges();
              newSelection?.addRange(newRange);
            }
          }
        }, 0);
      }
    }
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      // let create a new task under current task
      addTaskAfter(task.id, task.bucket);
    }
    // lets implement inseting a sorted list when the cursor is located in the text
    if ((e.key === 'o' || e.key === 'u') && e.metaKey) {
      e.preventDefault();
      // let insert a sorted list
      // Find the contentEditable div for this task
      const element = descriptionRef.current;
      if (!element) return;

      // Get current selection/cursor position
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const targetTag = e.key === 'o' ? 'ol' : 'ul';

      const randomClassOlName = `${targetTag}-${Math.random().toString(36).substring(2, 10)}`;
      // Create the sorted list content as HTML
      const listHTML = `<${targetTag} class="${randomClassOlName}"><li></li></${targetTag}>`;

      // Create a temporary div to convert HTML string to DOM nodes
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = listHTML;

      // Insert each node at the cursor position
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }

      // Delete any selected content and insert the list
      range.deleteContents();
      range.insertNode(fragment);

      // Find the first li element that was just inserted and place cursor inside it
      // let find the first li element in the fragment
      const insertedOl = element.querySelector(`.${randomClassOlName}`);
      const firstLi = insertedOl?.querySelector('li');

      if (firstLi) {
        const newRange = document.createRange();
        newRange.setStart(firstLi, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    // lest make selected text bold when pressing meta+b
    if (e.key === 'b' && e.metaKey) {
      e.preventDefault();
      // let make the selected text bold
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      if (!selectedText) return;

      const commonAncestorContainer = range.commonAncestorContainer;

      if (commonAncestorContainer.parentElement && commonAncestorContainer.parentElement.tagName === 'B') {
        // lets remove the b tag, mantaining internal elements
        const bTag = commonAncestorContainer.parentElement;
        const childNodes = bTag.childNodes;
        bTag.replaceWith(...childNodes);
        return;
      } else {
        // lets add the b tag
        const boldElem = document.createElement('b');
        boldElem.textContent = selectedText;
        range.deleteContents();
        range.insertNode(boldElem);
        // Move the cursor after the inserted <b> element
        range.setStartAfter(boldElem);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const handlePaste = () => {
    // Don't prevent default - let browser paste normally
    // Run code after the paste completes
    setTimeout(() => {
      const element = descriptionRef.current;
      if (!element) return;
      // insert a <span></span> where the cursor is.
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const span = document.createElement('span');
      span.textContent = ' ';
      selection.anchorNode?.parentElement?.parentElement?.appendChild(span);
    }, 0);
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
        <div className="task-header">
          <span>
            {task.id.slice(0, 3)}.{index + 1}
          </span>
        </div>
        <div className="task-content">
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
            onPaste={handlePaste}
            dangerouslySetInnerHTML={{
              __html: task.description ? task.description.replace(/\n/g, '<br>') : '',
            }}
          />
        </div>
      </div>
    </>
  );
};
