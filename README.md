# img-tool

A lightweight, high-performance image processing server built with Bun, Fastify, and Sharp. Provides image resizing, blurring, and format conversion capabilities via a simple HTTP API.

## Features

- **Image Resizing**: Resize images to specified width while maintaining aspect ratio
- **Image Blurring**: Apply blur effects with configurable radius
- **Format Conversion**: Convert JPEG/PNG images to WebP format
- **Format Support**: Handles JPEG, PNG, and WebP images
- **Metadata Preservation**: Maintains image metadata during processing
- **Performance**: Built with Fastify and Sharp for maximum performance
- **Production Ready**: PM2 clustering support for scalability

## Installation

### Prerequisites
- Bun runtime (v1.0 or higher)

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd img-tool

# Install dependencies
bun install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

## Usage

### Development
```bash
bun dev
```
Server will start on `http://localhost:3000` with auto-reload enabled.

### Production
```bash
bun start
```
Starts the server using PM2 with clustering for better performance.

## API Reference

### Convert to WebP
Convert JPEG or PNG images to WebP format for better compression.

**Endpoint:** `GET /convert`

**Parameters:**
- `image` (required) - URL of the image to convert
- `quality` (optional) - WebP quality (1-100, default: 80)

**Response:**
- Returns the converted image as binary data
- Content-Type: `image/webp`
- Custom headers:
  - `Content-Disposition`: Suggested filename based on original URL
  - `X-Image-Width`: Image width
  - `X-Image-Height`: Image height
  - `X-Original-Format`: Original image format (.jpg, .png)

### Resize Image
Resize and optionally blur images from a URL.

**Endpoint:** `GET /resize`

**Parameters:**
- `image` (required) - URL of the image to process
- `width` (required) - Target width in pixels
- `blur` (optional) - Blur radius (0-100)

**Response:**
- Returns the processed image as binary data
- Content-Type: `image/jpeg`
- Custom headers:
  - `Content-Disposition`: Suggested filename based on original URL
  - `X-Image-Width`: Processed image width
  - `X-Image-Height`: Processed image height

### Examples

#### Basic Resize
```bash
curl "http://localhost:3000/resize?image=https://example.com/photo.jpg&width=800" \
  --output resized.jpg
```

#### Resize with Blur
```bash
curl "http://localhost:3000/resize?image=https://example.com/photo.jpg&width=400&blur=5" \
  --output blurred.jpg
```

#### Convert to WebP
```bash
curl "http://localhost:3000/convert?image=https://example.com/photo.jpg" \
  --output converted.webp
```

#### Convert to WebP with Custom Quality
```bash
curl "http://localhost:3000/convert?image=https://example.com/photo.png&quality=90" \
  --output high-quality.webp
```

#### Using in HTML
```html
<!-- Resize image -->
<img src="http://localhost:3000/resize?image=https://example.com/photo.jpg&width=300" 
     alt="Resized image">

<!-- Convert to WebP -->
<img src="http://localhost:3000/convert?image=https://example.com/photo.jpg&quality=85" 
     alt="WebP image">
```

#### JavaScript Fetch
```javascript
// Resize image
const resizeResponse = await fetch('/resize?image=https://example.com/photo.jpg&width=600');
const resizedBlob = await resizeResponse.blob();
const resizedUrl = URL.createObjectURL(resizedBlob);

// Convert to WebP
const convertResponse = await fetch('/convert?image=https://example.com/photo.jpg&quality=85');
const webpBlob = await convertResponse.blob();
const webpUrl = URL.createObjectURL(webpBlob);

// Get suggested filename from response headers
const suggestedName = convertResponse.headers.get('content-disposition')
  ?.match(/filename="([^"]+)"/)?.[1] || 'converted.webp';
```

#### Filename Examples
The server automatically suggests meaningful filenames based on the original URL:

- **Resize**: `photo.jpg` → `photo_800w.jpg` (width: 800)
- **Resize with blur**: `photo.jpg` → `photo_400w_blur5.jpg` (width: 400, blur: 5)
- **Convert**: `photo.jpg` → `photo.webp` (default quality)
- **Convert with quality**: `photo.png` → `photo_q90.webp` (quality: 90)

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

### PM2 Configuration
The `ecosystem.json` file configures PM2 for production deployment:

```json
{
  "apps": [{
    "name": "img-tool",
    "script": "./index.js",
    "instances": 1,
    "exec_mode": "cluster",
    "env_production": {
      "NODE_ENV": "production"
    }
  }]
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Invalid parameters (missing image or width)
- `500` - Server error (image processing failed)

## Performance Notes

- Images are temporarily downloaded to the `files/` directory
- Temporary files are automatically cleaned up after processing
- Fastify provides high-performance HTTP server with low overhead
- Sharp library provides optimized image processing
- PM2 clustering enables horizontal scaling

## Development

### Testing
```bash
# Run tests once
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage report
bun test:coverage

# Run integration tests (requires running server)
bun test:integration
```

The project uses **Bun Test** for fast, modern testing with built-in support:
- **Unit Tests**: Test utility functions in isolation
- **API Tests**: Test HTTP endpoints with mocked dependencies  
- **Integration Tests**: End-to-end tests with real image processing (optional)
- **Coverage**: Built-in coverage reporting

### Code Style
- 2-space indentation for JavaScript/JSON
- Single quotes preferred
- ES modules syntax
- Async/await for asynchronous operations

### Project Structure
```
├── index.js          # Main server application
├── src/
│   └── utils.js      # Image processing utilities
├── __tests__/        # Test files
│   ├── utils.test.js     # Unit tests
│   ├── server.test.js    # API tests
│   └── integration.test.js # Integration tests
├── files/            # Temporary file storage
├── bunfig.toml       # Bun configuration (optional)
├── ecosystem.json    # PM2 configuration
└── package.json      # Dependencies and scripts
```

## License

MIT
