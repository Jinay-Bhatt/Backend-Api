import vm from "node:vm";

export interface SandboxResult {
  success: boolean;
  data: any;
  error?: string;
}

/**
 * Executes user-provided JavaScript code inside a secure, constrained V8 VM context.
 * Enforces a CPU timeout limit (defaults to 200ms) to prevent event-loop locks.
 */
export function runInSandbox(
  code: string,
  contextData: any,
  timeoutMs = 200
): SandboxResult {
  try {
    // Isolate variables scope by deep-copying input data
    const sandbox = {
      context: JSON.parse(JSON.stringify(contextData)),
      result: {},
      console: {
        log: (...args: any[]) => {
          // Captures debug logs if required in the future
        },
      },
    };

    // Create secure V8 context (purges globals like process, require, module)
    const vmContext = vm.createContext(sandbox);

    // Wrap the user's code in an IIFE so they can write top-level "return" statements.
    // If the function returns a value (explicit return), we assign it to result.
    // If the function returns undefined (implicit return), we preserve whatever was assigned to result directly.
    const wrappedCode = `
      const fnResult = (function(context) {
        ${code}
      })(context);
      if (fnResult !== undefined) {
        result = fnResult;
      }
    `;


    const script = new vm.Script(wrappedCode);
    script.runInContext(vmContext, {
      timeout: timeoutMs,
      breakOnSigint: true, // Allow SIGINT interrupts
    });

    return {
      success: true,
      data: vmContext.result,
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message || "Execution error or timeout",
    };
  }
}
