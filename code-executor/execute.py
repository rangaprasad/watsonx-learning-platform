#!/usr/bin/env python3
"""
Secure Python Code Executor
Runs user code in isolated environment with timeout and resource limits
"""

import sys
import io
import contextlib
import json
import traceback
import signal
import resource
from typing import Dict, Any
import time

class TimeoutException(Exception):
    """Raised when code execution times out"""
    pass

def timeout_handler(signum, frame):
    """Handle execution timeout"""
    raise TimeoutException("Code execution timed out")

def set_resource_limits():
    """Set resource limits to prevent abuse"""
    # Limit memory to 2GB (increased for watsonx.ai/pandas)
    resource.setrlimit(resource.RLIMIT_AS, (2 * 1024 * 1024 * 1024, 2 * 1024 * 1024 * 1024))
    
    # Limit CPU time to 30 seconds
    resource.setrlimit(resource.RLIMIT_CPU, (30, 30))
    
    # Limit number of processes (increased for numpy/pandas multi-threading)
    resource.setrlimit(resource.RLIMIT_NPROC, (50, 50))

def execute_code(code: str, timeout: int = 30) -> Dict[str, Any]:
    """
    Execute Python code and capture output/errors
    
    Args:
        code: Python code to execute
        timeout: Maximum execution time in seconds
    
    Returns:
        Dict with status, output, error, execution_time
    """
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    
    result = {
        "status": "success",
        "output": "",
        "error": "",
        "execution_time": 0
    }
    
    start_time = time.time()
    
    try:
        # Set timeout alarm
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(timeout)
        
        # Redirect stdout/stderr
        with contextlib.redirect_stdout(stdout_capture), \
             contextlib.redirect_stderr(stderr_capture):
            
            # Create restricted globals (security)
            # Allow most built-ins but block dangerous ones
            safe_builtins = {
                k: v for k, v in __builtins__.__dict__.items()
                if k not in ['open', 'eval', 'exec', 'compile']
            }
            
            # Create safe import function that allows specific modules
            original_import = __builtins__.__import__
            
            ALLOWED_MODULES = {
                'json', 'math', 'random', 'datetime', 'time', 'collections',
                'itertools', 'functools', 'operator', 're', 'string', 'os',
                'boto3', 'botocore', 'requests', 'numpy', 'pandas', 'matplotlib', 
                'pillow', 'typing', 'anthropic', 'openai',
                'ibm_watsonx_ai', 'ibm_watson_machine_learning'
            }
            
            def safe_import(name, *args, **kwargs):
                # Allow imports from allowed list
                base_module = name.split('.')[0]
                if base_module in ALLOWED_MODULES:
                    return original_import(name, *args, **kwargs)
                # Block dangerous modules
                raise ImportError(f"Import of '{name}' is not allowed for security reasons")
            
            safe_builtins['__import__'] = safe_import
            
            restricted_globals = {
                "__builtins__": safe_builtins,
                "__name__": "__main__",
                "__doc__": None,
            }
            
            # Execute code
            exec(code, restricted_globals)
        
        # Cancel alarm
        signal.alarm(0)
        
        # Capture output
        result["output"] = stdout_capture.getvalue()
        
        # Limit output size to 1MB
        if len(result["output"]) > 1024 * 1024:
            result["output"] = result["output"][:1024*1024] + "\n... (output truncated)"
        
    except TimeoutException:
        signal.alarm(0)
        result["status"] = "timeout"
        result["error"] = f"Execution exceeded {timeout} second timeout"
        result["output"] = stdout_capture.getvalue()
        
    except MemoryError:
        signal.alarm(0)
        result["status"] = "error"
        result["error"] = "MemoryError: Code exceeded 512MB memory limit"
        result["output"] = stdout_capture.getvalue()
        
    except Exception as e:
        signal.alarm(0)
        result["status"] = "error"
        result["error"] = traceback.format_exc()
        result["output"] = stdout_capture.getvalue()
    
    finally:
        result["execution_time"] = int((time.time() - start_time) * 1000)  # milliseconds
    
    return result

def main():
    """Main entry point - read from stdin and execute"""
    try:
        # Read input JSON
        input_data = json.loads(sys.stdin.read())
        code = input_data.get('code', '')
        timeout = input_data.get('timeout', 30)
        
        # Validate code length
        if len(code) > 100000:  # 100KB max
            print(json.dumps({
                "status": "error",
                "error": "Code exceeds maximum length of 100KB",
                "output": "",
                "execution_time": 0
            }))
            return
        
        # Set resource limits (Linux only)
        try:
            set_resource_limits()
        except:
            pass  # Skip on non-Linux systems
        
        # Execute code
        result = execute_code(code, timeout)
        
        # Output JSON result
        print(json.dumps(result))
        
    except json.JSONDecodeError:
        print(json.dumps({
            "status": "error",
            "error": "Invalid JSON input",
            "output": "",
            "execution_time": 0
        }))
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "error": f"Executor error: {str(e)}",
            "output": "",
            "execution_time": 0
        }))

if __name__ == "__main__":
    main()
