import fs from 'fs/promises';
import axios from 'axios';
import sizeOf from 'image-size';
import piexif from 'piexifjs';

export async function downloadImage(url, filePath) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  await fs.writeFile(filePath, Buffer.from(response.data, 'binary'));
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
