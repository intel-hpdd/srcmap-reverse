// @flow

import { describe, it, expect } from './jasmine.js';

describe('getPort', () => {
  afterEach(() => {
    delete process.env.LISTEN_PID;
    delete process.env.SRCMAP_REVERSE_PORT;
  });

  describe('when using systemd', () => {
    it('should return the file descriptor', () => {
      process.env.LISTEN_PID = '1';
      const port = require('../source/port.js').getPort();
      expect(port).toEqual({ fd: 3 });
    });
  });

  describe('when not using systemd but a port is defined', () => {
    it('should return the port number', () => {
      process.env.SRCMAP_REVERSE_PORT = '8080';
      const port = require('../source/port.js').getPort();
      expect(port).toBe(8080);
    });
  });

  describe('when not using systemd and a port is not defined', () => {
    it('should throw an error', () => {
      expect(() => require('../source/port.js').getPort()).toThrow(
        new Error(
          'If srcmap-reverse is not running in systemd, the SRCMAP_REVERSE_PORT environment variable is required.'
        )
      );
    });
  });
});
