import { Zap, Sparkles, TrendingUp, FolderKanban, ArrowRight, CheckCircle, Users, Brain } from 'lucide-react';
import { motion } from 'motion/react';

interface HomePageProps {
  onGetStarted: () => void;
}

export function HomePage({ onGetStarted }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <Zap className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="mb-6 text-foreground max-w-4xl mx-auto">
              The Future of Product Management, Powered by AI
            </h1>
            
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto text-lg">
              Blend the structured efficiency of Jira with the elegant UX of Notion.
              Let AI help you build better products, faster than ever before.
            </p>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2 text-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-card border-2 border-border text-foreground rounded-xl hover:bg-accent transition-all duration-200 text-lg">
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-center mb-4 text-foreground">
            Everything you need to manage products with AI
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Powerful features designed to help teams ship better products
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-200 hover:border-primary/50"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="mb-3 text-foreground">AI-Powered Story Generation</h3>
              <p className="text-muted-foreground">
                Generate detailed user stories with acceptance criteria, estimates, and smart prioritization using advanced AI models.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-200 hover:border-primary/50"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="mb-3 text-foreground">Smart Insights & Analytics</h3>
              <p className="text-muted-foreground">
                Real-time dashboards with AI-driven recommendations, sprint burndowns, and predictive analytics for better decision making.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-200 hover:border-primary/50"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6">
                <FolderKanban className="w-7 h-7 text-white" />
              </div>
              <h3 className="mb-3 text-foreground">Seamless Workflow</h3>
              <p className="text-muted-foreground">
                Backlog management, Kanban boards, and sprint planning in one beautiful, intuitive interface that your team will love.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-200 hover:border-primary/50"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="mb-3 text-foreground">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Real-time collaboration features that keep your entire team aligned and productive, no matter where they are.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-200 hover:border-primary/50"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="mb-3 text-foreground">AI Copilot Assistant</h3>
              <p className="text-muted-foreground">
                Your personal AI assistant that helps with sprint planning, story estimation, and provides contextual suggestions.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-200 hover:border-primary/50"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="mb-3 text-foreground">Customizable Themes</h3>
              <p className="text-muted-foreground">
                Beautiful light and dark modes with customizable accent colors (blue, teal, purple) to match your team's style.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-12 text-center text-white"
        >
          <h2 className="mb-4 text-white">Ready to transform your product workflow?</h2>
          <p className="mb-8 text-blue-50 max-w-2xl mx-auto text-lg">
            Join thousands of teams already using AI ProductHub to build better products
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:shadow-2xl transition-all duration-200 text-lg"
          >
            Get Started for Free
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-foreground">AI ProductHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 AI ProductHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
