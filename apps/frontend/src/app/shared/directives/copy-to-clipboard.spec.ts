import { TestBed } from '@angular/core/testing';
import { CopyToClipboard } from './copy-to-clipboard';

describe('CopyToClipboard', () => {
  it('should create an instance', () => {
    TestBed.runInInjectionContext(() => {
      const directive = new CopyToClipboard();
      expect(directive).toBeTruthy();
    });
  });
});