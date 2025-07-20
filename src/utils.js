import sizeOf from 'image-size';
import piexif from 'piexifjs';
import fs from 'node:fs/promises';

export async function downloadImage(url, filePath) {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);
}

export async function getFileSizeInKB(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInKB = fileSizeInBytes / 1024;
    return fileSizeInKB.toFixed(2);
  } catch (error) {
    console.error(`Error getting file size: ${error}`);
    throw error;
  }
}

export async function getImageDimensions(filePath) {
  try {
    const dimensions = sizeOf(filePath);
    return dimensions;
  } catch (error) {
    console.error(`Error fetching image dimensions: ${error}`);
    throw error;
  }
}

export async function getImageRotation(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    const exifData = piexif.load(buffer.toString('binary'));
    const orientation = exifData['0th'][piexif.ImageIFD.Orientation];
    let degrees = 0;
    if (orientation === 6) {
      degrees = 90;
    } else if (orientation === 3) {
      degrees = 180;
    } else if (orientation === 8) {
      degrees = 270;
    }
    return degrees;
  } catch (error) {
    console.error(`Error fetching image rotation: ${error}`);
    throw error;
  }
}

export function generateSuggestedFilename(imageUrl, operation, options = {}) {
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    const filename = pathname.split('/').pop() || 'image';
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const originalExt = filename.match(/\.[^/.]+$/)?.[0] || '';
    
    let suffix = '';
    let newExt = originalExt;
    
    if (operation === 'resize') {
      const { width, blur } = options;
      suffix = `_${width}w`;
      if (blur && parseInt(blur) > 0) {
        suffix += `_blur${blur}`;
      }
    } else if (operation === 'convert') {
      const { quality } = options;
      newExt = '.webp';
      if (quality && parseInt(quality) !== 80) {
        suffix = `_q${quality}`;
      }
    }
    
    return `${nameWithoutExt}${suffix}${newExt}`;
  } catch (error) {
    // Fallback for invalid URLs
    const timestamp = Date.now();
    if (operation === 'convert') {
      return `converted_${timestamp}.webp`;
    }
    return `resized_${timestamp}.jpg`;
  }
}
