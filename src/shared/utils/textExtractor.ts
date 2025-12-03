/**
 * Extract readable text from the page.
 *
 * @returns Array of words from the page content
 */
export function extractWords(): string[] {
  const text = document.body.innerText || '';
  return text.split(/\s+/).filter((word) => word.length > 0);
}

/**
 * Extract text from a specific element.
 *
 * @param element - The DOM element to extract text from
 * @returns Array of words from the element
 */
export function extractWordsFromElement(element: HTMLElement): string[] {
  const text = element.innerText || '';
  return text.split(/\s+/).filter((word) => word.length > 0);
}

/**
 * Extract selected text from the page.
 *
 * @returns Array of words from the current selection, or null if nothing is selected
 */
export function extractSelectedWords(): string[] | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    return null;
  }

  const text = selection.toString();
  const words = text.split(/\s+/).filter((word) => word.length > 0);

  return words.length > 0 ? words : null;
}
