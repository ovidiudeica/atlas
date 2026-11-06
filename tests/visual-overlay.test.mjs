import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

test('SVG overlay coordinates are in the same viewport as MapLibre project()', () => {
  assert.match(app, /const\s+\[projectionSize,setProjectionSize\]/);
  assert.match(app, /instance\.getContainer\(\)\.getBoundingClientRect\(\)/);
  assert.match(app, /setProjectionSize\(\{width:bounds\.width,height:bounds\.height\}\)/);
  assert.match(app, /viewBox=\{\x60?[^\n]*projectionSize\.width[^\n]*projectionSize\.height/);
  assert.match(app, /preserveAspectRatio="none"/);
});

test('projected territories are synchronized after map movement and resize', () => {
  assert.match(app, /instance\.on\('move',syncOutline\)/);
  assert.match(app, /instance\.on\('resize',syncOutline\)/);
  assert.match(app, /instance\.on\('idle',syncOutline\)/);
});
