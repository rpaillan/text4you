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
  // All following siblings will become children of the promoted li to maintain order.
  undoTabIdentationOnLists(li: HTMLElement) {
    const parentUl = li.parentElement;
    if (!parentUl || parentUl.tagName !== 'UL') {
      return;
    }

    const grandParentLi = parentUl.parentElement;
    if (!grandParentLi || grandParentLi.tagName !== 'LI') {
      return;
    }

    const greatGrandParentList = grandParentLi.parentElement;
    if (!greatGrandParentList || (greatGrandParentList.tagName !== 'UL' && greatGrandParentList.tagName !== 'OL')) {
      return;
    }

    // Clone the li (without deep cloning - we'll handle children separately)
    const clonedLi = li.cloneNode(true) as HTMLElement;

    // Collect all following siblings to nest under the promoted item
    const followingSiblings: HTMLElement[] = [];
    let nextSibling = li.nextElementSibling;
    while (nextSibling) {
      if (nextSibling.tagName === 'LI') {
        followingSiblings.push(nextSibling as HTMLElement);
      }
      nextSibling = nextSibling.nextElementSibling;
    }

    // If there are following siblings, nest them under the promoted item
    if (followingSiblings.length > 0) {
      const newNestedUl = document.createElement('ul');
      followingSiblings.forEach(sibling => {
        newNestedUl.appendChild(sibling.cloneNode(true));
      });
      clonedLi.appendChild(newNestedUl);
    }

    // Insert the promoted li after the grandParentLi
    if (grandParentLi.nextSibling) {
      greatGrandParentList.insertBefore(clonedLi, grandParentLi.nextSibling);
    } else {
      greatGrandParentList.appendChild(clonedLi);
    }

    // Remove the original li and its following siblings
    parentUl.removeChild(li);
    followingSiblings.forEach(sibling => {
      if (sibling.parentElement === parentUl) {
        parentUl.removeChild(sibling);
      }
    });

    // If the parent ul is now empty, remove it
    if (parentUl.children.length === 0) {
      grandParentLi.removeChild(parentUl);
    }
  }
}

export const htmlEditor = new HtmlEditor();
