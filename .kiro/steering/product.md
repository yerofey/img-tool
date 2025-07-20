# Product Overview

img-tool is a lightweight image processing server that provides image resizing, blurring, and format conversion capabilities via HTTP API.

## Core Functionality
- **Image Resizing**: Resize images to specified width while maintaining aspect ratio
- **Image Blurring**: Apply blur effects with configurable radius
- **Format Conversion**: Convert JPEG/PNG images to WebP format for better compression
- **Format Support**: Handles JPEG, PNG, and WebP images
- **Metadata Preservation**: Maintains image metadata during processing

## API Endpoints
- `GET /resize` - Image resizing and blurring endpoint
  - Required: `image` (URL), `width` (pixels)
  - Optional: `blur` (radius)
  - Returns processed image with custom headers for dimensions
- `GET /convert` - Format conversion endpoint
  - Required: `image` (URL)
  - Optional: `quality` (1-100, default: 80)
  - Returns WebP image with original format info in headers

## Use Cases
- Image optimization for web applications
- Thumbnail generation
- Privacy-focused image blurring
- Format conversion for better web performance
- Batch image processing via API calls