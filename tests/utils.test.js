import { describe, it, expect, beforeAll } from 'bun:test';
import fs from 'fs/promises';
import path from 'path';
import {
  downloadImage,
  getFileSizeInKB,
  getImageDimensions,
  getImageRotation,
  generateSuggestedFilename,
} from '../src/utils.js';

describe('Utils Functions', () => {
  // Create a test file for file operations
  const testFilePath = 'test-temp-file.txt';
  const testContent = 'Hello, this is a test file for size calculation!';

  beforeAll(async () => {
    // Create a test file
    await fs.writeFile(testFilePath, testContent);
  });

  describe('downloadImage', () => {
    it('should be a function', () => {
      expect(typeof downloadImage).toBe('function');
    });

    it('should throw error for invalid URLs', async () => {
      try {
        await downloadImage('invalid-url', '/tmp/test.jpg');
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should throw error for HTTP error responses', async () => {
      try {
        // Use a real domain but a path that returns 404
        await downloadImage('https://httpbin.org/status/404', '/tmp/test.jpg');
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Failed to download image');
      }
    });
  });

  describe('getFileSizeInKB', () => {
    it('should be a function', () => {
      expect(typeof getFileSizeInKB).toBe('function');
    });

    it('should return file size as string with 2 decimal places', async () => {
      const size = await getFileSizeInKB(testFilePath);
      expect(typeof size).toBe('string');
      expect(size).toMatch(/^\d+\.\d{2}$/);
      expect(parseFloat(size)).toBeGreaterThan(0);
    });

    it('should throw error for nonexistent files', async () => {
      try {
        await getFileSizeInKB('/nonexistent/file.jpg');
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.code).toBe('ENOENT');
      }
    });

    it('should handle package.json file size calculation', async () => {
      const size = await getFileSizeInKB('package.json');
      expect(typeof size).toBe('string');
      expect(parseFloat(size)).toBeGreaterThan(0);
    });
  });

  describe('getImageDimensions', () => {
    it('should be a function', () => {
      expect(typeof getImageDimensions).toBe('function');
    });

    it('should throw error for nonexistent files', async () => {
      try {
        await getImageDimensions('/nonexistent/file.jpg');
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.code).toBe('ENOENT');
      }
    });

    it('should throw error for non-image files', async () => {
      try {
        await getImageDimensions(testFilePath);
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('getImageRotation', () => {
    it('should be a function', () => {
      expect(typeof getImageRotation).toBe('function');
    });

    it('should throw error for nonexistent files', async () => {
      try {
        await getImageRotation('/nonexistent/file.jpg');
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.code).toBe('ENOENT');
      }
    });

    it('should throw error for non-image files', async () => {
      try {
        await getImageRotation(testFilePath);
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('generateSuggestedFilename', () => {
    it('should be a function', () => {
      expect(typeof generateSuggestedFilename).toBe('function');
    });

    it('should generate resize filename with width', () => {
      const result = generateSuggestedFilename(
        'https://example.com/photo.jpg',
        'resize',
        { width: '400' }
      );
      expect(result).toBe('photo_400w.jpg');
    });

    it('should generate resize filename with width and blur', () => {
      const result = generateSuggestedFilename(
        'https://example.com/photo.jpg',
        'resize',
        { width: '400', blur: '5' }
      );
      expect(result).toBe('photo_400w_blur5.jpg');
    });

    it('should generate convert filename to webp', () => {
      const result = generateSuggestedFilename(
        'https://example.com/photo.jpg',
        'convert',
        {}
      );
      expect(result).toBe('photo.webp');
    });

    it('should generate convert filename with quality', () => {
      const result = generateSuggestedFilename(
        'https://example.com/photo.jpg',
        'convert',
        { quality: '90' }
      );
      expect(result).toBe('photo_q90.webp');
    });

    it('should handle URLs without file extensions', () => {
      const result = generateSuggestedFilename(
        'https://example.com/photo',
        'resize',
        { width: '400' }
      );
      expect(result).toBe('photo_400w');
    });

    it('should handle PNG files', () => {
      const result = generateSuggestedFilename(
        'https://example.com/photo.png',
        'resize',
        { width: '400' }
      );
      expect(result).toBe('photo_400w.png');
    });

    it('should handle invalid URLs with fallback', () => {
      const result = generateSuggestedFilename(
        'invalid-url',
        'resize',
        { width: '400' }
      );
      expect(result).toMatch(/^resized_\d+\.jpg$/);
    });

    it('should handle invalid URLs with convert fallback', () => {
      const result = generateSuggestedFilename(
        'invalid-url',
        'convert',
        {}
      );
      expect(result).toMatch(/^converted_\d+\.webp$/);
    });

    it('should not add blur suffix for zero blur', () => {
      const result = generateSuggestedFilename(
        'https://example.com/photo.jpg',
        'resize',
        { width: '400', blur: '0' }
      );
      expect(result).toBe('photo_400w.jpg');
    });

    it('should not add quality suffix for default quality (80)', () => {
      const result = generateSuggestedFilename(
        'https://example.com/photo.jpg',
        'convert',
        { quality: '80' }
      );
      expect(result).toBe('photo.webp');
    });

    it('should handle URLs with query parameters', () => {
      const result = generateSuggestedFilename(
        'https://example.com/photo.jpg?v=123&size=large',
        'resize',
        { width: '400' }
      );
      expect(result).toBe('photo_400w.jpg');
    });

    it('should handle deeply nested paths', () => {
      const result = generateSuggestedFilename(
        'https://example.com/images/gallery/2024/photo.jpg',
        'resize',
        { width: '400' }
      );
      expect(result).toBe('photo_400w.jpg');
    });
  });

  // Cleanup
  describe('Cleanup', () => {
    it('should clean up test file', async () => {
      try {
        await fs.unlink(testFilePath);
        expect(true).toBe(true);
      } catch (error) {
        // File might already be deleted
        expect(error.code).toBe('ENOENT');
      }
    });
  });
});