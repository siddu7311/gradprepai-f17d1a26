import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FileText, Upload, Sparkles, Target, ChevronRight, AlertCircle, CheckCircle, TrendingUp, Lightbulb, BookOpen, Download, Palette, X, FileUp } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { templates, templateInfo, TemplateType } from '@/components/resume/ResumeTemplates';
import { extractTextFromFile, isValidResumeFile, getFileIcon } from '@/lib/documentParser';
import html2pdf from 'html2pdf.js';

interface ResumeAnalysis {
  improvedResume: {
    contactInfo: {
      name: string;
      email: string;
      phone: string;
      linkedin: string;
      github: string;
      portfolio: string;
    };
    summary: string;
    skills: {
      technical: string[];
      soft: string[];
      tools: string[];
    };
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      bullets: string[];
    }>;
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
      bullets: string[];
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      gpa: string;
    }>;
    certifications: string[];
  };
  atsScore: number;
  recruiterReadinessScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  suggestedSkills: string[];
}

const roleOptions = [
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'Data Scientist',
  'Data Analyst',
  'Cloud Engineer',
  'DevOps Engineer',
  'Cybersecurity Analyst',
  'AI/ML Engineer',
  'QA Engineer',
  'Mobile Developer',
];

export default function ResumeBuilder() {
  const [resumeContent, setResumeContent] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!isValidResumeFile(file)) {
      toast.error('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsParsing(true);
    setUploadedFile(file);

    try {
      const text = await extractTextFromFile(file);
      setResumeContent(text);
      toast.success(`Successfully extracted text from ${file.name}`);
    } catch (error) {
      console.error('File parsing error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to parse file');
      setUploadedFile(null);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setResumeContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!resumeContent.trim()) {
      toast.error('Please paste your resume content');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeContent, targetRole: targetRole || undefined },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setAnalysis(data);
      toast.success('Resume analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!analysis || !pdfRef.current) return;

    setIsExporting(true);
    try {
      const element = pdfRef.current;
      const templateName = templateInfo[selectedTemplate].name;
      const opt = {
        margin: 0,
        filename: `${analysis.improvedResume.contactInfo.name || 'resume'}_${templateName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
      toast.success(`Resume exported with ${templateName} template!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export resume. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-success/20 to-success/5';
    if (score >= 60) return 'from-warning/20 to-warning/5';
    return 'from-destructive/20 to-destructive/5';
  };

  return (
    <>
      <Helmet>
        <title>Resume Builder | GradPrep AI</title>
        <meta name="description" content="Build an ATS-optimized, recruiter-approved resume with AI-powered analysis and suggestions." />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        <AnimatedBackground />
        <Navbar />

        <main className="relative z-10 pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Resume Builder</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Build Your <span className="gradient-text">Winning Resume</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Paste your resume and let our AI analyze, optimize, and transform it into an ATS-friendly, recruiter-approved masterpiece.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard hover={false} className="h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-display text-xl font-semibold">Your Resume</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="targetRole">Target Role (Optional)</Label>
                      <div className="relative">
                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="targetRole"
                          placeholder="e.g., Software Developer, Data Scientist"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                          list="roles"
                        />
                        <datalist id="roles">
                          {roleOptions.map((role) => (
                            <option key={role} value={role} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="space-y-2">
                      <Label>Upload Resume File</Label>
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                          isParsing 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.docx,.doc,.txt"
                          onChange={handleFileInputChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isParsing}
                        />
                        
                        {isParsing ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm text-muted-foreground">Extracting text...</p>
                          </div>
                        ) : uploadedFile ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getFileIcon(uploadedFile.name)}</span>
                              <div className="text-left">
                                <p className="font-medium text-sm">{uploadedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(uploadedFile.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearUploadedFile();
                              }}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <FileUp className="w-8 h-8 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Drop your resume here or click to upload</p>
                              <p className="text-xs text-muted-foreground">Supports PDF, DOCX, DOC, TXT (max 10MB)</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative flex items-center gap-4">
                      <div className="flex-1 h-px bg-border/50" />
                      <span className="text-xs text-muted-foreground">or paste manually</span>
                      <div className="flex-1 h-px bg-border/50" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resumeContent">Resume Content</Label>
                      <Textarea
                        id="resumeContent"
                        placeholder="Paste your entire resume text here... Include all sections like contact info, education, experience, skills, projects, certifications, etc."
                        value={resumeContent}
                        onChange={(e) => {
                          setResumeContent(e.target.value);
                          if (uploadedFile) setUploadedFile(null);
                        }}
                        className="min-h-[300px] bg-background/50 border-border/50 focus:border-primary resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {resumeContent.length} characters
                      </p>
                    </div>

                    <GlowButton
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !resumeContent.trim()}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                          Analyzing Resume...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze & Optimize Resume
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </GlowButton>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Results Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <AnimatePresence mode="wait">
                  {!analysis && !isAnalyzing && (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <GlassCard hover={false} className="h-full min-h-[500px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-10 h-10 text-primary/50" />
                          </div>
                          <h3 className="font-display text-lg font-medium mb-2 text-muted-foreground">
                            No Analysis Yet
                          </h3>
                          <p className="text-sm text-muted-foreground/70 max-w-sm">
                            Paste your resume content and click "Analyze" to get AI-powered insights and improvements.
                          </p>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}

                  {isAnalyzing && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <GlassCard hover={false} className="h-full min-h-[500px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Sparkles className="w-10 h-10 text-primary animate-spin" />
                          </div>
                          <h3 className="font-display text-lg font-medium mb-2">
                            Analyzing Your Resume...
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-sm">
                            Our AI is reviewing your resume for ATS optimization, impact analysis, and improvements.
                          </p>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}

                  {analysis && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      {/* Scores */}
                      <div className="grid grid-cols-2 gap-4">
                        <GlassCard hover={false} className={`bg-gradient-to-br ${getScoreGradient(analysis.atsScore)}`}>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">ATS Score</p>
                            <p className={`font-display text-4xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                              {analysis.atsScore}%
                            </p>
                            <Progress value={analysis.atsScore} className="mt-3 h-2" />
                          </div>
                        </GlassCard>
                        <GlassCard hover={false} className={`bg-gradient-to-br ${getScoreGradient(analysis.recruiterReadinessScore)}`}>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">Recruiter Ready</p>
                            <p className={`font-display text-4xl font-bold ${getScoreColor(analysis.recruiterReadinessScore)}`}>
                              {analysis.recruiterReadinessScore}%
                            </p>
                            <Progress value={analysis.recruiterReadinessScore} className="mt-3 h-2" />
                          </div>
                        </GlassCard>
                      </div>

                      {/* Tabs for detailed analysis */}
                      <GlassCard hover={false}>
                        <Tabs defaultValue="strengths" className="w-full">
                          <TabsList className="grid grid-cols-4 mb-4">
                            <TabsTrigger value="strengths" className="text-xs sm:text-sm">
                              <CheckCircle className="w-3 h-3 mr-1 hidden sm:inline" />
                              Strengths
                            </TabsTrigger>
                            <TabsTrigger value="weaknesses" className="text-xs sm:text-sm">
                              <AlertCircle className="w-3 h-3 mr-1 hidden sm:inline" />
                              Weaknesses
                            </TabsTrigger>
                            <TabsTrigger value="improvements" className="text-xs sm:text-sm">
                              <TrendingUp className="w-3 h-3 mr-1 hidden sm:inline" />
                              Improve
                            </TabsTrigger>
                            <TabsTrigger value="skills" className="text-xs sm:text-sm">
                              <Lightbulb className="w-3 h-3 mr-1 hidden sm:inline" />
                              Learn
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="strengths" className="space-y-2">
                            {analysis.strengths.map((strength, i) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-success/5 border border-success/20">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <p className="text-sm">{strength}</p>
                              </div>
                            ))}
                          </TabsContent>

                          <TabsContent value="weaknesses" className="space-y-2">
                            {analysis.weaknesses.map((weakness, i) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                                <p className="text-sm">{weakness}</p>
                              </div>
                            ))}
                          </TabsContent>

                          <TabsContent value="improvements" className="space-y-2">
                            {analysis.improvements.map((improvement, i) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                                <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <p className="text-sm">{improvement}</p>
                              </div>
                            ))}
                          </TabsContent>

                          <TabsContent value="skills" className="space-y-3">
                            <p className="text-sm text-muted-foreground mb-2">Skills to boost your profile:</p>
                            <div className="flex flex-wrap gap-2">
                              {analysis.suggestedSkills.map((skill, i) => (
                                <Badge key={i} variant="outline" className="bg-secondary/10 border-secondary/30 text-secondary">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </GlassCard>

                      {/* Template Selector with Live Preview */}
                      <GlassCard hover={false}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Palette className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="font-display text-lg font-semibold">Choose Template</h3>
                        </div>
                        
                        {/* Template Options */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          {(Object.keys(templates) as TemplateType[]).map((key) => (
                            <button
                              key={key}
                              onClick={() => setSelectedTemplate(key)}
                              className={`p-3 rounded-lg border-2 transition-all text-left ${
                                selectedTemplate === key
                                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                                  : 'border-border/50 hover:border-primary/50 bg-background/30'
                              }`}
                            >
                              <div className="text-2xl mb-1">{templateInfo[key].preview}</div>
                              <p className="font-medium text-sm">{templateInfo[key].name}</p>
                              <p className="text-xs text-muted-foreground">{templateInfo[key].description}</p>
                            </button>
                          ))}
                        </div>

                        {/* Live Preview */}
                        <div className="border-t border-border/30 pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-muted-foreground">
                              Live Preview: <span className="text-primary">{templateInfo[selectedTemplate].name}</span>
                            </p>
                            <Badge variant="outline" className="text-xs">
                              A4 Format
                            </Badge>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3 overflow-hidden">
                            <div 
                              className="mx-auto bg-white rounded shadow-xl overflow-hidden"
                              style={{
                                width: '100%',
                                maxWidth: '300px',
                                aspectRatio: '210 / 297',
                              }}
                            >
                              <div 
                                style={{
                                  transform: 'scale(0.38)',
                                  transformOrigin: 'top left',
                                  width: '263%',
                                  height: '263%',
                                }}
                              >
                                {(() => {
                                  const PreviewTemplate = templates[selectedTemplate];
                                  return <PreviewTemplate resume={analysis.improvedResume} />;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </GlassCard>

                      {/* Improved Resume Preview */}
                      <GlassCard hover={false}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-secondary/10">
                              <FileText className="w-5 h-5 text-secondary" />
                            </div>
                            <h3 className="font-display text-lg font-semibold">Optimized Resume</h3>
                          </div>
                          <Button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            variant="outline"
                            size="sm"
                            className="border-primary/30 hover:bg-primary/10"
                          >
                            {isExporting ? (
                              <>
                                <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
                                Exporting...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Export {templateInfo[selectedTemplate].name}
                              </>
                            )}
                          </Button>
                        </div>
                        
                        <div className="space-y-6 text-sm">
                          {/* Contact Info */}
                          {analysis.improvedResume.contactInfo.name && (
                            <div className="text-center border-b border-border/30 pb-4">
                              <h4 className="font-display text-xl font-bold gradient-text">
                                {analysis.improvedResume.contactInfo.name}
                              </h4>
                              <div className="flex flex-wrap justify-center gap-2 mt-2 text-muted-foreground text-xs">
                                {analysis.improvedResume.contactInfo.email && (
                                  <span>{analysis.improvedResume.contactInfo.email}</span>
                                )}
                                {analysis.improvedResume.contactInfo.phone && (
                                  <span>• {analysis.improvedResume.contactInfo.phone}</span>
                                )}
                                {analysis.improvedResume.contactInfo.linkedin && (
                                  <span>• {analysis.improvedResume.contactInfo.linkedin}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Summary */}
                          {analysis.improvedResume.summary && (
                            <div>
                              <h5 className="font-display font-semibold text-primary mb-2">Professional Summary</h5>
                              <p className="text-muted-foreground">{analysis.improvedResume.summary}</p>
                            </div>
                          )}

                          {/* Skills */}
                          {(analysis.improvedResume.skills.technical.length > 0 || 
                            analysis.improvedResume.skills.tools.length > 0) && (
                            <div>
                              <h5 className="font-display font-semibold text-primary mb-2">Skills</h5>
                              <div className="flex flex-wrap gap-1.5">
                                {analysis.improvedResume.skills.technical.map((skill, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {analysis.improvedResume.skills.tools.map((tool, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tool}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Experience */}
                          {analysis.improvedResume.experience.length > 0 && (
                            <div>
                              <h5 className="font-display font-semibold text-primary mb-2">Experience</h5>
                              {analysis.improvedResume.experience.map((exp, i) => (
                                <div key={i} className="mb-3 last:mb-0">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{exp.title}</p>
                                      <p className="text-muted-foreground text-xs">{exp.company}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{exp.duration}</span>
                                  </div>
                                  <ul className="mt-1 space-y-1">
                                    {exp.bullets.map((bullet, j) => (
                                      <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        {bullet}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Projects */}
                          {analysis.improvedResume.projects.length > 0 && (
                            <div>
                              <h5 className="font-display font-semibold text-primary mb-2">Projects</h5>
                              {analysis.improvedResume.projects.map((project, i) => (
                                <div key={i} className="mb-3 last:mb-0">
                                  <p className="font-medium">{project.name}</p>
                                  <p className="text-xs text-muted-foreground">{project.description}</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {project.technologies.map((tech, j) => (
                                      <Badge key={j} variant="outline" className="text-[10px] px-1.5 py-0">
                                        {tech}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Education */}
                          {analysis.improvedResume.education.length > 0 && (
                            <div>
                              <h5 className="font-display font-semibold text-primary mb-2">Education</h5>
                              {analysis.improvedResume.education.map((edu, i) => (
                                <div key={i} className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{edu.degree}</p>
                                    <p className="text-xs text-muted-foreground">{edu.institution}</p>
                                  </div>
                                  <div className="text-right text-xs text-muted-foreground">
                                    <p>{edu.year}</p>
                                    {edu.gpa && <p>GPA: {edu.gpa}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </main>

        <Footer />

        {/* Hidden PDF Template for export */}
        {analysis && (() => {
          const SelectedTemplate = templates[selectedTemplate];
          return (
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
              <SelectedTemplate ref={pdfRef} resume={analysis.improvedResume} />
            </div>
          );
        })()}
      </div>
    </>
  );
}
