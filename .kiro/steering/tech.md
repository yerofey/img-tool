# Technology Stack

## Runtime & Package Management
- **Bun** - All-in-one JavaScript runtime with built-in package manager
- **PM2** for production process management

## Core Dependencies
- **Fastify** - High-performance web server framework
- **Sharp** - High-performance image processing
- **Native Fetch** - Built-in HTTP client for image downloads
- **nanoid** - Unique ID generation for temp files
- **dotenv** - Environment variable management
- **image-size** - Image dimension detection
- **piexifjs** - EXIF metadata handling

## Development Tools
- **Bun Test** - Built-in fast test runner with Jest-compatible API
- **Supertest** - HTTP assertion library for API testing
- **PM2** - Production process manager with clustering

## Common Commands

### Development
```bash
bun dev           # Start development server with auto-reload
bun test          # Run tests once
bun test --watch  # Run tests in watch mode
bun test --coverage # Run tests with coverage report
```

### Production
```bash
bun start         # Install dependencies and start with PM2
pm2 restart ecosystem.json --env production
```

### Package Management
```bash
bun install      # Install dependencies
bun add <pkg>     # Add new dependency
bun remove <pkg>  # Remove dependency
```

## Configuration Files
- `ecosystem.json` - PM2 process configuration
- `bunfig.toml` - Bun configuration (optional)
- `.env` - Environment variables (PORT, etc.)
- `.editorconfig` - Code formatting standards