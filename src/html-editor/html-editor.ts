// This is a compoment to handle all the html edition functionalities to
// create a inline text editor using a contenteditable div.

class HtmlEditor {
  constructor() {}

  // if user is on a li, and press tab, it should create a sub list with the same text content.
  tabIdentationOnLists(li: HTMLElement) {
    const previousLISibling = li.previousElementSibling;
    if (!previousLISibling || previousLISibling?.tagName !== 'LI') {
      return;
    }

    const parent = previousLISibling.parentElement;
    if (!parent) {
      return;
    }

    const subList = document.createElement('ul');
    subList.appendChild(li.cloneNode(true));
    previousLISibling.appendChild(subList);
    parent.removeChild(li);
  }

  // if user is on a nested li, and press shift+tab, it should move the li out to become a sibling of its parent li.
  undoTabIdentationOnLists(li: HTMLElement) {
    const parentUl = li.parentElement;
    if (!parentUl || parentUl.tagName !== 'UL') {
      return;
    }

    const grandParentLi = parentUl.parentElement;
    if (!grandParentLi || grandParentLi.tagName !== 'LI') {
      return;
    }

    const greatGrandParentUl = grandParentLi.parentElement;
    if (!greatGrandParentUl || greatGrandParentUl.tagName !== 'UL') {
      return;
    }

    // Clone the li and insert it after the grandParentLi
    const clonedLi = li.cloneNode(true);
    if (grandParentLi.nextSibling) {
      greatGrandParentUl.insertBefore(clonedLi, grandParentLi.nextSibling);
    } else {
      greatGrandParentUl.appendChild(clonedLi);
    }

    // Remove the original li
    parentUl.removeChild(li);

    // If the parent ul is now empty, remove it
    if (parentUl.children.length === 0) {
      grandParentLi.removeChild(parentUl);
    }
  }
}

export const htmlEditor = new HtmlEditor();
