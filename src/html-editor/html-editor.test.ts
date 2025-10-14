import { describe, it, expect, beforeEach } from 'vitest';
import { htmlEditor } from './html-editor';

/**
 * Normalizes HTML string by removing extra whitespace for reliable comparison
 * @param html - The HTML string to normalize
 * @returns Normalized HTML string
 */
function normalizeHTML(html: string): string {
  // Create a temporary container to parse the HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Get the normalized HTML (browser will parse and reformat it consistently)
  // Remove extra whitespace for comparison
  return temp.innerHTML
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .replace(/\s+</g, '<') // Remove spaces before opening tags
    .replace(/>\s+/g, '>') // Remove spaces after closing tags
    .trim(); // Remove leading/trailing whitespace
}

/**
 * Compares two HTML strings after normalizing them
 * @param actual - The actual HTML string
 * @param expected - The expected HTML string
 */
function expectHTMLToEqual(actual: string, expected: string): void {
  const normalizedActual = normalizeHTML(actual);
  const normalizedExpected = normalizeHTML(expected);
  expect(normalizedActual).toBe(normalizedExpected);
}

describe('HtmlEditor', () => {
  let mainContainer: HTMLElement;

  beforeEach(() => {
    // Create a fresh container for each test
    mainContainer = document.createElement('div');
    document.body.appendChild(mainContainer);
  });

  describe('tabIdentationOnLists', () => {
    it('should do nothing if li has no previous sibling', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Only item</li>
        </ul>
      `;
      const li = mainContainer.querySelector('li') as HTMLElement;
      const originalHTML = mainContainer.innerHTML;

      htmlEditor.tabIdentationOnLists(li);

      // HTML should remain unchanged
      expectHTMLToEqual(mainContainer.innerHTML, originalHTML);
    });

    it('should do nothing if previous sibling is not an LI element', () => {
      mainContainer.innerHTML = `
        <ul>
          <div>Not a list item</div>
          <li>Second item</li>
        </ul>
      `;
      const li = mainContainer.querySelector('li') as HTMLElement;
      const originalHTML = mainContainer.innerHTML;

      htmlEditor.tabIdentationOnLists(li);

      // HTML should remain unchanged
      expectHTMLToEqual(mainContainer.innerHTML, originalHTML);
    });

    it('should nest li under previous sibling as a sub-list', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `;
      const li = mainContainer.querySelectorAll('li')[1] as HTMLElement;

      htmlEditor.tabIdentationOnLists(li);

      const expectedHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li>Item 2</li>
            </ul>
          </li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);
    });

    it('should preserve all attributes when nesting li', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1</li>
          <li class="test-class" data-id="123">Item 2</li>
        </ul>
      `;
      const li = mainContainer.querySelectorAll('li')[1] as HTMLElement;

      htmlEditor.tabIdentationOnLists(li);

      const expectedHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li class="test-class" data-id="123">Item 2</li>
            </ul>
          </li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);
    });

    it('should remove the original li from parent after nesting', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      `;
      const li = mainContainer.querySelectorAll('li')[1] as HTMLElement;

      htmlEditor.tabIdentationOnLists(li);

      const expectedHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li>Item 2</li>
            </ul>
          </li>
          <li>Item 3</li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);
    });

    it('should preserve nested HTML content in the li', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1</li>
          <li>
            <span>Nested </span>
            <strong>content</strong>
          </li>
        </ul>
      `;
      const li = mainContainer.querySelectorAll('li')[1] as HTMLElement;

      htmlEditor.tabIdentationOnLists(li);

      const expectedHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li>
                <span>Nested </span>
                <strong>content</strong>
              </li>
            </ul>
          </li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);
    });

    it('should handle li with empty content', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1</li>
          <li></li>
        </ul>
      `;
      const li = mainContainer.querySelectorAll('li')[1] as HTMLElement;

      htmlEditor.tabIdentationOnLists(li);

      const expectedHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li></li>
            </ul>
          </li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);
    });

    it('should handle li with existing child ul elements', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1</li>
          <li>
            Parent item
            <ul>
              <li>Nested item</li>
            </ul>
          </li>
        </ul>
      `;
      const li = mainContainer.querySelectorAll('li')[1] as HTMLElement;

      htmlEditor.tabIdentationOnLists(li);

      const expectedHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li>
                Parent item
                <ul>
                  <li>Nested item</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);
    });
  });

  describe('undoTabIdentationOnLists', () => {
    it('should do nothing if li is not nested in a sub-list', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Top level item</li>
        </ul>
      `;
      const li = mainContainer.querySelector('li') as HTMLElement;
      const originalHTML = mainContainer.innerHTML;

      htmlEditor.undoTabIdentationOnLists(li);

      // HTML should remain unchanged
      expectHTMLToEqual(mainContainer.innerHTML, originalHTML);
    });

    it('should do nothing if parent is not a UL element', () => {
      mainContainer.innerHTML = `
        <div>
          <li>Invalid structure</li>
        </div>
      `;
      const li = mainContainer.querySelector('li') as HTMLElement;
      const originalHTML = mainContainer.innerHTML;

      htmlEditor.undoTabIdentationOnLists(li);

      // HTML should remain unchanged
      expectHTMLToEqual(mainContainer.innerHTML, originalHTML);
    });

    it('should move nested li to become sibling of parent li', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li>Nested item</li>
            </ul>
          </li>
        </ul>
      `;
      const nestedLi = mainContainer.querySelectorAll('ul ul li')[0] as HTMLElement;

      htmlEditor.undoTabIdentationOnLists(nestedLi);

      const expectedHTML = `
        <ul>
          <li>Item 1</li>
          <li>Nested item</li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);
    });

    it('should preserve all attributes when un-nesting li', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li class="test-class" data-id="123">Nested item</li>
            </ul>
          </li>
        </ul>
      `;
      const nestedLi = mainContainer.querySelectorAll('ul ul li')[0] as HTMLElement;

      htmlEditor.undoTabIdentationOnLists(nestedLi);

      const expectedHTML = `
        <ul>
          <li>Item 1</li>
          <li class="test-class" data-id="123">Nested item</li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);
    });

    it('should remove empty ul after moving the last nested li', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li>Only nested item</li>
            </ul>
          </li>
        </ul>
      `;
      const nestedLi = mainContainer.querySelectorAll('ul ul li')[0] as HTMLElement;

      htmlEditor.undoTabIdentationOnLists(nestedLi);

      const expectedHTML = `
        <ul>
          <li>Item 1</li>
          <li>Only nested item</li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);

      // Verify no empty ul remains
      const nestedUls = mainContainer.querySelectorAll('ul ul');
      expect(nestedUls.length).toBe(0);
    });

    it('should keep ul if other items remain after moving one nested li', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li>Nested item 1</li>
              <li>Nested item 2</li>
            </ul>
          </li>
        </ul>
      `;
      const nestedLi = mainContainer.querySelectorAll('ul ul li')[0] as HTMLElement;

      htmlEditor.undoTabIdentationOnLists(nestedLi);

      const expectedHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li>Nested item 2</li>
            </ul>
          </li>
          <li>Nested item 1</li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);
    });

    it('should insert li after parent li when parent has siblings', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li>Nested item</li>
            </ul>
          </li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      `;
      const nestedLi = mainContainer.querySelectorAll('ul ul li')[0] as HTMLElement;

      htmlEditor.undoTabIdentationOnLists(nestedLi);

      const expectedHTML = `
        <ul>
          <li>Item 1</li>
          <li>Nested item</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);
    });

    it('should preserve nested HTML content when un-nesting', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li>
                <span>Nested </span>
                <strong>content</strong>
              </li>
            </ul>
          </li>
        </ul>
      `;
      const nestedLi = mainContainer.querySelectorAll('ul ul li')[0] as HTMLElement;

      htmlEditor.undoTabIdentationOnLists(nestedLi);

      const expectedHTML = `
        <ul>
          <li>Item 1</li>
          <li>
            <span>Nested </span>
            <strong>content</strong>
          </li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);
    });

    it('should handle deeply nested structures (un-nest from 2 levels to 1 level)', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Level 1
            <ul>
              <li>Level 2
                <ul>
                  <li>Level 3</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      `;
      const level3Li = mainContainer.querySelectorAll('ul ul ul li')[0] as HTMLElement;

      htmlEditor.undoTabIdentationOnLists(level3Li);

      const expectedHTML = `
        <ul>
          <li>Level 1
            <ul>
              <li>Level 2</li>
              <li>Level 3</li>
            </ul>
          </li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);
    });

    it('should handle li with its own nested ul elements', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li>Nested item
                <ul>
                  <li>Deep nested</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      `;
      const nestedLi = mainContainer.querySelectorAll('ul > li > ul > li')[0] as HTMLElement;

      htmlEditor.undoTabIdentationOnLists(nestedLi);

      const expectedHTML = `
        <ul>
          <li>Item 1</li>
          <li>Nested item
            <ul>
              <li>Deep nested</li>
            </ul>
          </li>
        </ul>
      `;

      expectHTMLToEqual(mainContainer.innerHTML, expectedHTML);
    });
  });

  describe('Tab and Shift+Tab integration', () => {
    it('should be reversible: Tab then Shift+Tab returns to original structure', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      `;
      const originalHTML = mainContainer.innerHTML;
      const item2 = mainContainer.querySelectorAll('li')[1] as HTMLElement;

      // Tab: Indent Item 2 under Item 1
      htmlEditor.tabIdentationOnLists(item2);

      const afterTabHTML = `
        <ul>
          <li>Item 1
            <ul>
              <li>Item 2</li>
            </ul>
          </li>
          <li>Item 3</li>
        </ul>
      `;
      expectHTMLToEqual(mainContainer.innerHTML, afterTabHTML);

      // Shift+Tab: Un-indent Item 2 back to original level
      const nestedItem2 = mainContainer.querySelectorAll('ul ul li')[0] as HTMLElement;
      htmlEditor.undoTabIdentationOnLists(nestedItem2);

      expectHTMLToEqual(mainContainer.innerHTML, originalHTML);
    });

    it('should handle sequential indent/un-indent operations', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `;

      // Tab Item 2 under Item 1
      const item2 = mainContainer.querySelectorAll('li')[1] as HTMLElement;
      htmlEditor.tabIdentationOnLists(item2);

      const afterTab = `
        <ul>
          <li>Item 1
            <ul>
              <li>Item 2</li>
            </ul>
          </li>
        </ul>
      `;
      expectHTMLToEqual(mainContainer.innerHTML, afterTab);

      // Un-indent Item 2 back to top level
      const nestedItem2 = mainContainer.querySelectorAll('ul ul li')[0] as HTMLElement;
      htmlEditor.undoTabIdentationOnLists(nestedItem2);

      const afterUndoTab = `
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `;
      expectHTMLToEqual(mainContainer.innerHTML, afterUndoTab);
    });

    it('should handle promoting subtasks to parent level', () => {
      mainContainer.innerHTML = `
        <ul>
          <li>Main task
            <ul>
              <li>Subtask 1</li>
              <li>Subtask 2</li>
            </ul>
          </li>
        </ul>
      `;

      // User decides Subtask 1 should be promoted to main task
      const subtask1 = mainContainer.querySelectorAll('ul ul li')[0] as HTMLElement;
      htmlEditor.undoTabIdentationOnLists(subtask1);

      const afterFirstPromotion = `
        <ul>
          <li>Main task
          <li>Subtask 1
            <ul>
              <li>Subtask 2</li>
            </ul>
          </li>
        </ul>
      `;
      expectHTMLToEqual(mainContainer.innerHTML, afterFirstPromotion);

      // Promote Subtask 2 as well (it will be inserted right after Main task)
      const subtask2 = mainContainer.querySelectorAll('ul ul li')[0] as HTMLElement;
      htmlEditor.undoTabIdentationOnLists(subtask2);

      // Note: When both are promoted, Subtask 2 is inserted after Main task,
      // which pushes Subtask 1 down, resulting in the order: Main task, Subtask 2, Subtask 1
      const finalHTML = `
        <ul>
          <li>Main task</li>
          <li>Subtask 1</li>
          <li>Subtask 2</li>
        </ul>
      `;
      expectHTMLToEqual(mainContainer.innerHTML, finalHTML);
    });
  });
});
