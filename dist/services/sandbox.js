import vm from "node:vm";
/**
 * Executes user-provided JavaScript code inside a secure, constrained V8 VM context.
 * Enforces a CPU timeout limit (defaults to 200ms) to prevent event-loop locks.
 */
export function runInSandbox(code, contextData, timeoutMs = 200) {
    try {
        // Isolate variables scope by deep-copying input data
        const sandbox = {
            context: JSON.parse(JSON.stringify(contextData)),
            result: {},
            console: {
                log: (...args) => {
                    // Captures debug logs if required in the future
                },
            },
        };
        // Create secure V8 context (purges globals like process, require, module)
        const vmContext = vm.createContext(sandbox);
        // Wrap the user's code in an IIFE so they can write top-level "return" statements
        const wrappedCode = `
      result = (function(context) {
        ${code}
      })(context);
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
    }
    catch (error) {
        return {
            success: false,
            data: null,
            error: error.message || "Execution error or timeout",
        };
    }
}
