import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';

describe('Application Startup', () => {
  let serverProcess;

  afterEach(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should start server on default port', (done) => {
    serverProcess = spawn('node', ['index.js'], {
      env: { ...process.env, PORT: '3001' }
    });

    let output = '';
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('Server listening on port 3001')) {
        done();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      if (serverProcess) {
        serverProcess.kill();
        done(new Error('Server startup timeout'));
      }
    }, 5000);
  });

  it('should handle environment variables', (done) => {
    serverProcess = spawn('node', ['index.js'], {
      env: { ...process.env, PORT: '3002', NODE_ENV: 'test' }
    });

    let output = '';
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('Server listening on port 3002')) {
        done();
      }
    });

    setTimeout(() => {
      if (serverProcess) {
        serverProcess.kill();
        done(new Error('Server startup timeout'));
      }
    }, 5000);
  });
});