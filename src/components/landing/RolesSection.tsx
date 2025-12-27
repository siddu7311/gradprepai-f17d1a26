import { motion } from 'framer-motion';
import { 
  Code2, 
  Database, 
  Cloud, 
  Shield, 
  Cpu, 
  Layout,
  Server,
  Terminal,
  Bug,
  Boxes,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

const roles = [
  { name: 'Full Stack Developer', icon: Code2, color: 'text-cyan-400' },
  { name: 'Frontend Developer', icon: Layout, color: 'text-blue-400' },
  { name: 'Backend Developer', icon: Server, color: 'text-green-400' },
  { name: 'Data Scientist', icon: Database, color: 'text-purple-400' },
  { name: 'Cloud Engineer', icon: Cloud, color: 'text-sky-400' },
  { name: 'DevOps Engineer', icon: Terminal, color: 'text-orange-400' },
  { name: 'AI/ML Engineer', icon: Cpu, color: 'text-pink-400' },
  { name: 'Cybersecurity Analyst', icon: Shield, color: 'text-red-400' },
  { name: 'QA Engineer', icon: Bug, color: 'text-yellow-400' },
  { name: 'Product Engineer', icon: Boxes, color: 'text-indigo-400' },
];

const languages = [
  'Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust', 'TypeScript', 'SQL', 'C#', 'Ruby'
];

export const RolesSection = () => {
  return (
    <section id="roles" className="py-32 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/30 mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-muted-foreground">
              Trending Roles & Skills
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Prepare for
            <br />
            <span className="bg-gradient-to-r from-secondary to-pink-500 bg-clip-text text-transparent">
              Any Tech Role
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From entry-level to advanced positions, master interviews for the most in-demand tech roles.
          </p>
        </motion.div>

        {/* Roles Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16"
        >
          {roles.map((role, index) => (
            <motion.div
              key={role.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <GlassCard className="text-center py-8 group cursor-pointer">
                <role.icon className={`w-10 h-10 mx-auto mb-4 ${role.color} group-hover:scale-125 transition-transform duration-300`} />
                <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                  {role.name}
                </h3>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Languages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="font-display text-xl font-semibold mb-6 text-muted-foreground">
            Programming Languages
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {languages.map((lang, index) => (
              <motion.span
                key={lang}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className="px-5 py-2 rounded-full glass border border-primary/20 text-foreground font-medium hover:border-primary/50 hover:shadow-glow-sm transition-all cursor-pointer"
              >
                {lang}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Difficulty Levels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-center gap-6 flex-wrap"
        >
          {['Beginner', 'Intermediate', 'Advanced'].map((level, index) => (
            <div
              key={level}
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass"
            >
              <div className={`w-3 h-3 rounded-full ${
                index === 0 ? 'bg-green-500' : 
                index === 1 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="font-medium text-foreground">{level}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
