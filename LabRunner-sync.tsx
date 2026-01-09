/**
 * Enhanced LabRunner Component
 * 
 * Includes:
 * - Video context display
 * - Section progress
 * - Continue video button
 * - Timestamp awareness
 */

'use client'

import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Play, RotateCcw, Lightbulb, CheckCircle, XCircle, Loader2, Video, ArrowRight } from 'lucide-react'

interface LabRunnerProps {
  labData: {
    id: string
    title: string
    fullTitle?: string
    difficulty: string
    description: string
    starterCode: string
    platform: 'watsonx' | 'bedrock'
    videoId?: string | null
    timestamp?: number
    topic?: string | null
    sectionNumber?: number
    totalSections?: number
  }
}

export default function LabRunner({ labData }: LabRunnerProps) {
  const [code, setCode] = useState(labData.starterCode)
  const [output, setOutput] = useState('')
  const [validationResult, setValidationResult] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const hasVideoContext = !!labData.videoId

  const handleRunCode = async () => {
    setIsRunning(true)
    setValidationResult(null)
    setOutput('Running your code...')

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: 'python',
          timeout: 30,
        }),
      })

      const result = await response.json()
      
      if (result.status === 'success') {
        setOutput(result.output || 'Code executed successfully (no output)')
      } else if (result.status === 'error') {
        setOutput(`❌ Error:\n${result.error}`)
      } else if (result.status === 'timeout') {
        setOutput(`⏱️ Timeout: Code execution exceeded 30 seconds`)
      } else {
        setOutput(`Unknown result: ${JSON.stringify(result)}`)
      }
      
      setValidationResult(result.validation || null)
    } catch (error) {
      setOutput(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nMake sure the API is running.`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setCode(labData.starterCode)
    setOutput('')
    setValidationResult(null)
    setShowHint(false)
  }

  const handleContinueVideo = () => {
    if (!labData.videoId) return
    
    // Open YouTube with timestamp
    const currentTimestamp = labData.timestamp || 0
    const resumeTimestamp = currentTimestamp + 30 // Resume 30 seconds after lab started
    const youtubeUrl = `https://www.youtube.com/watch?v=${labData.videoId}&t=${resumeTimestamp}s`
    
    window.open(youtubeUrl, '_blank')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Video Context Banner */}
            {hasVideoContext && (
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                <Video className="w-4 h-4" />
                <span>From video: {labData.topic || 'Tutorial'}</span>
                {labData.timestamp && (
                  <span className="text-gray-400">• {formatTimestamp(labData.timestamp)}</span>
                )}
              </div>
            )}

            <h1 className="text-2xl font-bold text-gray-900">{labData.title}</h1>
            
            {/* Section Progress */}
            {labData.sectionNumber && labData.totalSections && (
              <div className="mt-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">
                    Section {labData.sectionNumber} of {labData.totalSections}
                  </span>
                  <div className="flex-1 max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${(labData.sectionNumber / labData.totalSections) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.round((labData.sectionNumber / labData.totalSections) * 100)}%
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                labData.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                labData.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {labData.difficulty.charAt(0).toUpperCase() + labData.difficulty.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                labData.platform === 'watsonx' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {labData.platform === 'watsonx' ? 'IBM watsonx.ai' : 'AWS Bedrock'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasVideoContext && (
              <button
                onClick={handleContinueVideo}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Video className="w-4 h-4" />
                <span>Continue Video</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Hint</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Instructions Panel */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-6">
          <h2 className="text-lg font-semibold mb-4">Instructions</h2>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-gray-700">{labData.description}</div>
          </div>

          {showHint && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Hint</h3>
                  <p className="text-sm text-yellow-800">
                    Look for the TODO comments in the code. Each TODO indicates a section you need to complete.
                    Replace the <code className="bg-yellow-100 px-1 rounded">___</code> placeholders with the appropriate code.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold mb-3">Lab Resources</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>API Key:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">Provided automatically</code>
              </div>
              <div className="flex items-center justify-between">
                <span>Project ID:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">lab-{labData.id}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 border-b border-gray-200">
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>

          {/* Output Panel */}
          <div className="h-1/3 bg-gray-900 text-white overflow-auto">
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 text-sm font-medium">
              Output
            </div>
            <div className="p-4">
              {validationResult && (
                <div className={`mb-4 p-3 rounded-lg flex items-start space-x-2 ${
                  validationResult.passed 
                    ? 'bg-green-500/20 border border-green-500/50' 
                    : 'bg-red-500/20 border border-red-500/50'
                }`}>
                  {validationResult.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {validationResult.passed ? 'Success!' : 'Not quite right'}
                    </div>
                    <div className="text-sm mt-1 opacity-90">
                      {validationResult.feedback}
                    </div>
                  </div>
                </div>
              )}
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {output || 'Output will appear here when you run your code.'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
