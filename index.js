import { config } from 'dotenv';
import { nanoid } from 'nanoid';
import {
  downloadImage,
  getFileSizeInKB,
  getImageDimensions,
  generateSuggestedFilename,
} from './src/utils.js';
import Fastify from 'fastify';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

config();

const fastify = Fastify({
  logger: process.env.NODE_ENV === 'production'
});

const port = process.env.PORT || 3000;

fastify.get('/convert', async (request, reply) => {
  const { image, quality } = request.query;

  if (!image) {
    return reply.code(400).send('Invalid parameters: image URL is required');
  }

  let tempFilePath;
  try {
    const directory = path.dirname(new URL(import.meta.url).pathname);
    tempFilePath = path.join(
      directory,
      'files',
      `temp_${nanoid(10)}.jpg`
    );

    await downloadImage(image, tempFilePath);
    const originalFileSizeInKB = await getFileSizeInKB(tempFilePath);

    const { width: originalWidth, height: originalHeight } =
      await getImageDimensions(tempFilePath);
    console.log(
      `Converting image: ${image} (${originalWidth}x${originalHeight}) to WebP`
    );

    let sharpInstance = sharp(tempFilePath);

    // Configure WebP options
    const webpOptions = {
      quality: quality ? parseInt(quality) : 80, // Default quality 80
      effort: 4 // Balance between compression and speed
    };

    const buffer = await sharpInstance
      .withMetadata()
      .webp(webpOptions)
      .toBuffer();

    const convertedImageDimensions = await sharp(buffer).metadata();
    const convertedWidth = convertedImageDimensions.width;
    const convertedHeight = convertedImageDimensions.height;

    const sizeInKB = Buffer.byteLength(buffer) / 1024;
    const sizesDifference = Math.abs(
      (sizeInKB / originalFileSizeInKB - 1) * 100
    ).toFixed(2);
    console.log(
      `WebP conversion complete - ${sizesDifference}% size change - ${sizeInKB.toFixed(2)}Kb`
    );

    const suggestedFilename = generateSuggestedFilename(image, 'convert', { quality });

    reply
      .header('Content-Type', 'image/webp')
      .header('Content-Length', buffer.length)
      .header('Content-Disposition', `inline; filename="${suggestedFilename}"`)
      .header('X-Image-Width', convertedWidth)
      .header('X-Image-Height', convertedHeight)
      .header('X-Original-Format', path.extname(image).toLowerCase())
      .send(buffer);
  } catch (error) {
    console.error(error);
    reply.code(500).send('Error converting the image');
  } finally {
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (unlinkError) {
        console.error('Error cleaning up temp file:', unlinkError);
      }
    }
  }
});

fastify.get('/resize', async (request, reply) => {
  const { image, width, blur } = request.query;

  if (!image || !width) {
    return reply.code(400).send('Invalid parameters');
  }

  let tempFilePath;
  try {
    const directory = path.dirname(new URL(import.meta.url).pathname);
    tempFilePath = path.join(
      directory,
      'files',
      `temp_${nanoid(10)}.jpg`
    );

    await downloadImage(image, tempFilePath);
    const originalFileSizeInKB = await getFileSizeInKB(tempFilePath);

    const { width: originalWidth, height: originalHeight } =
      await getImageDimensions(tempFilePath);
    console.log(
      `Original image: ${image} (${originalWidth}x${originalHeight}) [${blur || 0
      }]`
    );

    const targetWidth = parseInt(width);
    const targetHeight = Math.round(
      (targetWidth * originalHeight) / originalWidth
    );

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
    const sizesDifference = Math.abs(
      (sizeInKB / originalFileSizeInKB - 1) * 100
    ).toFixed(2);
    console.log(
      `New image is ${sizesDifference}% less in size - ${sizeInKB.toFixed(2)}Kb`
    );

    const suggestedFilename = generateSuggestedFilename(image, 'resize', { width, blur });

    reply
      .header('Content-Type', 'image/jpeg')
      .header('Content-Length', buffer.length)
      .header('Content-Disposition', `inline; filename="${suggestedFilename}"`)
      .header('X-Image-Width', resizedWidth)
      .header('X-Image-Height', resizedHeight)
      .send(buffer);
  } catch (error) {
    console.error(error);
    reply.code(500).send('Error processing the image');
  } finally {
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (unlinkError) {
        console.error('Error cleaning up temp file:', unlinkError);
      }
    }
  }
});

const start = async () => {
  try {
    fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
