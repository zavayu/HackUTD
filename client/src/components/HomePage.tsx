import { Zap, Brain, Sparkles, BarChart3 } from 'lucide-react';


interface HomePageProps {
  onGetStarted: () => void;
}


export function HomePage({ onGetStarted }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Prodigy PM</span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:opacity-90 transition-all font-medium text-sm"
          >
            Get started free →
          </button>
        </div>
      </nav>
     
      <div style={{ height: '120px' }}></div>

      <div style={{ height: '80px' }}></div>

      {/* Hero */}
      <section className="pt-0 pb-60 px-6 flex-1 overflow-visible">
        <div className="max-w-6xl mx-auto text-center overflow-visible">
          {/* Hero Heading - Dedicated Section */}
          <div className="mb-12">
            <h1 
              className="font-black mb-4"
              style={{
                fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                lineHeight: '1.05'
              }}
            >
              <div 
                style={{ 
                  marginBottom: '-0.1em',
                  fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                  background: 'linear-gradient(to bottom, #7c3aed, #9333ea)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                AI-powered product
              </div>
              <div 
                style={{ 
                  marginBottom: '-0.1em',
                  fontSize: 'clamp(2.75rem, 5.5vw, 5rem)',
                  background: 'linear-gradient(to bottom, #9333ea, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                management that
              </div>
              <div 
                style={{ 
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                  background: 'linear-gradient(to bottom, #a78bfa, #c4b5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                works like magic
              </div>
            </h1>
          </div>
          <div className="text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed" style={{ color: '#6b7280' }}>
            <div>Blend Jira's structured efficiency with Notion's elegant UX. Let AI help you</div>
            <div>build better products, faster than ever before.</div>
          </div>


          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
            <div className="flex items-center gap-3">
              {/* Simple arrow pointing to button */}
              <svg 
                width="40" 
                height="20" 
                viewBox="0 0 40 20"
                style={{ marginRight: '-8px' }}
              >
                <line 
                  x1="5" 
                  y1="10" 
                  x2="30" 
                  y2="10" 
                  stroke="#9333ea" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
                <path 
                  d="M 25 5 L 35 10 L 25 15" 
                  stroke="#9333ea" 
                  strokeWidth="2.5" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <button
                onClick={onGetStarted}
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:opacity-90 transition-all font-medium text-sm"
              >
                Get started free →
              </button>
            </div>
            <button className="px-6 py-4 border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 transition-all text-sm font-medium rounded-full bg-white">
              Watch demo
            </button>
          </div>

          <div style={{ height: '120px' }}></div>

          <div className="max-w-5xl mx-auto relative" style={{ padding: '40px' }}>
            {/* Decorative squares behind the image */}
            <div style={{ position: 'absolute', top: '0', right: '0', width: '200px', height: '200px', backgroundColor: '#9333ea', borderRadius: '16px', opacity: 0.2, zIndex: 1 }}></div>
            <div style={{ position: 'absolute', bottom: '0', left: '0', width: '200px', height: '200px', backgroundColor: '#3b82f6', borderRadius: '16px', opacity: 0.2, zIndex: 1 }}></div>
            
            <img
              src="/src/assets/team-workspace.png"
              alt="Team collaboration workspace"
              className="w-full h-auto rounded-2xl shadow-lg relative"
              style={{ zIndex: 10, position: 'relative' }}
            />
          </div>
        </div>
      </section>


      <div style={{ height: '120px' }}></div>


      {/* Features */}
      <section className="pt-60 pb-60 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="w-6 h-6 text-white" />,
              title: 'AI Story Generation',
              text: 'Generate detailed user stories with acceptance criteria and smart estimates using advanced AI models.',
              color: 'bg-gradient-to-br from-blue-500 to-purple-600',
            },
            {
              icon: <Sparkles className="w-6 h-6 text-white" />,
              title: 'AI Copilot Assistant',
              text: 'Your personal AI assistant for sprint planning, estimation, and contextual suggestions in real-time.',
              color: 'bg-gradient-to-br from-blue-500 to-purple-600',
            },
            {
              icon: <BarChart3 className="w-6 h-6 text-white" />,
              title: 'Smart Insights',
              text: 'Real-time dashboards with AI-driven recommendations and predictive analytics for better decisions.',
              color: 'bg-gradient-to-br from-blue-500 to-purple-600',
            },
          ].map(({ icon, title, text, color }, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all"
            >
              <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-6`}>
                {icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>


      <div style={{ height: '120px' }}></div>


      {/* Stats */}
      <section className="pt-60 pb-20 px-6 bg-white">
        <div className="max-w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          {[
            { num: '10x', label: 'Faster story creation' },
            { num: '85%', label: 'Time saved on planning' },
            { num: '100%', label: 'Team alignment' },
          ].map(({ num, label }, i) => (
            <div key={i}>
              <div
                className="font-bold mb-3 leading-none"
                style={{
                  fontSize: 'clamp(20px, 3.75vw, 60px)',
                  background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {num}
              </div>
              <p className="text-gray-600 text-base">{label}</p>
            </div>
          ))}
        </div>
      </section>


      {/* CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white">
          <p className="text-base md:text-lg mb-4 opacity-95">Ready to transform your product workflow?</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight max-w-4xl mx-auto">
            Join thousands of teams already using Prodigy PM to build better products
          </h2>
          <button
            onClick={onGetStarted}
            className="px-6 py-4 bg-white text-blue-600 rounded-full hover:shadow-lg transition-all font-medium text-sm"
          >
            Get started free →
          </button>
        </div>
      </section>


      {/* Footer / Bottom Navbar */}
      <footer className="w-full bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-semibold text-gray-900">Prodigy PM</span>
          </div>
          <p className="text-gray-500 text-sm mt-4 md:mt-0">
            © 2025 Prodigy PM. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}



