import { motion } from 'framer-motion';
import { 
  Mic, 
  Brain, 
  FileText, 
  BarChart3, 
  Users, 
  Target, 
  Sparkles,
  MessageSquare 
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

const features = [
  {
    icon: Mic,
    title: 'Voice Interviews',
    description: 'Real-time voice conversations with AI interviewers. Natural speech recognition and intelligent responses.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Brain,
    title: 'AI Personas',
    description: 'Choose between AMDS (male) or LUSY (female) AI interviewers with distinct personalities.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: FileText,
    title: 'Resume Builder',
    description: 'Upload, analyze, and improve your resume with AI-powered suggestions and ATS optimization.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Detailed scoring on communication, technical depth, and confidence with actionable insights.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Target,
    title: 'Role-Specific Prep',
    description: 'Tailored questions for 20+ tech roles from Frontend to DevOps, across all difficulty levels.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: MessageSquare,
    title: 'Live Subtitles',
    description: 'Real-time transcription of both AI questions and your answers for better comprehension.',
    gradient: 'from-pink-500 to-rose-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Powerful Features
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Everything You Need to
            <br />
            <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete AI interview coaching platform with cutting-edge features 
            designed to make you job-ready.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <GlassCard className="h-full group" glow>
                <div className="relative">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-display text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover glow effect */}
                  <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10`} />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
