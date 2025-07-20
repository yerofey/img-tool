import { describe, it, expect, beforeAll } from 'bun:test';
import request from 'supertest';
import fs from 'fs/promises';

// Note: These are integration tests that would require a running server
// and actual image URLs. They are disabled by default with .skip
// Remove .skip to run them with real image processing

describe.skip('Integration Tests', () => {
  const baseURL = 'http://localhost:3000';
  const testImageURL = 'https://via.placeholder.com/800x600.jpg';

  beforeAll(async () => {
    // Ensure files directory exists
    try {
      await fs.mkdir('files', { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  });

  describe('GET /resize - Integration', () => {
    it('should resize a real image', async () => {
      const response = await request(baseURL)
        .get('/resize')
        .query({
          image: testImageURL,
          width: '400'
        })
        .expect(200);

      expect(response.headers['content-type']).toBe('image/jpeg');
      expect(response.headers['x-image-width']).toBe('400');
      expect(response.body).toBeInstanceOf(Buffer);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should resize and blur a real image', async () => {
      const response = await request(baseURL)
        .get('/resize')
        .query({
          image: testImageURL,
          width: '300',
          blur: '3'
        })
        .expect(200);

      expect(response.headers['content-type']).toBe('image/jpeg');
      expect(response.headers['x-image-width']).toBe('300');
      expect(response.body).toBeInstanceOf(Buffer);
    });
  });

  describe('GET /convert - Integration', () => {
    it('should convert a real image to WebP', async () => {
      const response = await request(baseURL)
        .get('/convert')
        .query({
          image: testImageURL
        })
        .expect(200);

      expect(response.headers['content-type']).toBe('image/webp');
      expect(response.headers['x-original-format']).toBe('.jpg');
      expect(response.body).toBeInstanceOf(Buffer);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should convert with custom quality', async () => {
      const response = await request(baseURL)
        .get('/convert')
        .query({
          image: testImageURL,
          quality: '90'
        })
        .expect(200);

      expect(response.headers['content-type']).toBe('image/webp');
      expect(response.body).toBeInstanceOf(Buffer);
    });
  });

  describe('Error Handling - Integration', () => {
    it('should handle invalid image URLs', async () => {
      await request(baseURL)
        .get('/resize')
        .query({
          image: 'https://invalid-url-that-does-not-exist.com/image.jpg',
          width: '400'
        })
        .expect(500);
    });

    it('should handle invalid image URLs for conversion', async () => {
      await request(baseURL)
        .get('/convert')
        .query({
          image: 'https://invalid-url-that-does-not-exist.com/image.jpg'
        })
        .expect(500);
    });
  });
});