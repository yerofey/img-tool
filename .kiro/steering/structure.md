# Project Structure

## Root Level
- `index.js` - Main application entry point and Express server
- `package.json` - Project dependencies and scripts
- `vitest.config.js` - Test configuration and coverage settings
- `ecosystem.json` - PM2 process manager configuration
- `.env` - Environment variables (not tracked in git)

## Source Organization
```
src/
├── utils.js          # Utility functions for image processing

__tests__/
├── utils.test.js     # Unit tests for utility functions
├── server.test.js    # API endpoint tests with mocking
└── integration.test.js # End-to-end integration tests (disabled by default)
```

## Utility Functions (`src/utils.js`)
- `downloadImage()` - Download images from URLs to temp files
- `getFileSizeInKB()` - Calculate file size in kilobytes
- `getImageDimensions()` - Extract image width/height
- `getImageRotation()` - Read EXIF orientation data

## File Storage
```
files/
├── .gitkeep          # Keeps directory in git
└── temp_*.jpg        # Temporary downloaded images (auto-cleaned)
```

## Architecture Patterns

### Single Responsibility
- Main server logic in `index.js`
- Utility functions separated in `src/utils.js`
- Clean separation between HTTP handling and image processing

### Error Handling
- Try-catch blocks for all async operations
- Proper HTTP status codes (400, 500)
- Cleanup of temporary files in finally blocks

### Temporary File Management
- Unique filenames using nanoid
- Automatic cleanup after processing
- Centralized temp directory (`files/`)

### Testing Strategy
- **Unit Tests**: Test individual utility functions in isolation
- **API Tests**: Test HTTP endpoints with mocked dependencies
- **Integration Tests**: End-to-end tests with real image processing (optional)
- **Coverage**: Comprehensive coverage reporting with v8 provider

### Code Style (from .editorconfig)
- 2-space indentation for JS/JSON
- Single quotes preferred
- LF line endings
- UTF-8 encoding