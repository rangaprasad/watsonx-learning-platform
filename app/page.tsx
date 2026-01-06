import Link from 'next/link'
import { ArrowRight, Code, Zap, Trophy, Globe, CheckCircle, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-ibm-blue/10 text-ibm-blue px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>Learn by Doing, Not Just Watching</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Master GenAI with
              <span className="block mt-2 bg-gradient-to-r from-ibm-blue to-ibm-purple bg-clip-text text-transparent">
                Multi-Cloud Hands-On Labs
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Learn IBM watsonx.ai and AWS Bedrock side-by-side. Build real GenAI applications with 
              interactive coding environments, automated validation, and AI-powered tutoring.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/signup" 
                className="bg-ibm-blue text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-ibm-blue-dark transition flex items-center space-x-2 w-full sm:w-auto justify-center"
              >
                <span>Start Free Labs</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/demo" 
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-ibm-blue hover:text-ibm-blue transition w-full sm:w-auto text-center"
              >
                Watch Demo
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No setup required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Instant validation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>AI tutor included</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-ibm-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-ibm-purple/5 rounded-full blur-3xl"></div>
      </section>

      {/* Platform Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Multi-Cloud GenAI Training?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-world developers work with multiple cloud providers. Learn once, deploy anywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Code className="w-6 h-6 text-ibm-blue" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Learn IBM watsonx.ai</h3>
              <p className="text-gray-600 mb-6">
                Master IBM's enterprise-grade GenAI platform with hands-on labs using Granite models, 
                Watson Studio, and AutoAI.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Granite foundation models</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Enterprise AI workflows</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Regulated industry focus</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Compare AWS Bedrock</h3>
              <p className="text-gray-600 mb-6">
                See how the same concepts work on AWS. Understand platform differences and make 
                informed cloud decisions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Claude, Titan, and more</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Side-by-side code comparison</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Certification prep (AIF-C01)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Trophy className="w-6 h-6 text-ibm-purple" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Build Real Skills</h3>
              <p className="text-gray-600 mb-6">
                Go beyond tutorials with production-ready patterns, multi-cloud architectures, and 
                vendor-neutral expertise.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Avoid vendor lock-in</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Enterprise-ready patterns</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Dual certification paths</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From zero to GenAI expert in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-ibm-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Choose Your Lab</h3>
              <p className="text-gray-600">
                Pick from watsonx.ai or AWS Bedrock labs. Start with beginner-friendly tutorials 
                or jump to advanced challenges.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-ibm-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Code in Browser</h3>
              <p className="text-gray-600">
                Write code in our interactive editor with syntax highlighting, autocomplete, 
                and real-time AI assistance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-ibm-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Get Instant Feedback</h3>
              <p className="text-gray-600">
                Run your code and see results immediately. Our automated validation confirms 
                you're on the right track.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link 
              href="/labs" 
              className="inline-flex items-center space-x-2 bg-ibm-blue text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-ibm-blue-dark transition"
            >
              <span>Browse All Labs</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-ibm-blue mb-2">1,000+</div>
              <div className="text-gray-600">Active Learners</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-ibm-blue mb-2">50+</div>
              <div className="text-gray-600">Hands-On Labs</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-ibm-blue mb-2">95%</div>
              <div className="text-gray-600">Completion Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ibm-blue to-ibm-purple">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Master Multi-Cloud GenAI?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers learning the future of AI. Start with free labs today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="bg-white text-ibm-blue px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
            >
              Create Free Account
            </Link>
            <Link 
              href="/pricing" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
