import { motion, AnimatePresence } from 'motion/react';
import { Linkedin, Mail, ArrowUpRight, ChevronDown, ChevronUp, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { translations, Language } from './translations';

const ExperienceItem = ({ role, company, period, description }: { role: string; company: string; period: string; description: string; key?: string | number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className="border-t border-zen-divider pt-6 mb-12"
    id={`exp-${company.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <div className="flex flex-col gap-1">
      <p className="text-[10px] opacity-40 uppercase tracking-widest mb-1">{period}</p>
      <h3 className="text-xl font-medium">{company}</h3>
      <p className="text-xs opacity-60 uppercase tracking-widest">{role}</p>
    </div>
    <p className="mt-4 text-sm leading-relaxed opacity-70 max-w-lg">{description}</p>
  </motion.div>
);

const ProjectCard = ({ title, description, summary, link, index, alwaysExpanded, t }: { title: string; description: string; summary?: string; link: string; index: string; alwaysExpanded?: boolean; t: any; key?: string | number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const teaser = summary || (description.includes('. ') ? description.split('. ')[0] + '.' : description);
  const isLong = description.length > teaser.length + 10 && !alwaysExpanded;
  const currentText = (isExpanded || alwaysExpanded) ? description : teaser;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="bg-zen-accent/30 p-8 md:p-16 border border-zen-charcoal/5 shadow-sm relative group mb-12 last:mb-0 overflow-hidden"
      id={`project-${index}`}
    >
      <div className="absolute top-6 right-8 text-[10px] tracking-widest uppercase opacity-30 italic">{index} / {t.sections.featured}</div>
      <div className="flex flex-col gap-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-light tracking-tight">{title}</h2>
        
        <div className="relative">
          <motion.div 
            animate={{ height: 'auto' }}
            className="text-sm opacity-60 leading-relaxed max-w-lg overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={isExpanded ? 'full' : 'teaser'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentText}
              </motion.p>
            </AnimatePresence>
          </motion.div>
          
          {isLong && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 text-zen-charcoal/40 hover:text-zen-charcoal transition-colors flex items-center gap-1"
              aria-label={isExpanded ? t.sections.collapse : t.sections.readMore}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>

        <div className="flex gap-4 items-center group">
          <div className="w-10 h-[1px] bg-zen-charcoal transition-all duration-500 group-hover:w-16"></div>
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[0.2em] font-semibold hover:translate-x-2 transition-transform inline-flex items-center gap-2"
          >
            {t.sections.viewProject} <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
      <div className="absolute -bottom-16 -right-16 w-64 h-64 border-[1px] border-zen-charcoal/5 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
    </motion.div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('portfolio-lang');
    return (saved as Language) || 'en';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('portfolio-theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('portfolio-lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('portfolio-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-zen-cream font-sans selection:bg-zen-charcoal/10 selection:text-zen-charcoal flex flex-col pt-24 px-8 md:px-12 lg:px-24 scroll-smooth w-full max-w-screen-xl mx-auto">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zen-cream/80 backdrop-blur-md px-8 md:px-12 lg:px-24 py-6 md:py-8 flex flex-wrap justify-between items-center gap-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-[10px] md:text-xs tracking-[0.3em] font-medium uppercase opacity-60"
        >
          {t.nav.portfolio}
        </motion.div>
        
        <div className="flex items-center gap-4 md:gap-12">
          {/* Toggles */}
          <div className="flex items-center gap-3 md:gap-4 border-r border-zen-divider pr-4 md:pr-12">
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <div className="flex gap-2 text-[10px] tracking-widest font-bold items-center">
              <button 
                onClick={() => setLang('en')}
                className={`transition-opacity ${lang === 'en' ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
              >
                EN
              </button>
              <span className="opacity-20">|</span>
              <button 
                onClick={() => setLang('es')}
                className={`transition-opacity ${lang === 'es' ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
              >
                ES
              </button>
            </div>
          </div>

          <div className="flex gap-4 md:gap-12 text-[10px] tracking-[0.2em] font-bold uppercase">
            <a 
              href="mailto:arturjesusp@gmail.com" 
              className="hover:opacity-40 transition-opacity"
            >
              {t.nav.email}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-24 pb-20 md:pt-48 md:pb-32 flex flex-col items-start" id="hero">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6"
        >
          <h1 className="text-5xl md:text-[100px] font-light leading-[0.9] tracking-tighter">
            {t.hero.name}<br />
            <span className="text-zen-muted italic font-serif">{t.hero.role}</span>
          </h1>
          <p className="max-w-md text-sm md:text-base leading-relaxed opacity-70 mt-4">
            {t.hero.description}
          </p>
        </motion.div>
      </header>

      {/* Main Content Section */}
      <section className="py-24 md:py-32" id="main">
        <div className="grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5 flex flex-col gap-20">
            {/* Experience */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] tracking-[0.4em] uppercase opacity-40 mb-6">{t.sections.experience}</div>
              {t.experience.map((exp, i) => (
                <ExperienceItem 
                  key={i}
                  role={exp.role}
                  company={exp.company}
                  period={exp.period}
                  description={exp.description}
                />
              ))}
            </div>

            {/* Education section */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] tracking-[0.4em] uppercase opacity-40 mb-6">{t.sections.education}</div>
              {t.education.map((edu, i) => (
                <ExperienceItem 
                  key={i}
                  role={edu.degree}
                  company={edu.school}
                  period={edu.period}
                  description={edu.description}
                />
              ))}
            </div>

            {/* Expertise */}
            <div className="flex flex-col gap-3" id="skills">
              <div className="text-[10px] tracking-[0.4em] uppercase opacity-40 mb-6">{t.sections.expertise}</div>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {t.skills.map((skill, i) => {
                  const hoverColors = [
                    { bg: '#eebbcb', text: '#1A1A1A' }, // Sakura Pink (Light)
                    { bg: '#89a3b2', text: '#FFFFFF' }, // Steel Blue (Medium-Dark)
                    { bg: '#d4905a', text: '#FFFFFF' }, // Muted Ochre (Medium)
                    { bg: '#7c8d76', text: '#FFFFFF' }, // Moss Green (Dark)
                    { bg: '#e5d1b1', text: '#1A1A1A' }  // Parchment (Light)
                  ];
                  const colorMatch = hoverColors[i % hoverColors.length];
                  
                  return (
                    <motion.span 
                      key={skill}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      whileHover={{ 
                        backgroundColor: colorMatch.bg,
                        color: colorMatch.text,
                        borderColor: colorMatch.bg,
                        scale: 1.05
                      }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: i * 0.05,
                        backgroundColor: { duration: 0.3 },
                        color: { duration: 0.3 },
                        scale: { type: "spring", stiffness: 300, damping: 20 }
                      }}
                      className="text-[10px] bg-[#f4f1ea] border border-stone-200 px-3 py-1 rounded-full text-[#1A1A1A] uppercase tracking-widest font-bold cursor-default"
                    >
                      {skill}
                    </motion.span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Projects list */}
          <div className="md:col-span-7 flex flex-col gap-12">
            {t.projects.map((project) => (
              <ProjectCard 
                key={project.index}
                title={project.title}
                description={project.description}
                summary={project.summary}
                link={project.link}
                index={project.index}
                alwaysExpanded={project.alwaysExpanded}
                t={t}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Label Section (New Footer Style) */}
      <footer className="pt-8 pb-16 border-t border-zen-divider flex flex-col md:flex-row justify-between items-baseline gap-4">
        <div className="text-[10px] tracking-[0.2em] uppercase opacity-40">
          {t.footer.location}
        </div>
        <div className="text-[10px] tracking-[0.2em] uppercase opacity-40">
          {t.footer.rights}
        </div>
      </footer>
    </div>
  );
}
