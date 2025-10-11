import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showDebugDivBasedOnRect } from './Task.util';

describe('Task utilities', () => {
  beforeEach(() => {
    // Clean up any existing debug divs
    document.querySelectorAll('.debug-rect-overlay').forEach(el => el.remove());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('showDebugDivBasedOnRect', () => {
    it('should create a debug div with correct styles', () => {
      const rect: DOMRect = {
        left: 100,
        top: 200,
        width: 300,
        height: 50,
        right: 400,
        bottom: 250,
        x: 100,
        y: 200,
        toJSON: () => ({}),
      };

      showDebugDivBasedOnRect(rect, 'red');

      const debugDiv = document.querySelector('.debug-rect-overlay') as HTMLElement;
      expect(debugDiv).toBeTruthy();
      expect(debugDiv.style.position).toBe('fixed');
      expect(debugDiv.style.left).toBe('100px');
      expect(debugDiv.style.top).toBe('200px');
      expect(debugDiv.style.width).toBe('300px');
      expect(debugDiv.style.height).toBe('50px');
      expect(debugDiv.style.borderTop).toBe('2px solid red');
      expect(debugDiv.style.borderBottom).toBe('2px solid red');
      expect(debugDiv.style.zIndex).toBe('9999');
      expect(debugDiv.style.pointerEvents).toBe('none');
    });

    it('should remove the debug div after 1 second', () => {
      const rect: DOMRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      };

      showDebugDivBasedOnRect(rect, 'blue');

      // Initially, the div should exist
      let debugDiv = document.querySelector('.debug-rect-overlay');
      expect(debugDiv).toBeTruthy();

      // Fast-forward time by 1 second
      vi.advanceTimersByTime(1000);

      // After 1 second, the div should be removed
      debugDiv = document.querySelector('.debug-rect-overlay');
      expect(debugDiv).toBeFalsy();
    });

    it('should support different colors', () => {
      const rect: DOMRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      };

      showDebugDivBasedOnRect(rect, 'green');

      const debugDiv = document.querySelector('.debug-rect-overlay') as HTMLElement;
      expect(debugDiv.style.borderTop).toBe('2px solid green');
      expect(debugDiv.style.borderBottom).toBe('2px solid green');
    });

    it('should create multiple debug divs if called multiple times', () => {
      const rect: DOMRect = {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      };

      showDebugDivBasedOnRect(rect, 'red');
      showDebugDivBasedOnRect(rect, 'blue');

      const debugDivs = document.querySelectorAll('.debug-rect-overlay');
      expect(debugDivs).toHaveLength(2);
    });
  });
});
