import Link from 'next/link'
import { Check, Zap, Star, Building } from 'lucide-react'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with GenAI',
    icon: Zap,
    color: 'gray',
    cta: 'Start Free',
    href: '/signup',
    features: [
      'IBM watsonx.ai labs (3 labs)',
      'Knowledge articles',
      'Community Discord access',
      'Basic quizzes',
      'Learn at your own pace',
    ],
  },
  {
    name: 'Standard',
    price: '$29',
    period: 'per month',
    description: 'Full access to certification prep',
    icon: Star,
    color: 'blue',
    popular: true,
    cta: 'Start Standard',
    href: '/signup?tier=standard',
    features: [
      'Everything in Free',
      '15 watsonx.ai labs',
      '10 AWS Bedrock labs',
      'Skill assessments',
      'Certification prep (AWS AIF-C01)',
      'Progress tracking',
      'Lab completion certificates',
    ],
  },
  {
    name: 'Pro',
    price: '$79',
    period: 'per month',
    description: 'Advanced labs and AI assistance',
    icon: Star,
    color: 'purple',
    cta: 'Start Pro',
    href: '/signup?tier=pro',
    features: [
      'Everything in Standard',
      'All 50+ hands-on labs',
      'Advanced challenge labs',
      'Mock examinations (full-length)',
      'AI-assisted coding (real-time)',
      'Unlimited AWS sandbox access',
      'Priority support',
      '1 user license transfer/year',
    ],
  },
  {
    name: 'Business',
    price: '$299',
    period: 'per seat/year',
    description: 'For teams and enterprises',
    icon: Building,
    color: 'indigo',
    cta: 'Contact Sales',
    href: '/contact',
    features: [
      'Everything in Pro',
      'Enterprise dashboard',
      'Team progress reporting',
      'Centralized billing',
      'SSO integration',
      'Custom learning paths',
      'Dedicated account support',
      'Guided team onboarding',
      'Exclusive enterprise resources',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free and upgrade as you grow. All plans include hands-on labs with instant validation.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {tiers.map((tier) => {
            const Icon = tier.icon
            return (
              <div
                key={tier.name}
                className={`bg-white rounded-2xl shadow-sm border-2 ${
                  tier.popular ? 'border-ibm-blue' : 'border-gray-200'
                } overflow-hidden relative`}
              >
                {tier.popular && (
                  <div className="bg-ibm-blue text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="p-6">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    tier.color === 'blue' ? 'bg-blue-100' :
                    tier.color === 'purple' ? 'bg-purple-100' :
                    tier.color === 'indigo' ? 'bg-indigo-100' :
                    'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      tier.color === 'blue' ? 'text-ibm-blue' :
                      tier.color === 'purple' ? 'text-ibm-purple' :
                      tier.color === 'indigo' ? 'text-indigo-600' :
                      'text-gray-600'
                    }`} />
                  </div>

                  {/* Name & Price */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {tier.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-gray-600 ml-2">{tier.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">
                    {tier.description}
                  </p>

                  {/* CTA Button */}
                  <Link
                    href={tier.href}
                    className={`block w-full text-center py-3 rounded-lg font-semibold transition mb-6 ${
                      tier.popular
                        ? 'bg-ibm-blue text-white hover:bg-ibm-blue-dark'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {tier.cta}
                  </Link>

                  {/* Features */}
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-16">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Detailed Feature Comparison
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Free
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Standard
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Pro
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Business
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    IBM watsonx.ai Labs
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">3</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">15</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">50+</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">50+</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    AWS Bedrock Labs
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">10</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">20+</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">20+</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    Mock Examinations
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-400">-</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    AI Tutor Assistance
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-400">-</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-400">-</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    Team Dashboard
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-400">-</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-400">-</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-400">-</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer student discounts?
              </h3>
              <p className="text-gray-600">
                Yes, we offer 50% off Standard and Pro plans for verified students. Contact us for details.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What's included in the Free tier?
              </h3>
              <p className="text-gray-600">
                The Free tier includes 3 hands-on labs with IBM watsonx.ai, knowledge articles, and community access. 
                No credit card required.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-ibm-blue to-ibm-purple rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers mastering GenAI. Start with free labs today, no credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-ibm-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  )
}
