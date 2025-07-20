import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs/promises';
import axios from 'axios';
import sizeOf from 'image-size';
import piexif from 'piexifjs';
import {
  downloadImage,
  getFileSizeInKB,
  getImageDimensions,
  getImageRotation
} from '../src/utils.js';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('axios');
vi.mock('image-size');
vi.mock('piexifjs');

describe('Utils Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('downloadImage', () => {
    it('should download and save image successfully', async () => {
      const mockResponse = {
        data: Buffer.from('fake image data')
      };
      axios.get.mockResolvedValue(mockResponse);
      fs.writeFile.mockResolvedValue();

      await downloadImage('https://example.com/image.jpg', '/tmp/test.jpg');

      expect(axios.get).toHaveBeenCalledWith('https://example.com/image.jpg', {
        responseType: 'arraybuffer'
      });
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/tmp/test.jpg',
        expect.any(Buffer)
      );
    });

    it('should throw error when download fails', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      await expect(
        downloadImage('https://example.com/image.jpg', '/tmp/test.jpg')
      ).rejects.toThrow('Network error');
    });

    it('should throw error when file write fails', async () => {
      const mockResponse = { data: Buffer.from('fake image data') };
      axios.get.mockResolvedValue(mockResponse);
      fs.writeFile.mockRejectedValue(new Error('Write error'));

      await expect(
        downloadImage('https://example.com/image.jpg', '/tmp/test.jpg')
      ).rejects.toThrow('Write error');
    });
  });

  describe('getFileSizeInKB', () => {
    it('should return file size in KB', async () => {
      const mockStats = { size: 2048 }; // 2KB
      fs.stat.mockResolvedValue(mockStats);

      const result = await getFileSizeInKB('/tmp/test.jpg');

      expect(result).toBe('2.00');
      expect(fs.stat).toHaveBeenCalledWith('/tmp/test.jpg');
    });

    it('should handle small files correctly', async () => {
      const mockStats = { size: 512 }; // 0.5KB
      fs.stat.mockResolvedValue(mockStats);

      const result = await getFileSizeInKB('/tmp/test.jpg');

      expect(result).toBe('0.50');
    });

    it('should throw error when file stat fails', async () => {
      fs.stat.mockRejectedValue(new Error('File not found'));

      await expect(getFileSizeInKB('/tmp/nonexistent.jpg')).rejects.toThrow(
        'File not found'
      );
    });
  });

  describe('getImageDimensions', () => {
    it('should return image dimensions', async () => {
      const mockDimensions = { width: 800, height: 600 };
      sizeOf.mockReturnValue(mockDimensions);

      const result = await getImageDimensions('/tmp/test.jpg');

      expect(result).toEqual(mockDimensions);
      expect(sizeOf).toHaveBeenCalledWith('/tmp/test.jpg');
    });

    it('should throw error when dimension reading fails', async () => {
      sizeOf.mockImplementation(() => {
        throw new Error('Invalid image format');
      });

      await expect(getImageDimensions('/tmp/test.jpg')).rejects.toThrow(
        'Invalid image format'
      );
    });
  });

  describe('getImageRotation', () => {
    beforeEach(() => {
      fs.readFile.mockResolvedValue(Buffer.from('fake image data'));
    });

    it('should return 0 degrees for normal orientation', async () => {
      const mockExifData = {
        '0th': {
          [piexif.ImageIFD.Orientation]: 1
        }
      };
      piexif.load.mockReturnValue(mockExifData);

      const result = await getImageRotation('/tmp/test.jpg');

      expect(result).toBe(0);
    });

    it('should return 90 degrees for orientation 6', async () => {
      const mockExifData = {
        '0th': {
          [piexif.ImageIFD.Orientation]: 6
        }
      };
      piexif.load.mockReturnValue(mockExifData);

      const result = await getImageRotation('/tmp/test.jpg');

      expect(result).toBe(90);
    });

    it('should return 180 degrees for orientation 3', async () => {
      const mockExifData = {
        '0th': {
          [piexif.ImageIFD.Orientation]: 3
        }
      };
      piexif.load.mockReturnValue(mockExifData);

      const result = await getImageRotation('/tmp/test.jpg');

      expect(result).toBe(180);
    });

    it('should return 270 degrees for orientation 8', async () => {
      const mockExifData = {
        '0th': {
          [piexif.ImageIFD.Orientation]: 8
        }
      };
      piexif.load.mockReturnValue(mockExifData);

      const result = await getImageRotation('/tmp/test.jpg');

      expect(result).toBe(270);
    });

    it('should throw error when EXIF reading fails', async () => {
      piexif.load.mockImplementation(() => {
        throw new Error('Invalid EXIF data');
      });

      await expect(getImageRotation('/tmp/test.jpg')).rejects.toThrow(
        'Invalid EXIF data'
      );
    });

    it('should throw error when file reading fails', async () => {
      fs.readFile.mockRejectedValue(new Error('File read error'));

      await expect(getImageRotation('/tmp/test.jpg')).rejects.toThrow(
        'File read error'
      );
    });

    it('should handle missing orientation data', async () => {
      const mockExifData = {
        '0th': {} // No orientation data
      };
      piexif.load.mockReturnValue(mockExifData);

      const result = await getImageRotation('/tmp/test.jpg');

      expect(result).toBe(0); // Should default to 0 degrees
    });

    it('should handle unknown orientation values', async () => {
      const mockExifData = {
        '0th': {
          [piexif.ImageIFD.Orientation]: 99 // Unknown orientation
        }
      };
      piexif.load.mockReturnValue(mockExifData);

      const result = await getImageRotation('/tmp/test.jpg');

      expect(result).toBe(0); // Should default to 0 degrees
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    describe('downloadImage edge cases', () => {
      it('should handle empty response data', async () => {
        const mockResponse = { data: Buffer.alloc(0) };
        axios.get.mockResolvedValue(mockResponse);
        fs.writeFile.mockResolvedValue();

        await downloadImage('https://example.com/empty.jpg', '/tmp/test.jpg');

        expect(fs.writeFile).toHaveBeenCalledWith(
          '/tmp/test.jpg',
          expect.any(Buffer)
        );
      });
    });

    describe('getFileSizeInKB edge cases', () => {
      it('should handle zero-byte files', async () => {
        const mockStats = { size: 0 };
        fs.stat.mockResolvedValue(mockStats);

        const result = await getFileSizeInKB('/tmp/empty.jpg');

        expect(result).toBe('0.00');
      });

      it('should handle very large files', async () => {
        const mockStats = { size: 1024 * 1024 * 10 }; // 10MB
        fs.stat.mockResolvedValue(mockStats);

        const result = await getFileSizeInKB('/tmp/large.jpg');

        expect(result).toBe('10240.00');
      });
    });

    describe('getImageDimensions edge cases', () => {
      it('should handle images with unusual dimensions', async () => {
        const mockDimensions = { width: 1, height: 1 };
        sizeOf.mockReturnValue(mockDimensions);

        const result = await getImageDimensions('/tmp/tiny.jpg');

        expect(result).toEqual(mockDimensions);
      });

      it('should handle images with missing dimension data', async () => {
        sizeOf.mockReturnValue({ width: undefined, height: undefined });

        const result = await getImageDimensions('/tmp/corrupt.jpg');

        expect(result).toEqual({ width: undefined, height: undefined });
      });
    });
  });
});