import { config } from 'dotenv';
import express from 'express';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { downloadImage, getFileSizeInKB, getImageDimensions } from './src/utils.js';

config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/resize', async (req, res) => {
  const { image, width, blur } = req.query;

  if (!image || !width) {
    return res.status(400).send('Invalid parameters');
  }

  try {
    const directory = path.dirname(new URL(import.meta.url).pathname);
    const tempFilePath = path.join(directory, 'files', `temp_${nanoid(10)}.jpg`);

    await downloadImage(image, tempFilePath);
    const originalFileSizeInKB = await getFileSizeInKB(tempFilePath);

    const { width: originalWidth, height: originalHeight } = await getImageDimensions(tempFilePath);
    console.log(`Original image: ${image} (${originalWidth}x${originalHeight}) [${blur || 0}]`);
    // const rotation = await getImageRotation(tempFilePath);

    const targetWidth = parseInt(width);
    const targetHeight = Math.round((targetWidth * originalHeight) / originalWidth);

    let sharpInstance = sharp(tempFilePath);

    if (tempFilePath.endsWith('.png')) {
      sharpInstance = sharpInstance.png({ force: true });
    }

    if (blur) {
      const blurRadius = parseInt(blur);
      if (blurRadius > 0) {
        sharpInstance = sharpInstance.blur(blurRadius);
      }
    }

    const buffer = await sharpInstance
      .withMetadata()
      .resize(targetWidth, targetHeight)
      .toBuffer();
    const resizedImageDimensions = await sharp(buffer).metadata();
    const resizedWidth = resizedImageDimensions.width;
    const resizedHeight = resizedImageDimensions.height;

    const sizeInKB = Buffer.byteLength(buffer) / 1024;
    const sizesDifference = Math.abs(((sizeInKB / originalFileSizeInKB) - 1) * 100).toFixed(2);
    console.log(`New image is ${sizesDifference}% less in size - ${sizeInKB.toFixed(2)}Kb`);

    res.set('Content-Type', 'image/jpeg');
    res.set('Content-Length', buffer.length);
    res.set('X-Image-Width', resizedWidth);
    res.set('X-Image-Height', resizedHeight);
    res.send(buffer);

    await fs.unlink(tempFilePath);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing the image');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
