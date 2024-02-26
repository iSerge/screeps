import { SourceMapConsumer } from "source-map";

// Cache consumer
let consumer: SourceMapConsumer | null = null;

function getConsumer(): SourceMapConsumer {
  if (consumer == null) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-var-requires
    consumer = new SourceMapConsumer(require("main.js.map"));
  }

  return consumer;
}

const cache: { [key: string]: string } = {};

/**
 * Generates a stack trace using a source map generate original symbol names.
 *
 * WARNING - EXTREMELY high CPU cost for first call after reset - >30 CPU! Use sparingly!
 * (Consecutive calls after a reset are more reasonable, ~0.1 CPU/ea)
 *
 * @param {Error | string} error The error or original stack trace
 * @returns {string} The source-mapped stack trace
 */
function sourceMappedStackTrace(error: Error | string): string {
  const stack: string = error instanceof Error ? (error.stack as string) : error;
  if (Object.prototype.hasOwnProperty.call(cache, stack)) {
    return cache[stack];
  }

  // eslint-disable-next-line no-useless-escape
  const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm;
  let outStack = error.toString();

  const match = re.exec(stack);
  while (match) {
    if (match[2] === "main") {
      const pos = getConsumer().originalPositionFor({
        column: parseInt(match[4], 10),
        line: parseInt(match[3], 10)
      });

      if (pos.line != null) {
        if (pos.name) {
          outStack += `\n    at ${pos.name} (${pos.source}:${pos.line}:${pos.column})`;
        } else {
          if (match[1]) {
            // no original source file name known - use file name from given trace
            outStack += `\n    at ${match[1]} (${pos.source}:${pos.line}:${pos.column})`;
          } else {
            // no original source file name known or in given trace - omit name
            outStack += `\n    at ${pos.source}:${pos.line}:${pos.column}`;
          }
        }
      } else {
        // no known position
        break;
      }
    } else {
      // no more parseable lines
      break;
    }
  }

  cache[stack] = outStack;
  return outStack;
}

export const wrapLoop = (loop: () => void) => {
  return () => {
    try {
      loop();
    } catch (e) {
      if (e instanceof Error) {
        if ("sim" in Game.rooms) {
          const message = `Source maps don't work in the simulator - displaying original error`;
          console.log(`<span style='color:red'>${message}<br>${_.escape(e.stack)}</span>`);
        } else {
          console.log(`<span style='color:red'>${_.escape(sourceMappedStackTrace(e))}</span>`);
        }
      } else {
        // can't handle it
        throw e;
      }
    }
  };
};
