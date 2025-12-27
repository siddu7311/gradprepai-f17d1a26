import { forwardRef } from 'react';

interface ResumeData {
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
}

interface ResumeTemplateProps {
  resume: ResumeData;
}

// Modern Template - Clean with accent color sidebar
export const ModernTemplate = forwardRef<HTMLDivElement, ResumeTemplateProps>(
  ({ resume }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: '210mm',
          minHeight: '297mm',
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          fontFamily: 'Arial, sans-serif',
          fontSize: '10pt',
          lineHeight: '1.4',
          display: 'flex',
        }}
      >
        {/* Sidebar */}
        <div style={{ 
          width: '70mm', 
          backgroundColor: '#0f172a', 
          color: '#ffffff', 
          padding: '20mm 8mm'
        }}>
          {/* Name */}
          <h1 style={{ 
            fontSize: '18pt', 
            fontWeight: 'bold', 
            marginBottom: '5mm',
            lineHeight: '1.2'
          }}>
            {resume.contactInfo.name || 'Your Name'}
          </h1>

          {/* Contact */}
          <div style={{ marginBottom: '8mm', fontSize: '9pt' }}>
            <h2 style={{ 
              fontSize: '10pt', 
              fontWeight: 'bold', 
              marginBottom: '3mm',
              color: '#0891b2',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Contact</h2>
            {resume.contactInfo.email && <p style={{ marginBottom: '2mm' }}>{resume.contactInfo.email}</p>}
            {resume.contactInfo.phone && <p style={{ marginBottom: '2mm' }}>{resume.contactInfo.phone}</p>}
            {resume.contactInfo.linkedin && <p style={{ marginBottom: '2mm' }}>{resume.contactInfo.linkedin}</p>}
            {resume.contactInfo.github && <p style={{ marginBottom: '2mm' }}>{resume.contactInfo.github}</p>}
          </div>

          {/* Skills */}
          {(resume.skills.technical.length > 0 || resume.skills.tools.length > 0) && (
            <div style={{ marginBottom: '8mm' }}>
              <h2 style={{ 
                fontSize: '10pt', 
                fontWeight: 'bold', 
                marginBottom: '3mm',
                color: '#0891b2',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Skills</h2>
              <div style={{ fontSize: '9pt' }}>
                {resume.skills.technical.map((skill, i) => (
                  <span key={i} style={{ 
                    display: 'inline-block', 
                    backgroundColor: '#1e293b', 
                    padding: '2px 6px', 
                    borderRadius: '3px',
                    margin: '2px',
                    fontSize: '8pt'
                  }}>{skill}</span>
                ))}
                {resume.skills.tools.map((tool, i) => (
                  <span key={i} style={{ 
                    display: 'inline-block', 
                    backgroundColor: '#1e293b', 
                    padding: '2px 6px', 
                    borderRadius: '3px',
                    margin: '2px',
                    fontSize: '8pt'
                  }}>{tool}</span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <div>
              <h2 style={{ 
                fontSize: '10pt', 
                fontWeight: 'bold', 
                marginBottom: '3mm',
                color: '#0891b2',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Education</h2>
              {resume.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: '4mm', fontSize: '9pt' }}>
                  <p style={{ fontWeight: 'bold' }}>{edu.degree}</p>
                  <p style={{ color: '#94a3b8' }}>{edu.institution}</p>
                  <p style={{ color: '#64748b', fontSize: '8pt' }}>{edu.year}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '15mm 12mm' }}>
          {/* Summary */}
          {resume.summary && (
            <div style={{ marginBottom: '8mm' }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: '#0891b2',
                marginBottom: '3mm',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Profile</h2>
              <p style={{ color: '#475569', textAlign: 'justify' }}>{resume.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resume.experience.length > 0 && (
            <div style={{ marginBottom: '8mm' }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: '#0891b2',
                marginBottom: '3mm',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Experience</h2>
              {resume.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '5mm' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{exp.title}</span>
                    <span style={{ color: '#64748b', fontSize: '9pt' }}>{exp.duration}</span>
                  </div>
                  <p style={{ color: '#0891b2', fontSize: '9pt', marginBottom: '2mm' }}>{exp.company}</p>
                  <ul style={{ margin: 0, paddingLeft: '4mm', color: '#475569' }}>
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} style={{ marginBottom: '1mm' }}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {resume.projects.length > 0 && (
            <div>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: '#0891b2',
                marginBottom: '3mm',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Projects</h2>
              {resume.projects.map((project, i) => (
                <div key={i} style={{ marginBottom: '4mm' }}>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{project.name}</span>
                  {project.technologies.length > 0 && (
                    <span style={{ color: '#64748b', fontSize: '9pt' }}> — {project.technologies.join(', ')}</span>
                  )}
                  <p style={{ color: '#475569', fontSize: '9pt', margin: '1mm 0' }}>{project.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);
ModernTemplate.displayName = 'ModernTemplate';

// Classic Template - Traditional professional layout
export const ClassicTemplate = forwardRef<HTMLDivElement, ResumeTemplateProps>(
  ({ resume }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '15mm 20mm',
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          fontFamily: 'Georgia, serif',
          fontSize: '11pt',
          lineHeight: '1.5',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8mm', borderBottom: '2px solid #1a1a1a', paddingBottom: '5mm' }}>
          <h1 style={{ 
            fontSize: '22pt', 
            fontWeight: 'normal', 
            margin: 0,
            letterSpacing: '3px',
            textTransform: 'uppercase'
          }}>
            {resume.contactInfo.name || 'Your Name'}
          </h1>
          <div style={{ marginTop: '3mm', fontSize: '10pt', color: '#4a4a4a' }}>
            {[resume.contactInfo.email, resume.contactInfo.phone, resume.contactInfo.linkedin]
              .filter(Boolean)
              .join(' | ')}
          </div>
        </div>

        {/* Summary */}
        {resume.summary && (
          <div style={{ marginBottom: '6mm' }}>
            <h2 style={{ 
              fontSize: '12pt', 
              fontWeight: 'bold', 
              borderBottom: '1px solid #cccccc',
              paddingBottom: '2mm',
              marginBottom: '3mm',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>Summary</h2>
            <p style={{ color: '#333333', textAlign: 'justify', fontStyle: 'italic' }}>{resume.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div style={{ marginBottom: '6mm' }}>
            <h2 style={{ 
              fontSize: '12pt', 
              fontWeight: 'bold', 
              borderBottom: '1px solid #cccccc',
              paddingBottom: '2mm',
              marginBottom: '3mm',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>Professional Experience</h2>
            {resume.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '5mm' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>{exp.title}</span>
                    <span style={{ color: '#666666' }}>, {exp.company}</span>
                  </div>
                  <span style={{ fontStyle: 'italic', color: '#666666' }}>{exp.duration}</span>
                </div>
                <ul style={{ margin: '2mm 0 0 0', paddingLeft: '5mm', color: '#333333' }}>
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} style={{ marginBottom: '1mm' }}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div style={{ marginBottom: '6mm' }}>
            <h2 style={{ 
              fontSize: '12pt', 
              fontWeight: 'bold', 
              borderBottom: '1px solid #cccccc',
              paddingBottom: '2mm',
              marginBottom: '3mm',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>Education</h2>
            {resume.education.map((edu, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3mm' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>{edu.degree}</span>
                  <span style={{ color: '#666666' }}>, {edu.institution}</span>
                  {edu.gpa && <span style={{ color: '#888888' }}> — GPA: {edu.gpa}</span>}
                </div>
                <span style={{ fontStyle: 'italic', color: '#666666' }}>{edu.year}</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {(resume.skills.technical.length > 0 || resume.skills.tools.length > 0) && (
          <div style={{ marginBottom: '6mm' }}>
            <h2 style={{ 
              fontSize: '12pt', 
              fontWeight: 'bold', 
              borderBottom: '1px solid #cccccc',
              paddingBottom: '2mm',
              marginBottom: '3mm',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>Skills</h2>
            <p style={{ color: '#333333' }}>
              {[...resume.skills.technical, ...resume.skills.tools].join(' • ')}
            </p>
          </div>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <div>
            <h2 style={{ 
              fontSize: '12pt', 
              fontWeight: 'bold', 
              borderBottom: '1px solid #cccccc',
              paddingBottom: '2mm',
              marginBottom: '3mm',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>Projects</h2>
            {resume.projects.map((project, i) => (
              <div key={i} style={{ marginBottom: '3mm' }}>
                <span style={{ fontWeight: 'bold' }}>{project.name}</span>
                {project.technologies.length > 0 && (
                  <span style={{ color: '#666666', fontStyle: 'italic' }}> ({project.technologies.join(', ')})</span>
                )}
                <p style={{ color: '#333333', margin: '1mm 0 0 0' }}>{project.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
ClassicTemplate.displayName = 'ClassicTemplate';

// Creative Template - Bold with color accents
export const CreativeTemplate = forwardRef<HTMLDivElement, ResumeTemplateProps>(
  ({ resume }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '0',
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: '10pt',
          lineHeight: '1.4',
        }}
      >
        {/* Header with gradient */}
        <div style={{ 
          background: 'linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)',
          color: '#ffffff',
          padding: '12mm 15mm',
          marginBottom: '8mm'
        }}>
          <h1 style={{ 
            fontSize: '28pt', 
            fontWeight: 'bold', 
            margin: '0 0 3mm 0',
            letterSpacing: '-0.5px'
          }}>
            {resume.contactInfo.name || 'Your Name'}
          </h1>
          <div style={{ fontSize: '10pt', opacity: 0.9, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {resume.contactInfo.email && <span>✉ {resume.contactInfo.email}</span>}
            {resume.contactInfo.phone && <span>☎ {resume.contactInfo.phone}</span>}
            {resume.contactInfo.linkedin && <span>🔗 {resume.contactInfo.linkedin}</span>}
            {resume.contactInfo.github && <span>💻 {resume.contactInfo.github}</span>}
          </div>
        </div>

        <div style={{ padding: '0 15mm 15mm 15mm' }}>
          {/* Summary */}
          {resume.summary && (
            <div style={{ marginBottom: '8mm' }}>
              <h2 style={{ 
                fontSize: '13pt', 
                fontWeight: 'bold', 
                color: '#7c3aed',
                marginBottom: '3mm',
                display: 'flex',
                alignItems: 'center',
                gap: '3mm'
              }}>
                <span style={{ 
                  width: '8mm', 
                  height: '3px', 
                  background: 'linear-gradient(90deg, #7c3aed, #0891b2)',
                  display: 'inline-block'
                }}></span>
                About Me
              </h2>
              <p style={{ color: '#4b5563', fontSize: '10pt' }}>{resume.summary}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10mm' }}>
            {/* Left Column */}
            <div style={{ flex: '1.5' }}>
              {/* Experience */}
              {resume.experience.length > 0 && (
                <div style={{ marginBottom: '8mm' }}>
                  <h2 style={{ 
                    fontSize: '13pt', 
                    fontWeight: 'bold', 
                    color: '#7c3aed',
                    marginBottom: '4mm',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3mm'
                  }}>
                    <span style={{ 
                      width: '8mm', 
                      height: '3px', 
                      background: 'linear-gradient(90deg, #7c3aed, #0891b2)',
                      display: 'inline-block'
                    }}></span>
                    Experience
                  </h2>
                  {resume.experience.map((exp, i) => (
                    <div key={i} style={{ 
                      marginBottom: '5mm', 
                      paddingLeft: '4mm',
                      borderLeft: '2px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold', color: '#111827' }}>{exp.title}</span>
                        <span style={{ 
                          fontSize: '9pt', 
                          color: '#ffffff',
                          backgroundColor: '#7c3aed',
                          padding: '1px 6px',
                          borderRadius: '10px'
                        }}>{exp.duration}</span>
                      </div>
                      <p style={{ color: '#0891b2', fontSize: '9pt', margin: '1mm 0 2mm 0' }}>{exp.company}</p>
                      <ul style={{ margin: 0, paddingLeft: '4mm', color: '#4b5563' }}>
                        {exp.bullets.map((bullet, j) => (
                          <li key={j} style={{ marginBottom: '1mm' }}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {resume.projects.length > 0 && (
                <div>
                  <h2 style={{ 
                    fontSize: '13pt', 
                    fontWeight: 'bold', 
                    color: '#7c3aed',
                    marginBottom: '4mm',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3mm'
                  }}>
                    <span style={{ 
                      width: '8mm', 
                      height: '3px', 
                      background: 'linear-gradient(90deg, #7c3aed, #0891b2)',
                      display: 'inline-block'
                    }}></span>
                    Projects
                  </h2>
                  {resume.projects.map((project, i) => (
                    <div key={i} style={{ marginBottom: '4mm', paddingLeft: '4mm', borderLeft: '2px solid #e5e7eb' }}>
                      <span style={{ fontWeight: 'bold', color: '#111827' }}>{project.name}</span>
                      <div style={{ marginTop: '1mm' }}>
                        {project.technologies.map((tech, j) => (
                          <span key={j} style={{ 
                            display: 'inline-block',
                            fontSize: '8pt',
                            backgroundColor: '#f3e8ff',
                            color: '#7c3aed',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            marginRight: '3px'
                          }}>{tech}</span>
                        ))}
                      </div>
                      <p style={{ color: '#4b5563', fontSize: '9pt', margin: '2mm 0 0 0' }}>{project.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div style={{ width: '55mm' }}>
              {/* Skills */}
              {(resume.skills.technical.length > 0 || resume.skills.tools.length > 0) && (
                <div style={{ marginBottom: '8mm' }}>
                  <h2 style={{ 
                    fontSize: '13pt', 
                    fontWeight: 'bold', 
                    color: '#7c3aed',
                    marginBottom: '3mm'
                  }}>Skills</h2>
                  <div>
                    {[...resume.skills.technical, ...resume.skills.tools].map((skill, i) => (
                      <span key={i} style={{ 
                        display: 'inline-block',
                        fontSize: '9pt',
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        margin: '2px'
                      }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {resume.education.length > 0 && (
                <div style={{ marginBottom: '8mm' }}>
                  <h2 style={{ 
                    fontSize: '13pt', 
                    fontWeight: 'bold', 
                    color: '#7c3aed',
                    marginBottom: '3mm'
                  }}>Education</h2>
                  {resume.education.map((edu, i) => (
                    <div key={i} style={{ marginBottom: '4mm' }}>
                      <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '10pt', margin: 0 }}>{edu.degree}</p>
                      <p style={{ color: '#4b5563', fontSize: '9pt', margin: 0 }}>{edu.institution}</p>
                      <p style={{ color: '#9ca3af', fontSize: '8pt', margin: 0 }}>{edu.year}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {resume.certifications.length > 0 && (
                <div>
                  <h2 style={{ 
                    fontSize: '13pt', 
                    fontWeight: 'bold', 
                    color: '#7c3aed',
                    marginBottom: '3mm'
                  }}>Certifications</h2>
                  {resume.certifications.map((cert, i) => (
                    <p key={i} style={{ 
                      fontSize: '9pt', 
                      color: '#4b5563',
                      margin: '0 0 2mm 0',
                      paddingLeft: '3mm',
                      borderLeft: '2px solid #0891b2'
                    }}>
                      {cert}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
CreativeTemplate.displayName = 'CreativeTemplate';

export type TemplateType = 'modern' | 'classic' | 'creative';

export const templates = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  creative: CreativeTemplate,
};

export const templateInfo = {
  modern: {
    name: 'Modern',
    description: 'Clean sidebar layout with accent colors',
    preview: '🎨',
  },
  classic: {
    name: 'Classic',
    description: 'Traditional professional format',
    preview: '📄',
  },
  creative: {
    name: 'Creative',
    description: 'Bold design with gradient header',
    preview: '✨',
  },
};
