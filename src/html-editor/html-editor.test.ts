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

  describe('convertLiToSubList', () => {
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
});
