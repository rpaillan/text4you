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
}

export const htmlEditor = new HtmlEditor();
