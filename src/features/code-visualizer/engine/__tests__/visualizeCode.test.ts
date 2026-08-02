import { describe, expect, it } from 'vitest';
import { CODE_LIMITS, CodeGuardrailError, visualizeCode } from '../visualizeCode';

describe('safe code visualizer', () => {
  it('traces state and sorts an array without evaluating user code', () => {
    const result = visualizeCode(`
      const values = [4, 1, 3, 2];
      for (let pass = 0; pass < values.length; pass++) {
        for (let i = 0; i < values.length - pass - 1; i++) {
          if (values[i] > values[i + 1]) {
            const temp = values[i];
            values[i] = values[i + 1];
            values[i + 1] = temp;
          }
        }
      }
    `);

    expect(result.frames.at(-1)?.variables.values).toEqual([1, 2, 3, 4]);
    expect(result.frames.length).toBeLessThanOrEqual(CODE_LIMITS.traceFrames);
    expect(result.metrics.loopIterations).toBeGreaterThan(0);
  });

  it('supports bounded array helpers and console output', () => {
    const result = visualizeCode(`
      const sequence = [0, 1];
      for (let i = 2; i < 7; i++) {
        sequence.push(sequence[i - 1] + sequence[i - 2]);
      }
      console.log(sequence);
    `);

    expect(result.frames.at(-1)?.variables.sequence).toEqual([0, 1, 1, 2, 3, 5, 8]);
    expect(result.frames.at(-1)?.output).toEqual(['[0, 1, 1, 2, 3, 5, 8]']);
  });

  it('rejects source that is too long', () => {
    expect(() => visualizeCode(`let value = 0; // ${'x'.repeat(CODE_LIMITS.sourceCharacters)}`)).toThrow(CodeGuardrailError);
  });

  it('stops non-terminating loops', () => {
    expect(() => visualizeCode('let i = 0; while (true) { i++; }')).toThrow(/exceeded|trace steps/i);
  });

  it('stops collection growth at the memory boundary', () => {
    expect(() => visualizeCode(`
      const values = [];
      for (let i = 0; i < 200; i++) values.push(i);
    `)).toThrow(/Collections are limited/i);
  });

  it('rejects arbitrary browser and function execution', () => {
    expect(() => visualizeCode('fetch("https://example.com");')).toThrow(/Function calls/i);
    expect(() => visualizeCode('function run() { return 1; } run();')).toThrow(/not supported/i);
  });
});
