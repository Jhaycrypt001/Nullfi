import NavHeader from "@/components/ui/nav-header";
import { Footer } from "@/components/ui/footer-section";
import { BlurFade } from "@/components/ui/blur-fade";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden pt-20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <NavHeader />
      </nav>

      {/* Header */}
      <section className="py-12 px-4 md:px-8 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <BlurFade inView>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
            <p className="text-lg text-gray-400">
              Complete guide to building with Nullfi on the Sui blockchain
            </p>
          </BlurFade>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <BlurFade inView>
            <div className="space-y-12">
              {/* Getting Started */}
              <div>
                <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    Welcome to Nullfi! This guide will help you deploy your first smart contract on the Sui blockchain.
                  </p>
                  <h3 className="text-xl font-semibold text-white mt-6 mb-2">Prerequisites</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>A Sui wallet (Sui Wallet or compatible wallet)</li>
                    <li>Basic understanding of smart contracts</li>
                    <li>Node.js 18+ installed</li>
                  </ul>
                </div>
              </div>

              {/* Installation */}
              <div>
                <h2 className="text-3xl font-bold mb-4">Installation</h2>
                <div className="space-y-4 text-gray-300">
                  <p>Install the Nullfi CLI to get started:</p>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <code className="text-green-400">npm install -g @nullfi/cli</code>
                  </div>
                </div>
              </div>

              {/* Quick Start */}
              <div>
                <h2 className="text-3xl font-bold mb-4">Quick Start</h2>
                <div className="space-y-4 text-gray-300">
                  <h3 className="text-xl font-semibold text-white mb-2">1. Create a new project</h3>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <code className="text-green-400">nullfi init my-project</code>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2 mt-6">2. Deploy your contract</h3>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <code className="text-green-400">nullfi deploy</code>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2 mt-6">3. Interact with your contract</h3>
                  <p>
                    Use the Nullfi dashboard to interact with your deployed contracts, monitor transactions, and manage permissions.
                  </p>
                </div>
              </div>

              {/* Key Features */}
              <div>
                <h2 className="text-3xl font-bold mb-4">Key Features</h2>
                <div className="space-y-4 text-gray-300">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">⚡ Lightning Fast Deployment</h3>
                    <p>Deploy smart contracts to Sui in seconds with optimized gas costs.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">🔐 Enterprise Security</h3>
                    <p>Multi-signature support, formal verification, and security audits built-in.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">📊 Real-Time Monitoring</h3>
                    <p>Monitor transactions, gas usage, and contract health in real-time.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">🛠️ Developer Friendly</h3>
                    <p>Comprehensive APIs, SDKs, and documentation for all major languages.</p>
                  </div>
                </div>
              </div>

              {/* API Reference */}
              <div>
                <h2 className="text-3xl font-bold mb-4">API Reference</h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    Nullfi provides a comprehensive REST API for programmatic access to all features.
                  </p>
                  <h3 className="text-xl font-semibold text-white mb-2">Base URL</h3>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <code className="text-green-400">https://api.nullfi.io/v1</code>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2 mt-6">Authentication</h3>
                  <p>All requests require an API key in the Authorization header:</p>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <code className="text-green-400">Authorization: Bearer YOUR_API_KEY</code>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div>
                <h2 className="text-3xl font-bold mb-4">Support</h2>
                <div className="space-y-4 text-gray-300">
                  <p>Need help? We're here for you:</p>
                  <ul className="space-y-2">
                    <li>📧 Email: support@nullfi.io</li>
                    <li>💬 Discord: <a href="#" className="text-blue-400 hover:underline">Join our community</a></li>
                    <li>📚 GitHub: <a href="#" className="text-blue-400 hover:underline">View examples</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
