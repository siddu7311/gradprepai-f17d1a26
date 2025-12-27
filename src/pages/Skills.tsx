import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowLeft,
  Code,
  Server,
  Database,
  Cloud,
  Cpu,
  Globe,
  Smartphone,
  Shield,
  Brain,
  Users,
  MessageSquare,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Footer } from '@/components/layout/Footer';
import { Helmet } from 'react-helmet-async';

const skillCategories = [
  {
    name: 'Frontend Development',
    icon: Globe,
    color: 'from-blue-500 to-cyan-500',
    skills: ['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Next.js']
  },
  {
    name: 'Backend Development',
    icon: Server,
    color: 'from-green-500 to-emerald-500',
    skills: ['Node.js', 'Python', 'Java', 'Go', 'Ruby', 'PHP', 'C#', 'Rust']
  },
  {
    name: 'Database & Storage',
    icon: Database,
    color: 'from-purple-500 to-pink-500',
    skills: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB']
  },
  {
    name: 'Cloud & DevOps',
    icon: Cloud,
    color: 'from-orange-500 to-red-500',
    skills: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform']
  },
  {
    name: 'System Design',
    icon: Cpu,
    color: 'from-indigo-500 to-violet-500',
    skills: ['Microservices', 'API Design', 'Scalability', 'Load Balancing', 'Caching', 'Message Queues']
  },
  {
    name: 'Mobile Development',
    icon: Smartphone,
    color: 'from-teal-500 to-cyan-500',
    skills: ['React Native', 'Flutter', 'iOS/Swift', 'Android/Kotlin', 'Expo']
  },
  {
    name: 'Security',
    icon: Shield,
    color: 'from-red-500 to-orange-500',
    skills: ['Authentication', 'Authorization', 'OWASP', 'Encryption', 'Security Best Practices']
  },
  {
    name: 'AI & Machine Learning',
    icon: Brain,
    color: 'from-pink-500 to-rose-500',
    skills: ['TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'ML Ops', 'LLMs']
  }
];

const softSkills = [
  { name: 'Communication', icon: MessageSquare, description: 'Clear and effective verbal and written communication' },
  { name: 'Teamwork', icon: Users, description: 'Collaboration and working effectively with others' },
  { name: 'Problem Solving', icon: Target, description: 'Analytical thinking and creative solutions' },
  { name: 'Time Management', icon: Clock, description: 'Prioritization and meeting deadlines' },
  { name: 'Adaptability', icon: Zap, description: 'Flexibility and learning new technologies quickly' }
];

export default function Skills() {
  return (
    <>
      <Helmet>
        <title>Skills - GradPrep AI</title>
        <meta name="description" content="Explore and practice interview skills across various technical domains. Master frontend, backend, cloud, and more." />
      </Helmet>

      <div className="min-h-screen">
        <AnimatedBackground />
        
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              
              <Link to="/" className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="font-display text-lg font-bold gradient-text">GradPrep AI</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Interview Skills Library
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our comprehensive collection of technical and soft skills. 
              Start an interview to practice any of these areas.
            </p>
          </motion.div>

          {/* Technical Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
              Technical Skills
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {skillCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <GlassCard className="h-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} p-2.5 mb-4`}>
                      <category.icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                      {category.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Soft Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
              Soft Skills
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              {softSkills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <GlassCard className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/20 flex items-center justify-center">
                      <skill.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{skill.name}</h3>
                    <p className="text-xs text-muted-foreground">{skill.description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <GlassCard className="max-w-2xl mx-auto">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Ready to Practice?
              </h3>
              <p className="text-muted-foreground mb-6">
                Start an interview session to practice any of these skills with our AI interviewers.
              </p>
              <Link to="/interview/setup">
                <GlowButton size="lg">
                  Start Interview Practice
                </GlowButton>
              </Link>
            </GlassCard>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
