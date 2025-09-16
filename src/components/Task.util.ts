export const showDebugDivBasedOnRect = (rect: DOMRect, color: string) => {
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
};
