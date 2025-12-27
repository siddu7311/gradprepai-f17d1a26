import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight,
  Sparkles, 
  Code2, 
  Database, 
  Cloud, 
  Layout,
  Server,
  Terminal,
  Cpu,
  Shield,
  Bug,
  Boxes,
  Mic,
  User,
  CheckCircle2,
  Volume2,
  Hash,
  BarChart3
} from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Footer } from '@/components/layout/Footer';
import { Helmet } from 'react-helmet-async';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

const roles = [
  { id: 'fullstack', name: 'Full Stack Developer', icon: Code2 },
  { id: 'frontend', name: 'Frontend Developer', icon: Layout },
  { id: 'backend', name: 'Backend Developer', icon: Server },
  { id: 'data-scientist', name: 'Data Scientist', icon: Database },
  { id: 'cloud', name: 'Cloud Engineer', icon: Cloud },
  { id: 'devops', name: 'DevOps Engineer', icon: Terminal },
  { id: 'ml', name: 'AI/ML Engineer', icon: Cpu },
  { id: 'security', name: 'Cybersecurity Analyst', icon: Shield },
  { id: 'qa', name: 'QA Engineer', icon: Bug },
  { id: 'product', name: 'Product Engineer', icon: Boxes },
];

const languages = [
  'JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'TypeScript', 'SQL', 'C#', 'Ruby'
];

const difficulties = [
  { id: 'beginner', name: 'Beginner', description: 'Basic concepts and fundamentals', color: 'from-green-500 to-emerald-500' },
  { id: 'intermediate', name: 'Intermediate', description: 'Practical problems and best practices', color: 'from-yellow-500 to-orange-500' },
  { id: 'advanced', name: 'Advanced', description: 'Complex scenarios and system design', color: 'from-red-500 to-pink-500' },
];

const questionCountOptions = [
  { count: 3, label: 'Quick Practice', description: '~5 minutes' },
  { count: 5, label: 'Standard', description: '~10 minutes' },
  { count: 8, label: 'Thorough', description: '~15 minutes' },
  { count: 10, label: 'Full Interview', description: '~20 minutes' },
];

const interviewers = [
  { 
    id: 'amds', 
    name: 'AMDS', 
    description: 'Male AI Interviewer', 
    personality: 'Professional, direct, technical-focused',
    avatar: '👨‍💼'
  },
  { 
    id: 'lusy', 
    name: 'LUSY', 
    description: 'Female AI Interviewer', 
    personality: 'Friendly, encouraging, thorough',
    avatar: '👩‍💼'
  },
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    role: '',
    language: '',
    difficulty: '',
    questionCount: 5,
    interviewer: '',
  });
  
  const { speak, isSpeaking, cancel } = useSpeechSynthesis();
  
  const previewVoice = (interviewerId: 'amds' | 'lusy') => {
    cancel(); // Cancel any ongoing speech
    const text = interviewerId === 'amds' 
      ? "Hello, I'm AMDS. I'll be conducting your technical interview today."
      : "Hi there! I'm LUSY, and I'm excited to chat with you about your experience!";
    const settings = interviewerId === 'amds'
      ? { pitch: 0.9, rate: 1.0, voice: 'male' as const }
      : { pitch: 1.1, rate: 0.95, voice: 'female' as const };
    speak(text, settings);
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Pass the interview configuration to the room
      navigate('/interview/room', {
        state: {
          role: roles.find(r => r.id === selection.role)?.name || selection.role,
          language: selection.language,
          difficulty: selection.difficulty,
          questionCount: selection.questionCount,
          interviewer: selection.interviewer as 'amds' | 'lusy'
        }
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepComplete = () => {
    switch (step) {
      case 1: return !!selection.role;
      case 2: return !!selection.language;
      case 3: return !!selection.difficulty;
      case 4: return selection.questionCount > 0;
      case 5: return !!selection.interviewer;
      default: return false;
    }
  };

  return (
    <>
      <Helmet>
        <title>Interview Setup - GradPrep AI</title>
        <meta name="description" content="Configure your mock interview settings. Choose role, language, difficulty, and AI interviewer." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <AnimatedBackground />
        
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link 
                  to="/interview/results" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous Results</span>
                </Link>
                <Link to="/" className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span className="font-display text-lg font-bold gradient-text">GradPrep AI</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-12"
          >
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <motion.div
                  animate={{
                    scale: step === s ? 1.1 : 1,
                    backgroundColor: step >= s ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    step >= s ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </motion.div>
                {s < 5 && (
                  <div className={`w-12 h-1 mx-1 rounded-full transition-colors ${
                    step > s ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                    Select Your Target Role
                  </h1>
                  <p className="text-muted-foreground">
                    Choose the position you're preparing for
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {roles.map((role) => (
                    <motion.button
                      key={role.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelection({ ...selection, role: role.id })}
                      className={`p-4 rounded-xl glass text-center transition-all ${
                        selection.role === role.id 
                          ? 'border-2 border-primary shadow-glow' 
                          : 'border border-glass-border/30 hover:border-primary/50'
                      }`}
                    >
                      <role.icon className={`w-8 h-8 mx-auto mb-2 ${
                        selection.role === role.id ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className={`text-sm font-medium ${
                        selection.role === role.id ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {role.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Language Selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                    Choose Programming Language
                  </h1>
                  <p className="text-muted-foreground">
                    Select the language you want to be interviewed in
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {languages.map((lang) => (
                    <motion.button
                      key={lang}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelection({ ...selection, language: lang })}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        selection.language === lang 
                          ? 'bg-primary text-primary-foreground shadow-glow' 
                          : 'glass border border-glass-border/30 text-muted-foreground hover:text-foreground hover:border-primary/50'
                      }`}
                    >
                      {lang}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Difficulty Selection */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                    Select Difficulty Level
                  </h1>
                  <p className="text-muted-foreground">
                    Choose based on your experience and confidence
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  {difficulties.map((diff) => (
                    <motion.button
                      key={diff.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelection({ ...selection, difficulty: diff.id })}
                      className={`p-6 rounded-2xl glass text-left transition-all ${
                        selection.difficulty === diff.id 
                          ? 'border-2 border-primary shadow-glow' 
                          : 'border border-glass-border/30 hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${diff.color} flex items-center justify-center mb-4`}>
                        <span className="text-2xl font-bold text-white">
                          {diff.id === 'beginner' ? '1' : diff.id === 'intermediate' ? '2' : '3'}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                        {diff.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {diff.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Question Count Selection */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                    How Many Questions?
                  </h1>
                  <p className="text-muted-foreground">
                    Choose how long you want your interview to be
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  {questionCountOptions.map((option) => (
                    <motion.button
                      key={option.count}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelection({ ...selection, questionCount: option.count })}
                      className={`p-6 rounded-2xl glass text-center transition-all ${
                        selection.questionCount === option.count 
                          ? 'border-2 border-primary shadow-glow' 
                          : 'border border-glass-border/30 hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                        selection.questionCount === option.count 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <span className="text-2xl font-bold">{option.count}</span>
                      </div>
                      <h3 className="font-display text-base font-semibold text-foreground mb-1">
                        {option.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Interviewer Selection */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                    Choose Your AI Interviewer
                  </h1>
                  <p className="text-muted-foreground">
                    Select the interviewer persona you'd like to practice with
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {interviewers.map((int) => (
                    <motion.div
                      key={int.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-8 rounded-2xl glass text-center transition-all cursor-pointer ${
                        selection.interviewer === int.id 
                          ? 'border-2 border-primary shadow-glow' 
                          : 'border border-glass-border/30 hover:border-primary/50'
                      }`}
                      onClick={() => setSelection({ ...selection, interviewer: int.id })}
                    >
                      <div className="text-6xl mb-4">{int.avatar}</div>
                      <h3 className="font-display text-2xl font-bold gradient-text mb-2">
                        {int.name}
                      </h3>
                      <p className="text-foreground font-medium mb-2">
                        {int.description}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {int.personality}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          previewVoice(int.id as 'amds' | 'lusy');
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isSpeaking 
                            ? 'bg-primary/20 text-primary animate-pulse' 
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        {isSpeaking ? 'Playing...' : 'Preview Voice'}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mt-12"
          >
            <GlowButton
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className={step === 1 ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </GlowButton>

            <GlowButton
              onClick={handleNext}
              disabled={!isStepComplete()}
              className={!isStepComplete() ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {step === 5 ? (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Start Interview
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </GlowButton>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}