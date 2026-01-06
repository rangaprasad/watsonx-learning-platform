import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Multi-Cloud GenAI Academy | Learn IBM watsonx.ai & AWS Bedrock",
  description: "Master generative AI with hands-on labs. Learn IBM watsonx.ai and AWS Bedrock side-by-side with interactive coding environments.",
  keywords: ["IBM watsonx.ai", "AWS Bedrock", "GenAI", "AI training", "machine learning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-900 text-white py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Multi-Cloud GenAI Academy</h3>
                <p className="text-gray-400">Learn GenAI concepts once, use them everywhere.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Platform</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/labs" className="hover:text-white">Labs</a></li>
                  <li><a href="/learning-paths" className="hover:text-white">Learning Paths</a></li>
                  <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/docs" className="hover:text-white">Documentation</a></li>
                  <li><a href="/blog" className="hover:text-white">Blog</a></li>
                  <li><a href="/community" className="hover:text-white">Community</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/about" className="hover:text-white">About</a></li>
                  <li><a href="/contact" className="hover:text-white">Contact</a></li>
                  <li><a href="/partners" className="hover:text-white">Partners</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Multi-Cloud GenAI Academy. All rights reserved.</p>
              <p className="mt-2 text-sm">Powered by IBM watsonx.ai and AWS Bedrock</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
