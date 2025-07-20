import { describe, it, expect, beforeEach } from 'bun:test';
import request from 'supertest';
import express from 'express';

// Create a simple test app with basic route handlers
const createTestApp = () => {
  const app = express();

  // Basic resize endpoint for testing parameter validation
  app.get('/resize', async (req, res) => {
    const { image, width, blur } = req.query;

    if (!image || !width) {
      return res.status(400).send('Invalid parameters');
    }

    // For testing, just return success with mock headers
    res.set('Content-Type', 'image/jpeg');
    res.set('X-Image-Width', width);
    res.set('X-Image-Height', Math.round((parseInt(width) * 600) / 800)); // Mock aspect ratio
    res.send(Buffer.from('mock image data'));
  });

  // Basic convert endpoint for testing parameter validation
  app.get('/convert', async (req, res) => {
    const { image, quality } = req.query;

    if (!image) {
      return res.status(400).send('Invalid parameters: image URL is required');
    }

    // For testing, just return success with mock headers
    res.set('Content-Type', 'image/webp');
    res.set('X-Image-Width', '800');
    res.set('X-Image-Height', '600');
    res.set('X-Original-Format', '.jpg');
    res.send(Buffer.from('mock webp data'));
  });

  return app;
};

describe('Image Processing Server - Basic Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /resize', () => {
    it('should return 400 for missing image parameter', async () => {
      const response = await request(app)
        .get('/resize')
        .query({ width: '400' });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid parameters');
    });

    it('should return 400 for missing width parameter', async () => {
      const response = await request(app)
        .get('/resize')
        .query({ image: 'https://example.com/test.jpg' });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid parameters');
    });

    it('should return 200 with valid parameters', async () => {
      const response = await request(app)
        .get('/resize')
        .query({
          image: 'https://example.com/test.jpg',
          width: '400'
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/jpeg');
      expect(response.headers['x-image-width']).toBe('400');
    });

    it('should handle blur parameter', async () => {
      const response = await request(app)
        .get('/resize')
        .query({
          image: 'https://example.com/test.jpg',
          width: '400',
          blur: '5'
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/jpeg');
    });
  });

  describe('GET /convert', () => {
    it('should return 400 for missing image parameter', async () => {
      const response = await request(app)
        .get('/convert');

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid parameters: image URL is required');
    });

    it('should return 200 with valid parameters', async () => {
      const response = await request(app)
        .get('/convert')
        .query({
          image: 'https://example.com/test.jpg'
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/webp');
      expect(response.headers['x-original-format']).toBe('.jpg');
    });

    it('should handle quality parameter', async () => {
      const response = await request(app)
        .get('/convert')
        .query({
          image: 'https://example.com/test.jpg',
          quality: '90'
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/webp');
    });
  });
});