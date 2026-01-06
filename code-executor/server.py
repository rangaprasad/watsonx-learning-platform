#!/usr/bin/env python3
"""
HTTP Server for Code Execution
Accepts POST requests with JSON body containing code to execute
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sys
import io
import contextlib
import traceback
import signal
import resource
import time

class TimeoutException(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutException("Code execution timed out")

def set_resource_limits():
    """Set resource limits to prevent abuse"""
    try:
        # Limit memory to 2GB (increased for watsonx.ai/pandas)
        resource.setrlimit(resource.RLIMIT_AS, (2 * 1024 * 1024 * 1024, 2 * 1024 * 1024 * 1024))
        # Limit CPU time to 30 seconds
        resource.setrlimit(resource.RLIMIT_CPU, (30, 30))
        # Limit number of processes
        resource.setrlimit(resource.RLIMIT_NPROC, (50, 50))
    except:
        pass  # Skip on systems that don't support resource limits

def execute_code(code: str, timeout: int = 30) -> dict:
    """Execute Python code and return results"""
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
        
        with contextlib.redirect_stdout(stdout_capture), \
             contextlib.redirect_stderr(stderr_capture):
            
            # Create safe builtins
            safe_builtins = {
                k: v for k, v in __builtins__.__dict__.items()
                if k not in ['open', 'eval', 'exec', 'compile']
            }
            
            # Safe import function
            original_import = __builtins__.__import__
            
            ALLOWED_MODULES = {
                'json', 'math', 'random', 'datetime', 'time', 'collections',
                'itertools', 'functools', 'operator', 're', 'string', 'os',
                'boto3', 'botocore', 'requests', 'numpy', 'pandas', 'matplotlib', 
                'pillow', 'typing', 'anthropic', 'openai',
                'ibm_watsonx_ai', 'ibm_watson_machine_learning'
            }
            
            def safe_import(name, *args, **kwargs):
                base_module = name.split('.')[0]
                if base_module in ALLOWED_MODULES:
                    return original_import(name, *args, **kwargs)
                raise ImportError(f"Import of '{name}' is not allowed for security reasons")
            
            safe_builtins['__import__'] = safe_import
            
            restricted_globals = {
                "__builtins__": safe_builtins,
                "__name__": "__main__",
                "__doc__": None,
            }
            
            exec(code, restricted_globals)
        
        signal.alarm(0)
        result["output"] = stdout_capture.getvalue()
        
        if len(result["output"]) > 1024 * 1024:
            result["output"] = result["output"][:1024*1024] + "\n... (output truncated)"
        
    except TimeoutException:
        signal.alarm(0)
        result["status"] = "timeout"
        result["error"] = f"Execution exceeded {timeout} second timeout"
        result["output"] = stdout_capture.getvalue()
        
    except Exception as e:
        signal.alarm(0)
        result["status"] = "error"
        result["error"] = traceback.format_exc()
        result["output"] = stdout_capture.getvalue()
    
    finally:
        result["execution_time"] = int((time.time() - start_time) * 1000)
    
    return result

class CodeExecutorHandler(BaseHTTPRequestHandler):
    """HTTP request handler for code execution"""
    
    def do_GET(self):
        """Health check endpoint"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                "status": "ok",
                "service": "code-executor",
                "version": "1.0.0"
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        """Execute code endpoint"""
        if self.path == '/execute':
            try:
                # Read request body
                content_length = int(self.headers['Content-Length'])
                body = self.rfile.read(content_length)
                data = json.loads(body)
                
                code = data.get('code', '')
                timeout = data.get('timeout', 30)
                
                # Validate
                if not code:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Code is required"}).encode())
                    return
                
                if len(code) > 100000:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Code exceeds maximum length"}).encode())
                    return
                
                # Execute code
                result = execute_code(code, timeout)
                
                # Send response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
                
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    """Start HTTP server"""
    set_resource_limits()
    
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    server = HTTPServer(('0.0.0.0', port), CodeExecutorHandler)
    
    print(f"Code Executor Server running on port {port}")
    print("Endpoints:")
    print("  GET  /health  - Health check")
    print("  POST /execute - Execute code")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.shutdown()

if __name__ == "__main__":
    main()
