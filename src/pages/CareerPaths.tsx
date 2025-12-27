import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Code2, 
  Database, 
  Cloud, 
  Shield, 
  Cpu, 
  Layout,
  Server,
  Terminal,
  TrendingUp,
  Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';

const careers = [
  {
    icon: Layout,
    title: 'Frontend Developer',
    salary: '$70k - $150k',
    description: 'Build user interfaces and interactive web applications using modern frameworks.',
    skills: ['React', 'TypeScript', 'CSS', 'HTML', 'Testing'],
    path: ['Junior Developer', 'Mid-level Developer', 'Senior Developer', 'Lead/Architect'],
  },
  {
    icon: Server,
    title: 'Backend Developer',
    salary: '$75k - $160k',
    description: 'Design and implement server-side logic, databases, and APIs.',
    skills: ['Node.js', 'Python', 'SQL', 'APIs', 'System Design'],
    path: ['Junior Developer', 'Mid-level Developer', 'Senior Developer', 'Staff Engineer'],
  },
  {
    icon: Code2,
    title: 'Full Stack Developer',
    salary: '$80k - $170k',
    description: 'Work across the entire stack, from databases to user interfaces.',
    skills: ['Frontend', 'Backend', 'DevOps', 'Databases', 'APIs'],
    path: ['Junior Full Stack', 'Mid-level', 'Senior', 'Tech Lead'],
  },
  {
    icon: Database,
    title: 'Data Scientist',
    salary: '$90k - $180k',
    description: 'Analyze data, build models, and derive insights to drive business decisions.',
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Visualization'],
    path: ['Data Analyst', 'Data Scientist', 'Senior DS', 'Principal DS'],
  },
  {
    icon: Cpu,
    title: 'AI/ML Engineer',
    salary: '$100k - $200k',
    description: 'Develop and deploy machine learning models and AI systems.',
    skills: ['Deep Learning', 'PyTorch', 'MLOps', 'Python', 'Math'],
    path: ['ML Engineer I', 'ML Engineer II', 'Senior MLE', 'Staff MLE'],
  },
  {
    icon: Cloud,
    title: 'Cloud Engineer',
    salary: '$85k - $175k',
    description: 'Design, implement, and manage cloud infrastructure and services.',
    skills: ['AWS/GCP/Azure', 'Terraform', 'Kubernetes', 'Networking', 'Security'],
    path: ['Cloud Engineer', 'Senior Cloud', 'Cloud Architect', 'Principal'],
  },
  {
    icon: Terminal,
    title: 'DevOps Engineer',
    salary: '$85k - $170k',
    description: 'Automate deployments, manage infrastructure, and improve reliability.',
    skills: ['CI/CD', 'Docker', 'Kubernetes', 'Linux', 'Scripting'],
    path: ['DevOps Engineer', 'Senior DevOps', 'SRE', 'Platform Lead'],
  },
  {
    icon: Shield,
    title: 'Security Engineer',
    salary: '$90k - $180k',
    description: 'Protect systems and data from threats through security practices.',
    skills: ['Security', 'Networking', 'Pentesting', 'Compliance', 'Cryptography'],
    path: ['Security Analyst', 'Security Engineer', 'Senior Security', 'CISO'],
  },
];

const CareerPaths = () => {
  return (
    <>
      <Helmet>
        <title>Career Paths - GradPrep AI</title>
        <meta name="description" content="Explore tech career paths, salary ranges, required skills, and growth trajectories. Find the right path for your tech career." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AnimatedBackground />
        <Navbar />

        <main className="relative z-10 pt-32 pb-20">
          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Career Growth
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Tech
                <br />
                <span className="gradient-text">Career Paths</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore different career paths in tech and find the one that matches your interests and goals.
              </p>
            </motion.div>

            {/* Career Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-16">
              {careers.map((career, index) => (
                <motion.div
                  key={career.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GlassCard className="h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <career.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-foreground">{career.title}</h3>
                          <p className="text-primary font-semibold">{career.salary}</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{career.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Key Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {career.skills.map((skill) => (
                          <span key={skill} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Career Progression</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto">
                        {career.path.map((step, i) => (
                          <span key={step} className="flex items-center gap-2 whitespace-nowrap">
                            {step}
                            {i < career.path.length - 1 && <span className="text-primary">→</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center"
            >
              <GlassCard className="max-w-2xl mx-auto">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Found Your Path?</h2>
                <p className="text-muted-foreground mb-6">
                  Start practicing role-specific interviews and build the skills you need to succeed.
                </p>
                <Link to="/signup">
                  <GlowButton size="lg">
                    Start Practicing Now
                  </GlowButton>
                </Link>
              </GlassCard>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CareerPaths;
