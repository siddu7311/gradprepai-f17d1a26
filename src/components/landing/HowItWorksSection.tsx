import { motion } from 'framer-motion';
import { Upload, Settings, Mic, BarChart3, ArrowRight, Sparkles } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload Resume',
    description: 'Upload your resume and let our AI analyze your skills, experience, and areas for improvement.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Choose Your Path',
    description: 'Select your target role, programming language, difficulty level, and preferred AI interviewer.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: '03',
    icon: Mic,
    title: 'Start Interview',
    description: 'Engage in realistic voice interviews with AI. Answer questions naturally with live transcription.',
    color: 'from-orange-500 to-red-500',
  },
  {
    number: '04',
    icon: BarChart3,
    title: 'Get Feedback',
    description: 'Receive detailed performance analysis, scores, and personalized improvement suggestions.',
    color: 'from-green-500 to-emerald-500',
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-accent/30 mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">
              Simple Process
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            How It
            <br />
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get interview-ready in four simple steps. Our AI guides you through 
            the entire preparation journey.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`flex items-center gap-8 mb-16 last:mb-0 ${
                index % 2 === 1 ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Step Card */}
              <div className="flex-1">
                <div className="glass p-8 rounded-3xl relative group hover:shadow-glow transition-shadow duration-500">
                  {/* Step Number */}
                  <span className={`absolute -top-4 ${index % 2 === 0 ? '-left-4' : '-right-4'} font-display text-6xl font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-30`}>
                    {step.number}
                  </span>
                  
                  <div className="relative">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-full h-full text-white" />
                    </div>
                    
                    <h3 className="font-display text-2xl font-semibold mb-3 text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center w-20">
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowRight className="w-8 h-8 text-primary/50" />
                  </motion.div>
                </div>
              )}

              {/* Visual Element */}
              <div className="flex-1 hidden lg:block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`aspect-square max-w-xs mx-auto rounded-3xl bg-gradient-to-br ${step.color} opacity-10 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <step.icon className="w-32 h-32 text-foreground/20" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
