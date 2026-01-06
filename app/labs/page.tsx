import Link from 'next/link'
import { Clock, Award, Code2, Filter } from 'lucide-react'

const labs = [
  {
    id: 'watsonx-first-call',
    title: 'Your First watsonx.ai API Call',
    platform: 'watsonx',
    difficulty: 'beginner',
    duration: '15 min',
    description: 'Learn the basics of calling IBM watsonx.ai foundation models with a simple text generation example.',
    tier: 'free',
    completed: false,
  },
  {
    id: 'watsonx-parameters',
    title: 'Understanding Model Parameters',
    platform: 'watsonx',
    difficulty: 'beginner',
    duration: '20 min',
    description: 'Explore temperature, max_tokens, and other parameters that control model behavior.',
    tier: 'free',
    completed: false,
  },
  {
    id: 'watsonx-chatbot',
    title: 'Build a Simple Chatbot',
    platform: 'watsonx',
    difficulty: 'intermediate',
    duration: '30 min',
    description: 'Create a multi-turn conversational agent using IBM Granite models.',
    tier: 'standard',
    completed: false,
  },
  {
    id: 'bedrock-first-call',
    title: 'Your First AWS Bedrock API Call',
    platform: 'bedrock',
    difficulty: 'beginner',
    duration: '15 min',
    description: 'Learn how to call AWS Bedrock foundation models and compare with watsonx.ai.',
    tier: 'standard',
    completed: false,
  },
  {
    id: 'watsonx-rag',
    title: 'RAG Implementation with watsonx.ai',
    platform: 'watsonx',
    difficulty: 'advanced',
    duration: '45 min',
    description: 'Build a Retrieval-Augmented Generation pipeline with Watson Discovery.',
    tier: 'pro',
    completed: false,
  },
  {
    id: 'bedrock-rag',
    title: 'RAG Implementation with Bedrock',
    platform: 'bedrock',
    difficulty: 'advanced',
    duration: '45 min',
    description: 'Build a RAG pipeline using AWS Bedrock Knowledge Bases and S3.',
    tier: 'pro',
    completed: false,
  },
]

export default function LabsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hands-On Labs
          </h1>
          <p className="text-xl text-gray-600">
            Learn by doing with interactive coding environments. Choose from IBM watsonx.ai or AWS Bedrock labs.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-ibm-blue text-white rounded-lg text-sm font-medium">
                  All
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                  watsonx.ai
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                  AWS Bedrock
                </button>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                Beginner
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                Intermediate
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                Advanced
              </button>
            </div>
          </div>
        </div>

        {/* Labs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.map((lab) => (
            <Link
              key={lab.id}
              href={`/labs/${lab.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
            >
              {/* Lab Card Header */}
              <div className={`h-2 ${
                lab.platform === 'watsonx' ? 'bg-ibm-blue' : 'bg-orange-500'
              }`}></div>
              
              <div className="p-6">
                {/* Badges */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    lab.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    lab.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {lab.difficulty.charAt(0).toUpperCase() + lab.difficulty.slice(1)}
                  </span>
                  {lab.tier === 'free' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Free
                    </span>
                  ) : lab.tier === 'standard' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Standard
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Pro
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-ibm-blue transition">
                  {lab.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {lab.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{lab.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Code2 className="w-4 h-4" />
                      <span>{lab.platform === 'watsonx' ? 'watsonx.ai' : 'Bedrock'}</span>
                    </div>
                  </div>
                  {lab.completed && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Award className="w-4 h-4" />
                      <span className="text-xs font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Start Button */}
              <div className="px-6 pb-6">
                <button className="w-full bg-gray-50 text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-100 transition group-hover:bg-ibm-blue group-hover:text-white">
                  {lab.completed ? 'Review Lab' : 'Start Lab'}
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-ibm-blue to-ibm-purple rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Want Access to All Labs?
          </h2>
          <p className="text-lg text-blue-100 mb-6">
            Upgrade to Standard or Pro to unlock advanced labs and certification prep.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-white text-ibm-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </div>
  )
}
