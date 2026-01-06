#!/bin/bash
# Local testing script for code executor

echo "🧪 Testing Code Executor Locally"
echo "================================="

# Test 1: Basic execution
echo ""
echo "Test 1: Basic print statement"
echo '{"code": "print(\"Hello, World!\")", "timeout": 5}' | \
  docker run --rm -i code-executor:latest

# Test 2: With variables
echo ""
echo "Test 2: Variables and math"
echo '{"code": "x = 10\ny = 20\nprint(f\"Sum: {x + y}\")", "timeout": 5}' | \
  docker run --rm -i code-executor:latest

# Test 3: With imports
echo ""
echo "Test 3: Using json library"
echo '{"code": "import json\ndata = {\"name\": \"test\", \"value\": 123}\nprint(json.dumps(data, indent=2))", "timeout": 5}' | \
  docker run --rm -i code-executor:latest

# Test 4: Error handling
echo ""
echo "Test 4: Error handling"
echo '{"code": "raise ValueError(\"This is a test error\")", "timeout": 5}' | \
  docker run --rm -i code-executor:latest

# Test 5: Long output
echo ""
echo "Test 5: Multiple lines of output"
echo '{"code": "for i in range(5):\n    print(f\"Line {i}\")", "timeout": 5}' | \
  docker run --rm -i code-executor:latest

# Test 6: Numpy test
echo ""
echo "Test 6: Using numpy"
echo '{"code": "import numpy as np\narr = np.array([1, 2, 3, 4, 5])\nprint(f\"Array: {arr}\")\nprint(f\"Mean: {arr.mean()}\")", "timeout": 5}' | \
  docker run --rm -i code-executor:latest

echo ""
echo "✅ All tests complete!"
