// jsdom lacks TextEncoder/TextDecoder, which react-router requires.
const { TextEncoder, TextDecoder } = require('node:util');
globalThis.TextEncoder ??= TextEncoder;
globalThis.TextDecoder ??= TextDecoder;
