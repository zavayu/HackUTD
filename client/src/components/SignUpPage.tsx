import { useState } from 'react';
import { Zap, ArrowRight, Sparkles, TrendingUp, FolderKanban, User, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface SignUpPageProps {
  onSignUp: (data: { name: string; email: string; password: string }) => void;
  loading?: boolean;
}

export function SignUpPage({ onSignUp, loading = false }: SignUpPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please make sure both passwords are the same',
        duration: 2000,
      });
      return;
    }
    onSignUp({ name, email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-foreground">AI ProductHub</h1>
          </div>
          
          <h2 className="mb-4 text-foreground">
            Start Building Better Products Today
          </h2>
          
          <p className="text-muted-foreground mb-8 max-w-lg">
            Join thousands of product teams using AI-powered tools to streamline
            their workflow and deliver exceptional results.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="text-foreground mb-1">AI-Powered Story Generation</h4>
                <p className="text-sm text-muted-foreground">
                  Generate detailed user stories with acceptance criteria automatically
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="text-foreground mb-1">Smart Insights & Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time dashboards with AI-driven recommendations
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FolderKanban className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="text-foreground mb-1">Seamless Workflow</h4>
                <p className="text-sm text-muted-foreground">
                  Backlog, boards, and sprint planning in one beautiful interface
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
            <p className="text-sm text-foreground mb-2">
              <span className="font-semibold">Free for 14 days.</span> No credit card required.
            </p>
            <p className="text-xs text-muted-foreground">
              Start with our Pro plan and upgrade anytime
            </p>
          </div>
        </motion.div>

        {/* Right side - Sign Up Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl">
            <h3 className="mb-2 text-foreground">Create your account</h3>
            <p className="text-muted-foreground mb-6">Get started with AI ProductHub today</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Sarah Chen"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-foreground mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-foreground mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm text-foreground mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our{' '}
                <button className="text-primary hover:underline">Terms of Service</button>
                {' '}and{' '}
                <button className="text-primary hover:underline">Privacy Policy</button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
