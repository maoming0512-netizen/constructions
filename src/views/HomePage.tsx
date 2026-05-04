import { useState, useEffect, useRef, useCallback, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Eye,
  Heart,
  PenTool,
  ChevronDown,
  FileText,
  Scale,
  LayoutGrid,
  GitBranch,
  Wrench,
  Bot,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import type { ConstructionCardData } from '@/types/construction'
import type { ExerciseTypeInfo } from '@/types/exercise'
import { useAuth } from '@/context/AuthContext'

/* ─────────────────────────── data ─────────────────────────── */

const constructions: ConstructionCardData[] = [
  {
    slug: 'ditransitive',
    name: 'Ditransitive',
    category: 'Argument Structure',
    difficulty: 1,
    form: 'Subj V Obj1 Obj2',
    meaning: 'Agent causes Recipient to receive Theme',
    example: 'She gave him a book.',
  },
  {
    slug: 'caused-motion',
    name: 'Caused-Motion',
    category: 'Motion',
    difficulty: 1,
    form: 'Subj V Obj Path',
    meaning: 'Causer causes Theme to move along Path',
    example: 'He sneezed the napkin off the table.',
  },
  {
    slug: 'resultative',
    name: 'Resultative',
    category: 'Resultative',
    difficulty: 2,
    form: 'Subj V Obj Result-AP',
    meaning: 'Agent causes Patient to become Result State',
    example: 'She hammered the metal flat.',
  },
  {
    slug: 'way-construction',
    name: 'Way Construction',
    category: 'Motion',
    difficulty: 2,
    form: 'Subj V Poss-way Path',
    meaning: 'Subject moves along path by means of verb action',
    example: 'He pushed his way through the crowd.',
  },
  {
    slug: 'whats-x-doing-y',
    name: "What's X Doing Y?",
    category: 'Question Construction',
    difficulty: 3,
    form: 'What is X doing Y?',
    meaning: 'Presence or action of X in Y is unexpected or inappropriate',
    example: 'What is this fly doing in my soup?',
  },
  {
    slug: 'sai-family',
    name: 'Subject-Auxiliary Inversion',
    category: 'Information Structure',
    difficulty: 3,
    form: 'Aux Subject Verb ...',
    meaning: 'Non-prototypical assertion: question, conditional, exclamative',
    example: 'Had I known, I would have stayed.',
  },
]

const exerciseTypes: ExerciseTypeInfo[] = [
  {
    id: 'meaning-from-form',
    name: 'Meaning from Form',
    description: 'Given a sentence, identify the construction and its meaning.',
    iconColor: 'var(--lake-blue)',
    bgColor: 'rgba(107,163,190,0.15)',
  },
  {
    id: 'naturalness-judgment',
    name: 'Naturalness Judgment',
    description: 'Rate how natural a sentence feels and understand why.',
    iconColor: 'var(--success)',
    bgColor: 'rgba(107,203,119,0.15)',
  },
  {
    id: 'construction-sorting',
    name: 'Construction Sorting',
    description: 'Sort sentences into their correct construction categories.',
    iconColor: 'var(--lavender)',
    bgColor: 'rgba(184,169,201,0.15)',
  },
  {
    id: 'prototype-to-extension',
    name: 'Prototype to Extension',
    description: 'See how constructions extend from familiar verbs to creative uses.',
    iconColor: 'var(--warning)',
    bgColor: 'rgba(244,162,97,0.15)',
  },
  {
    id: 'repair-sentence',
    name: 'Repair the Sentence',
    description: 'Fix an unnatural sentence to make it conventionally acceptable.',
    iconColor: 'var(--error)',
    bgColor: 'rgba(231,111,81,0.15)',
  },
  {
    id: 'ai-coach',
    name: 'AI Construction Coach',
    description: 'Chat with an AI coach that explains constructions in context.',
    iconColor: 'var(--lake-blue)',
    bgColor: 'rgba(107,163,190,0.20)',
  },
  {
    id: 'generate-by-construction',
    name: 'Generate by Construction',
    description: 'Create your own sentences using a specific construction.',
    iconColor: 'var(--lake-green)',
    bgColor: 'rgba(138,184,154,0.15)',
  },
]

const testimonials = [
  {
    quote:
      "Finally, a grammar tool that makes sense. I can actually feel why 'She smiled him an answer' works \u2014 it's not about rules, it's about meaning.",
    name: 'Li Wei',
    role: 'Graduate Student',
  },
  {
    quote:
      "The AI feedback is incredible. It doesn't just tell me I'm wrong \u2014 it explains the construction and why my sentence doesn't fit the pattern.",
    name: 'Mariko Tanaka',
    role: 'ESL Teacher',
  },
  {
    quote:
      'I always struggled with ditransitive verbs. This site helped me understand that constructions have meaning, not just form. My students love it too.',
    name: 'Carlos Mendez',
    role: 'Language Instructor',
  },
]

/* ─────────────────────────── easing helper ─────────────────────────── */

const easeGentle = [0.22, 1, 0.36, 1] as [number, number, number, number]
const easeSpring = [0.175, 0.885, 0.32, 1.275] as [number, number, number, number]

/* ─────────────────────────── components ─────────────────────────── */

/** Floating particle — isolated perpetual animation */
const FloatingParticle = memo(function FloatingParticle({
  index,
}: {
  index: number
}) {
  const size = 2 + (index % 4) * 1 // 2–5px
  const left = (index * 3.33) % 100
  const duration = 15 + (index % 6) * 5 // 15–40s
  const delay = (index * 0.8) % 10
  const opacity = 0.15 + (index % 3) * 0.1 // 0.15–0.35
  const useSway = index % 2 === 0

  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        bottom: '-10px',
        background: `rgba(255,255,255,${opacity})`,
        filter: 'blur(1px)',
        animation: `${useSway ? 'float-up-sway' : 'float-up'} ${duration}s linear ${delay}s infinite`,
      }}
    />
  )
})

/** Difficulty dots */
function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background:
              i <= level ? 'var(--lake-blue)' : 'rgba(107,163,190,0.2)',
          }}
        />
      ))}
    </div>
  )
}

/** Construction Card */
function ConstructionCard({
  data,
  index,
}: {
  data: ConstructionCardData
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: easeGentle,
      }}
      className="group rounded-[var(--border-radius-lg)] p-6 transition-all duration-[var(--duration-normal)]"
      style={{
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        cursor: 'pointer',
      }}
      whileHover={{
        y: -6,
        boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-caption px-3 py-1 rounded-full"
          style={{
            background: 'rgba(107,163,190,0.15)',
            color: 'var(--lake-blue)',
          }}
        >
          {data.category}
        </span>
        <DifficultyDots level={data.difficulty} />
      </div>

      {/* Title */}
      <h3 className="text-h3 mb-1 text-[--deep-slate]">{data.name}</h3>

      {/* Form */}
      <p className="text-body-sm text-[--soft-gray] mb-3 font-mono">{data.form}</p>

      {/* Meaning */}
      <p className="text-body-sm text-[--deep-slate] mb-4">{data.meaning}</p>

      {/* Example */}
      <p className="text-example italic text-[--deep-slate] mb-6">
        {data.example}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
        <Link
          href={`/constructions/${data.slug}`}
          className="text-sm font-medium flex items-center gap-1 transition-colors duration-[var(--duration-fast)] hover:text-[--deep-slate]"
          style={{ color: 'var(--lake-blue)' }}
        >
          Explore
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/practice"
          className="text-sm font-semibold px-4 py-1.5 rounded-full text-white transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
          style={{ background: 'var(--lake-blue)' }}
        >
          Practice
        </Link>
      </div>
    </motion.div>
  )
}

/** Section Header */
function SectionHeader({
  eyebrow,
  title,
  subtitle,
  eyebrowColor = 'var(--lake-blue)',
  centered = false,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  eyebrowColor?: string
  centered?: boolean
}) {
  return (
    <div className={`mb-10 ${centered ? 'text-center' : ''}`}>
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-caption uppercase tracking-[0.15em] block mb-2"
        style={{ color: eyebrowColor }}
      >
        {eyebrow}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1, ease: easeGentle }}
        className="text-h2 text-[--deep-slate] mb-3"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: easeGentle }}
          className="text-body-lg text-[--soft-gray]"
          style={{ maxWidth: centered ? '640px' : '600px', margin: centered ? '0 auto' : undefined }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}

/* ─────────────────────────── main page ─────────────────────────── */

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isMobile) return
      const x = (e.clientX / window.innerWidth - 0.5) * 40 // ±20px
      const y = (e.clientY / window.innerHeight - 0.5) * 24 // ±12px
      setMousePos({ x, y })
    },
    [isMobile],
  )

  const handleStartPracticingClick = (e: React.MouseEvent) => {
    // 登录限制已禁用 - 允许未登录用户直接访问
    router.push('/practice')
  }

  const handleExploreConstructionsClick = () => {
    // 登录限制已禁用
    router.push('/constructions')
  }

  const handlePracticeCardClick = () => {
    // 登录限制已禁用
    router.push('/practice')
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <div>
      {/* ═══════════════════ Section 1: Hero ═══════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
      >
        {/* Background image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: easeGentle }}
          className="absolute inset-0"
          style={{
            zIndex: -1,
            transform: isMobile
              ? undefined
              : `translate(${mousePos.x}px, ${mousePos.y}px)`,
            transition: isMobile ? undefined : 'transform 0.3s ease-out',
          }}
        >
          <picture>
            <source
              media="(max-width: 639px)"
              srcSet="./hero-landscape-mobile.jpg"
            />
            <img
              src="./hero-landscape.jpg"
              alt="Dreamy landscape"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </picture>
        </motion.div>

        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 0,
            background:
              'linear-gradient(to bottom, rgba(45,55,72,0.35) 0%, rgba(45,55,72,0.20) 40%, rgba(45,55,72,0.50) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            zIndex: 0,
            background: 'var(--gradient-hero)',
            animation: 'gradient-shift 20s ease-in-out infinite',
          }}
        />

        {/* Floating particles */}
        {!isMobile && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <FloatingParticle key={i} index={i} />
            ))}
          </div>
        )}

        {/* Hero content panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.87, 0, 0.13, 1] as [number, number, number, number] }}
          className="relative z-10 mx-4 sm:mx-6 text-center"
          style={{
            backdropFilter: 'var(--glass-blur-heavy)',
            WebkitBackdropFilter: 'var(--glass-blur-heavy)',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 'var(--border-radius-xl)',
            padding: 'clamp(1.5rem, 4vw, 3rem) clamp(2rem, 5vw, 4rem)',
            maxWidth: '720px',
            boxShadow:
              '0 0 60px rgba(107,163,190,0.10), inset 0 0 40px rgba(255,255,255,0.05)',
          }}
        >
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: easeGentle }}
            className="text-hero"
            style={{
              color: 'var(--mist-white)',
              textShadow: '0 2px 20px rgba(0,0,0,0.20)',
            }}
          >
            Learn English as Patterns of Meaning
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-body-lg mt-4 sm:mt-6"
            style={{ color: 'rgba(245, 247, 250, 0.85)' }}
          >
            Not rules to memorize, but constructions to feel, notice, and use.
          </motion.p>

          {/* Chinese note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.85 }}
            className="text-body-sm mt-2"
            style={{ color: 'rgba(245, 247, 250, 0.60)' }}
          >
            在这里，你练习的不是孤立语法点，而是英语中真实存在的"形式-意义配对"。
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9, ease: easeGentle }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleStartPracticingClick}
              className="w-full sm:w-auto px-8 py-3 rounded-full text-white font-semibold text-center transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
              style={{
                background: 'var(--lake-blue)',
                boxShadow: '0 4px 16px rgba(107,163,190,0.30)',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.boxShadow =
                  '0 8px 24px rgba(107,163,190,0.40)'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.boxShadow =
                  '0 4px 16px rgba(107,163,190,0.30)'
              }}
            >
              Start Practicing
            </button>
            <button
              onClick={handleExploreConstructionsClick}
              className="w-full sm:w-auto px-8 py-3 rounded-full font-medium text-center transition-all duration-[var(--duration-fast)]"
              style={{
                color: 'white',
                border: '1px solid rgba(255,255,255,0.40)',
              }}
              onMouseEnter={(e) => {
                const el = e.target as HTMLElement
                el.style.background = 'rgba(255,255,255,0.10)'
                el.style.borderColor = 'rgba(255,255,255,0.60)'
              }}
              onMouseLeave={(e) => {
                const el = e.target as HTMLElement
                el.style.background = 'transparent'
                el.style.borderColor = 'rgba(255,255,255,0.40)'
              }}
            >
              Explore Constructions
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ zIndex: 10, animation: 'bounce-gentle 2s ease-in-out infinite' }}
        >
          <span className="text-caption" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Scroll
          </span>
          <ChevronDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.50)' }} />
        </motion.div>
      </section>

      {/* ═══════════════════ Section 2: Featured Constructions ═══════════════════ */}
      <section
        style={{ background: 'var(--mist-white)', padding: 'var(--space-24) 0 var(--space-20)' }}
      >
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="THE CONSTRUCTIONS"
            title="Six Patterns That Shape English"
            subtitle="Each construction is a pairing of form and meaning \u2014 a pattern you can feel, not a rule to memorize."
          />

          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {constructions.map((c, i) => (
              <ConstructionCard key={c.slug} data={c} index={i} />
            ))}
          </div>

          {/* View All Link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 text-center"
          >
            <Link
              href="/constructions"
              className="text-body font-medium inline-flex items-center gap-1 group transition-colors duration-[var(--duration-fast)] hover:text-[--deep-slate]"
              style={{ color: 'var(--lake-blue)' }}
            >
              Explore the full library
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ Section 3: How It Works ═══════════════════ */}
      <section className="gradient-section" style={{ padding: 'var(--space-24) 0' }}>
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="METHODOLOGY"
            title="Learn by Noticing, Not Memorizing"
            subtitle="Based on Adele E. Goldberg's research in Construction Grammar"
            centered
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                icon: <Eye className="w-10 h-10" />,
                title: 'Notice the Pattern',
                desc: 'Observe real sentences in context. Each construction has a form and a meaning \u2014 a pairing you can recognize, not a rule to apply.',
              },
              {
                num: '02',
                icon: <Heart className="w-10 h-10" />,
                title: 'Feel the Meaning',
                desc: 'Understand what a construction communicates. The ditransitive isn\'t "two objects" \u2014 it\'s "causing someone to receive something."',
              },
              {
                num: '03',
                icon: <PenTool className="w-10 h-10" />,
                title: 'Make It Yours',
                desc: 'Practice with AI-powered feedback that explains why your sentence works (or doesn\'t) from a construction perspective.',
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.2,
                  ease: easeSpring,
                }}
                whileHover={{ y: -4 }}
                className="relative text-center rounded-[var(--border-radius-lg)] p-8 transition-all duration-[var(--duration-normal)]"
                style={{
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  background: 'rgba(255,255,255,0.60)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--glass-shadow)',
                }}
              >
                {/* Watermark number */}
                <span
                  className="absolute top-2 left-1/2 -translate-x-1/2 text-hero pointer-events-none select-none"
                  style={{ color: 'rgba(107,163,190,0.12)' }}
                >
                  {step.num}
                </span>

                {/* Icon */}
                <div
                  className="relative z-10 mx-auto mb-4 text-[--lake-blue]"
                  style={{ marginTop: '1rem' }}
                >
                  {step.icon}
                </div>

                {/* Title */}
                <h4 className="text-h4 text-[--deep-slate] mb-3 relative z-10">
                  {step.title}
                </h4>

                {/* Description */}
                <p
                  className="text-body text-[--soft-gray] relative z-10"
                  style={{ maxWidth: '320px', margin: '0 auto' }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ Section 4: Practice Preview ═══════════════════ */}
      <section
        style={{
          background: 'var(--warm-white)',
          padding: 'var(--space-24) 0',
        }}
      >
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="PRACTICE"
            title="Seven Ways to Explore Constructions"
            eyebrowColor="var(--lake-green)"
            subtitle="Every exercise is designed around form-function mapping \u2014 not multiple-choice grammar drills."
            centered
          />

          {/* Exercise Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {exerciseTypes.map((ex, i) => {
              const IconMap: Record<string, React.ReactNode> = {
                'meaning-from-form': <FileText className="w-5 h-5" />,
                'naturalness-judgment': <Scale className="w-5 h-5" />,
                'construction-sorting': <LayoutGrid className="w-5 h-5" />,
                'prototype-to-extension': <GitBranch className="w-5 h-5" />,
                'repair-sentence': <Wrench className="w-5 h-5" />,
                'ai-coach': <Bot className="w-5 h-5" />,
                'generate-by-construction': <Sparkles className="w-5 h-5" />,
              }
              return (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: easeGentle,
                  }}
                  whileHover={{ y: -2 }}
                  className="group rounded-[var(--border-radius-md)] p-5 transition-all duration-[var(--duration-normal)]"
                  style={{
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.70)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                  }}
                >
                  {/* Icon circle */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-transform duration-[var(--duration-fast)] group-hover:scale-110"
                    style={{ background: ex.bgColor, color: ex.iconColor }}
                  >
                    {IconMap[ex.id]}
                  </div>

                  {/* Name */}
                  <h4 className="text-h4 text-[--deep-slate] mb-2">{ex.name}</h4>

                  {/* Description */}
                  <p className="text-body-sm text-[--soft-gray]">{ex.description}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Practice CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, ease: easeGentle }}
            className="mt-10 text-center"
          >
            <button
              onClick={handlePracticeCardClick}
              className="inline-block px-10 py-3 rounded-full text-white font-semibold transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
              style={{
                background: 'var(--lake-green)',
                boxShadow: '0 4px 16px rgba(138,184,154,0.25)',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.boxShadow =
                  '0 8px 24px rgba(138,184,154,0.35)'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.boxShadow =
                  '0 4px 16px rgba(138,184,154,0.25)'
              }}
            >
              Start Practicing Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ Section 5: Testimonials ═══════════════════ */}
      <section className="gradient-sunset" style={{ padding: 'var(--space-24) 0' }}>
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="TESTIMONIALS"
            title="What Learners Say"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.15,
                  ease: easeGentle,
                }}
                className="rounded-[var(--border-radius-lg)] p-8"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.30)',
                  boxShadow: 'var(--glass-shadow)',
                }}
              >
                {/* Quote */}
                <p
                  className="text-example-lg italic text-[--deep-slate]"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Divider */}
                <div
                  className="my-4 h-px"
                  style={{ background: 'rgba(107,163,190,0.20)' }}
                />

                {/* Name */}
                <p className="text-body-sm font-semibold text-[--deep-slate]">
                  {t.name}
                </p>

                {/* Role */}
                <p className="text-caption text-[--soft-gray]">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ Section 6: CTA + Footer spacer ═══════════════════ */}
      <section
        style={{
          background: 'var(--deep-slate)',
          padding: 'var(--space-24) 0',
        }}
      >
        <div className="max-w-[var(--container-narrow)] mx-auto px-4 sm:px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeGentle }}
            className="text-h2"
            style={{ color: 'var(--mist-white)' }}
          >
            Start Your Construction Journey
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: easeGentle }}
            className="text-body-lg mt-4"
            style={{ color: 'rgba(245, 247, 250, 0.70)' }}
          >
            Join thousands of learners exploring English through the lens of
            Construction Grammar. Free to start, forever to learn.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, ease: easeGentle }}
            className="mt-8"
          >
            <Link
              href="/auth/signup"
              className="inline-block px-12 py-4 rounded-full text-white font-semibold text-lg transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
              style={{
                background: 'var(--lake-blue)',
                boxShadow: '0 8px 24px rgba(107,163,190,0.30)',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.boxShadow =
                  '0 12px 32px rgba(107,163,190,0.40)'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.boxShadow =
                  '0 8px 24px rgba(107,163,190,0.30)'
              }}
            >
              Get Started &mdash; It&rsquo;s Free
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-caption mt-3"
            style={{ color: 'rgba(245, 247, 250, 0.45)' }}
          >
            No credit card required. Start practicing immediately.
          </motion.p>
        </div>
      </section>


    </div>
  )
}
