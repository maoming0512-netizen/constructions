import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Layers,
  Expand,
  Puzzle,
  BarChart3,
  Grid3X3,
  ChevronDown,
  FileCheck,
  ThumbsUp,
  HeartPulse,
  GraduationCap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                   */
/* ------------------------------------------------------------------ */
const easeGentle = [0.22, 1, 0.36, 1] as [number, number, number, number];
const easeSpring = [0.175, 0.885, 0.32, 1.275] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Principle data                                                      */
/* ------------------------------------------------------------------ */
const principles = [
  {
    icon: Puzzle,
    title: "Form-Function Pairing",
    description:
      "Every construction pairs a specific form with a specific meaning or function. You can't understand the construction by looking at form or meaning alone — you need both.",
    example:
      "She gave him a book. — The form (Subj V Obj1 Obj2) pairs with the meaning 'Agent causes Recipient to receive Theme.'",
  },
  {
    icon: Layers,
    title: "Surface Generalization",
    description:
      "Generalizations about language exist at the surface level — between the forms we actually see and hear. We don't need to derive sentences from deep abstract structures.",
    example:
      "He laughed the conversation to an end. — This is a surface Caused-Motion pattern, not derived from a more basic form.",
  },
  {
    icon: Expand,
    title: "Prototype to Extension",
    description:
      "Constructions are learned from central, frequent examples (prototypes) and gradually extended to less typical uses. The prototype serves as an anchor for understanding.",
    example:
      "Prototype: She put the cup on the table. \u2192 Extension: He sneezed the napkin off the table.",
  },
  {
    icon: Puzzle,
    title: "Semantic Coherence",
    description:
      "The verb's meaning must be semantically compatible with the construction's meaning. The construction and the verb work together — the construction can even 'coerce' a verb into a new interpretation.",
    example:
      "She baked him a cake. — 'Bake' doesn't inherently involve transfer, but the ditransitive construction provides the caused-reception meaning.",
  },
  {
    icon: BarChart3,
    title: "Statistical Pre-emption",
    description:
      "Some sentences are theoretically possible but blocked by more frequent alternatives. Learners need to know not just what's possible, but what's conventional.",
    example:
      "He disappeared the rabbit. is blocked by He made the rabbit disappear. — the periphrastic causative is more entrenched.",
  },
  {
    icon: Grid3X3,
    title: "Partial Productivity",
    description:
      "Constructions are productive (they accept new verbs) but only partially — verbs must be semantically compatible. Not every verb can go in every construction.",
    example:
      "Pat helped her grandmother walk. \u2713 but Pat aided her grandmother walk. \u2717 — 'Help' appears in the construction but 'aid' does not.",
  },
];

/* ------------------------------------------------------------------ */
/*  Core constructions data                                             */
/* ------------------------------------------------------------------ */
const coreConstructions = [
  {
    name: "Ditransitive",
    category: "Argument Structure",
    form: "Subj V Obj1 Obj2",
    meaning: "Agent causes Recipient to receive Theme",
    example: "She gave him a book.",
    slug: "ditransitive",
  },
  {
    name: "Caused-Motion",
    category: "Motion",
    form: "Subj V Obj Path",
    meaning: "Causer causes Theme to move along Path",
    example: "He sneezed the napkin off the table.",
    slug: "caused-motion",
  },
  {
    name: "Resultative",
    category: "Resultative",
    form: "Subj V Obj Result-AP",
    meaning: "Agent causes Patient to become Result State",
    example: "She hammered the metal flat.",
    slug: "resultative",
  },
  {
    name: "Way Construction",
    category: "Motion",
    form: "Subj V Poss-way Path",
    meaning: "Subject moves along path by means of verb action",
    example: "He pushed his way through the crowd.",
    slug: "way-construction",
  },
  {
    name: "What's X Doing Y?",
    category: "Question",
    form: "What is X doing Y?",
    meaning: "Presence or action of X in Y is unexpected",
    example: "What is this fly doing in my soup?",
    slug: "whats-doing",
  },
  {
    name: "Subject-Auxiliary Inversion",
    category: "Information Structure",
    form: "Aux Subject Verb ...",
    meaning: "Non-prototypical assertion: question, conditional, exclamative",
    example: "Had I known, I would have stayed.",
    slug: "subject-auxiliary-inversion",
  },
];

/* ------------------------------------------------------------------ */
/*  Benefit cards data                                                  */
/* ------------------------------------------------------------------ */
const benefits = [
  {
    icon: FileCheck,
    title: "Learn from Real Examples",
    description:
      "Research shows that learners internalize patterns from exposure to concrete examples more effectively than from abstract rules. Our platform is built around real sentences in meaningful contexts.",
    stat: "10,000+",
    statLabel: "example sentences analyzed",
  },
  {
    icon: ThumbsUp,
    title: "Understand Naturalness",
    description:
      "Native speaker intuitions about what sounds 'natural' are based on statistical patterns in the input they've received. Our naturalness judgment exercises train this intuition directly.",
    stat: "82%",
    statLabel: "of users report improved naturalness intuition",
  },
  {
    icon: HeartPulse,
    title: "Feel the Meaning",
    description:
      "When you understand that a construction carries meaning — not just structure — you can use it creatively and appropriately. Our AI feedback explains the form-function mapping in every exercise.",
    stat: "7",
    statLabel: "unique exercise types for deep learning",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */
export default function AboutPage() {
  return (
    <div className="min-h-[100dvh]">
      <PageHeader />
      <WhatIsCxG />
      <KeyPrinciples />
      <CoreConstructions />
      <WhyItWorks />
      <AboutGoldberg />
      <CTASection />
    </div>
  );
}

/* ================================================================== */
/*  Section 1 — Page Header                                           */
/* ================================================================== */
function PageHeader() {
  return (
    <section
      style={{
        background:
          "linear-gradient(180deg, rgba(107,163,190,0.06) 0%, var(--mist-white) 100%)",
        paddingTop: "var(--space-20)",
        paddingBottom: "var(--space-12)",
      }}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-caption mb-4"
          style={{ color: "var(--soft-gray)" }}
        >
          <Link href="/" className="hover:text-[--lake-blue] transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>About</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeGentle }}
          className="text-h1"
          style={{ color: "var(--deep-slate)" }}
        >
          The Methodology
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="text-body-lg mt-3"
          style={{ color: "var(--soft-gray)", maxWidth: 680 }}
        >
          Syntax Lab is built on Construction Grammar — a theory of language
          developed by linguist Adele E. Goldberg. Here&apos;s how it works and why
          it matters for learning English.
        </motion.p>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Section 2 — What Is Construction Grammar?                           */
/* ================================================================== */
function WhatIsCxG() {
  return (
    <section
      style={{
        background: "var(--mist-white)",
        padding: "var(--space-16) 0",
      }}
    >
      <div className="max-w-[var(--container-narrow)] mx-auto px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: easeGentle }}
          className="text-h2"
          style={{ color: "var(--deep-slate)" }}
        >
          What Is Construction Grammar?
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-body-lg mt-6 space-y-4"
          style={{ color: "var(--deep-slate)", lineHeight: 1.75 }}
        >
          <p>
            Traditional grammar teaching treats language as a set of rules to be
            memorized: &ldquo;Add -ed for past tense,&rdquo; &ldquo;Use &lsquo;who&rsquo; for people and
            &lsquo;which&rsquo; for things.&rdquo; But native speakers don&apos;t actually use language
            this way. They draw on thousands of stored patterns — pairings of
            form and meaning that they&apos;ve encountered and internalized over time.
          </p>
          <p>
            Construction Grammar, developed by linguist{" "}
            <strong>Adele E. Goldberg</strong>, proposes that{" "}
            <em>
              all levels of grammatical analysis involve constructions
            </em>{" "}
            — learned pairings of form with semantic or discourse function. This
            includes individual words, idioms like &ldquo;kick the bucket,&rdquo; partially
            filled patterns like &ldquo;the X-er, the Y-er&rdquo; (the bigger, the better), and
            fully general patterns like the ditransitive (Subj V Obj1 Obj2).
          </p>
          <p>
            A construction is recognized as long as{" "}
            <em>
              some aspect of its form or function is not strictly predictable
            </em>{" "}
            from its component parts. For example, the sentence{" "}
            <span className="font-accent italic">
              &ldquo;She sneezed the napkin off the table&rdquo;
            </span>{" "}
            doesn&apos;t make sense if you only look at the word &ldquo;sneeze&rdquo; —
            sneezing isn&apos;t typically something you do to napkins. But the{" "}
            <strong>Caused-Motion construction</strong> provides the &ldquo;cause to
            move&rdquo; meaning that makes the sentence perfectly understandable.
          </p>
        </motion.div>

        {/* Pull Quote */}
        <motion.blockquote
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="my-10 pl-6 border-l-[3px]"
          style={{ borderColor: "var(--lake-blue)" }}
        >
          <p
            className="text-example-lg italic"
            style={{ color: "var(--deep-slate)" }}
          >
            &ldquo;Constructions are the fundamental units of language — form-meaning
            pairings that range from morphemes to complex sentence patterns.&rdquo;
          </p>
          <cite
            className="text-body-sm block mt-2 not-italic"
            style={{ color: "var(--soft-gray)" }}
          >
            — Adele E. Goldberg
          </cite>
        </motion.blockquote>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 rounded-[var(--border-radius-lg)] overflow-hidden"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <table className="w-full">
            <caption className="sr-only">
              Comparison between Traditional Grammar and Construction Grammar
            </caption>
            <thead>
              <tr style={{ background: "rgba(107,163,190,0.08)" }}>
                <th
                  className="text-caption text-left px-5 py-4 font-semibold"
                  style={{ color: "var(--soft-gray)", width: "50%" }}
                >
                  Traditional Grammar
                </th>
                <th
                  className="text-caption text-left px-5 py-4 font-semibold"
                  style={{ color: "var(--lake-blue)", width: "50%" }}
                >
                  Construction Grammar
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Rules to memorize",
                  "Patterns to notice and internalize",
                ],
                [
                  "Verbs determine sentence structure",
                  "Constructions and verbs interact; constructions contribute meaning",
                ],
                [
                  "'Sneeze' is intransitive only",
                  "'Sneeze' can appear in caused-motion: 'He sneezed the napkin off the table'",
                ],
                [
                  "Correct vs. incorrect",
                  "Natural vs. unconventional (statistical pre-emption)",
                ],
                [
                  "Abstract rules applied to examples",
                  "Concrete examples generalize to abstract patterns",
                ],
                [
                  "Deep structure transformations",
                  "Surface generalizations are primary",
                ],
              ].map(([left, right], i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="border-b"
                  style={{ borderColor: "var(--glass-border)" }}
                >
                  <td
                    className="text-body-sm px-5 py-4"
                    style={{ color: "var(--deep-slate)" }}
                  >
                    {left}
                  </td>
                  <td
                    className="text-body-sm px-5 py-4"
                    style={{ color: "var(--deep-slate)" }}
                  >
                    {right}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Section 3 — Key Principles                                          */
/* ================================================================== */
function KeyPrinciples() {
  return (
    <section
      style={{
        background:
          "linear-gradient(180deg, var(--mist-white) 0%, var(--warm-white) 100%)",
        padding: "var(--space-20) 0",
      }}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: easeGentle }}
        >
          <span
            className="text-caption uppercase tracking-[0.15em]"
            style={{ color: "var(--lake-blue)" }}
          >
            Key Principles
          </span>
          <h2
            className="text-h2 mt-2"
            style={{ color: "var(--deep-slate)" }}
          >
            How Constructions Work
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {principles.map((p, i) => (
            <PrincipleCard key={i} principle={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PrincipleCard({
  principle: p,
  index: i,
}: {
  principle: (typeof principles)[0];
  index: number;
}) {
  const Icon = p.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.6,
        delay: i * 0.12,
        ease: easeSpring,
      }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      className="rounded-[var(--border-radius-xl)] p-8 relative overflow-hidden transition-all duration-[var(--duration-normal)]"
      style={{
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--glass-border-hover)";
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--glass-border)";
        e.currentTarget.style.boxShadow = "var(--glass-shadow)";
      }}
    >
      {/* Watermark number */}
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.12 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 + i * 0.12 }}
        className="absolute top-4 right-4 text-hero font-display pointer-events-none select-none"
        style={{ color: "var(--lake-blue)" }}
      >
        {String(i + 1).padStart(2, "0")}
      </motion.span>

      {/* Icon */}
      <Icon className="w-10 h-10" style={{ color: "var(--lake-blue)" }} />

      {/* Title */}
      <h4 className="text-h4 mt-4" style={{ color: "var(--deep-slate)" }}>
        {p.title}
      </h4>

      {/* Description */}
      <p
        className="text-body mt-3"
        style={{ color: "var(--soft-gray)", lineHeight: 1.65 }}
      >
        {p.description}
      </p>

      {/* Example */}
      <p
        className="text-example mt-4 pl-3 border-l-2 italic"
        style={{
          color: "var(--deep-slate)",
          borderColor: "var(--lake-blue)",
        }}
      >
        {p.example}
      </p>
    </motion.div>
  );
}

/* ================================================================== */
/*  Section 4 — The Six Core Constructions                              */
/* ================================================================== */
function CoreConstructions() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      style={{
        background: "var(--warm-white)",
        padding: "var(--space-16) 0",
      }}
    >
      <div className="max-w-[var(--container-narrow)] mx-auto px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: easeGentle }}
          className="text-h2"
          style={{ color: "var(--deep-slate)" }}
        >
          The Six Core Constructions
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-body-lg mt-2"
          style={{ color: "var(--soft-gray)" }}
        >
          These are the constructions you&apos;ll explore and practice on
          Syntax Lab.
        </motion.p>

        {/* Accordion */}
        <div className="mt-8 space-y-3">
          {coreConstructions.map((cx, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-[var(--border-radius-lg)] overflow-hidden"
                style={{
                  border: "1px solid var(--glass-border)",
                  background: "var(--glass-bg)",
                }}
              >
                {/* Header */}
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left transition-colors hover:bg-[rgba(107,163,190,0.04)]"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen
                      className="w-5 h-5 shrink-0"
                      style={{ color: "var(--lake-blue)" }}
                    />
                    <span
                      className="text-h4"
                      style={{ color: "var(--deep-slate)" }}
                    >
                      {cx.name}
                    </span>
                    <span
                      className="text-caption px-2.5 py-0.5 rounded-full hidden sm:inline-block"
                      style={{
                        background: "rgba(107,163,190,0.12)",
                        color: "var(--lake-blue)",
                      }}
                    >
                      {cx.category}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown
                      className="w-5 h-5 shrink-0"
                      style={{ color: "var(--soft-gray)" }}
                    />
                  </motion.div>
                </button>

                {/* Content */}
                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: easeGentle }}
                  className="overflow-hidden"
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-3">
                    <code
                      className="inline-block text-body-sm px-2 py-0.5 rounded"
                      style={{
                        fontFamily: "'Courier New', monospace",
                        color: "var(--lake-blue)",
                        background: "rgba(107,163,190,0.06)",
                      }}
                    >
                      {cx.form}
                    </code>
                    <p
                      className="text-body"
                      style={{ color: "var(--deep-slate)" }}
                    >
                      {cx.meaning}
                    </p>
                    <p
                      className="text-example pl-3 border-l-2 italic"
                      style={{
                        color: "var(--deep-slate)",
                        borderColor: "rgba(107,163,190,0.25)",
                      }}
                    >
                      {cx.example}
                    </p>
                    <Link
                      href={`/constructions/${cx.slug}`}
                      className="inline-flex items-center gap-1 text-body-sm font-medium mt-2 transition-colors duration-[var(--duration-fast)] hover:underline"
                      style={{ color: "var(--lake-blue)" }}
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Section 5 — Why This Approach Works                                 */
/* ================================================================== */
function WhyItWorks() {
  return (
    <section
      style={{
        background: "var(--mist-white)",
        padding: "var(--space-20) 0",
      }}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: easeGentle }}
        >
          <span
            className="text-caption uppercase tracking-[0.15em]"
            style={{ color: "var(--lake-green)" }}
          >
            Research-Backed
          </span>
          <h2
            className="text-h2 mt-2"
            style={{ color: "var(--deep-slate)" }}
          >
            Why This Approach Works
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
          {benefits.map((b, i) => (
            <BenefitCard key={i} benefit={b} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitCard({
  benefit: b,
  index: i,
}: {
  benefit: (typeof benefits)[0];
  index: number;
}) {
  const Icon = b.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: i * 0.15, ease: easeGentle }}
      className="rounded-[var(--border-radius-lg)] p-8"
      style={{
        background: "rgba(138,184,154,0.06)",
        border: "1px solid rgba(138,184,154,0.15)",
      }}
    >
      <Icon className="w-10 h-10" style={{ color: "var(--lake-green)" }} />

      <h4 className="text-h4 mt-4" style={{ color: "var(--deep-slate)" }}>
        {b.title}
      </h4>

      <p
        className="text-body mt-3"
        style={{ color: "var(--soft-gray)" }}
      >
        {b.description}
      </p>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
        className="text-h3 mt-4"
        style={{ color: "var(--lake-green)" }}
      >
        {b.stat}
      </motion.p>
      <p className="text-caption" style={{ color: "var(--soft-gray)" }}>
        {b.statLabel}
      </p>
    </motion.div>
  );
}

/* ================================================================== */
/*  Section 6 — About Adele E. Goldberg                                 */
/* ================================================================== */
function AboutGoldberg() {
  return (
    <section
      style={{
        background:
          "linear-gradient(135deg, rgba(184,169,201,0.08) 0%, rgba(107,163,190,0.06) 100%)",
        padding: "var(--space-16) 0",
      }}
    >
      <div className="max-w-[var(--container-narrow)] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: easeGentle }}
          >
            <span
              className="text-caption uppercase tracking-[0.15em]"
              style={{ color: "var(--lavender)" }}
            >
              The Research
            </span>
            <h2
              className="text-h2 mt-2"
              style={{ color: "var(--deep-slate)" }}
            >
              About Adele E. Goldberg
            </h2>

            <div
              className="text-body-lg mt-6 space-y-4"
              style={{ color: "var(--deep-slate)", lineHeight: 1.75 }}
            >
              <p>
                Adele E. Goldberg is a professor of linguistics at Princeton
                University and one of the foremost researchers in Construction
                Grammar theory. Her groundbreaking work, beginning with her 1995
                book &ldquo;Constructions: A Construction Grammar Approach to Argument
                Structure&rdquo; and continuing through &ldquo;Constructions at Work: The
                Nature of Generalization in Language&rdquo; (2006), established the
                theoretical framework that underpins this platform.
              </p>
              <p>
                Goldberg&apos;s research demonstrates that language is learned through
                exposure to usage — learners extract patterns from the input they
                receive, building both item-specific knowledge and abstract
                generalizations. Her work on argument structure constructions,
                statistical pre-emption, and partial productivity provides the
                scientific foundation for how Syntax Lab teaches English.
              </p>
            </div>

            {/* Key Publications */}
            <div className="mt-6">
              <h4
                className="text-h4 mb-3"
                style={{ color: "var(--deep-slate)" }}
              >
                Key Publications
              </h4>
              <ul className="space-y-2">
                {[
                  "Constructions: A Construction Grammar Approach to Argument Structure (1995)",
                  "Constructions at Work: The Nature of Generalization in Language (2006)",
                  "Explain Me This: Creativity, Competition, and the Partial Productivity of Constructions (2019)",
                ].map((pub, i) => (
                  <li
                    key={i}
                    className="text-body font-accent italic"
                    style={{ color: "var(--deep-slate)" }}
                  >
                    <em>{pub}</em>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Decorative visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 0.7, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="hidden md:block rounded-[var(--border-radius-xl)] overflow-hidden aspect-[3/4]"
            style={{
              background:
                "linear-gradient(135deg, rgba(107,163,190,0.20) 0%, rgba(138,184,154,0.15) 35%, rgba(184,169,201,0.20) 70%, rgba(107,163,190,0.10) 100%)",
            }}
            role="presentation"
            aria-hidden="true"
          >
            <div
              className="w-full h-full"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 20%, rgba(107,163,190,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(138,184,154,0.25) 0%, transparent 45%), radial-gradient(ellipse at 50% 90%, rgba(184,169,201,0.25) 0%, transparent 40%)",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Section 7 — CTA                                                     */
/* ================================================================== */
function CTASection() {
  return (
    <section
      style={{
        background: "var(--deep-slate)",
        padding: "var(--space-20) 0",
      }}
    >
      <div className="max-w-[600px] mx-auto px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: easeGentle }}
          className="text-h2"
          style={{ color: "var(--mist-white)" }}
        >
          Ready to Explore English as Patterns of Meaning?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-body-lg mt-4"
          style={{ color: "rgba(245, 247, 250, 0.70)" }}
        >
          Start practicing constructions today. No memorization required — just
          observation, understanding, and creative use.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease: easeGentle }}
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 text-body font-semibold text-white px-10 py-4 rounded-full transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
            style={{ background: "var(--lake-blue)" }}
          >
            <GraduationCap className="w-5 h-5" />
            Start Practicing
          </Link>
          <Link
            href="/constructions"
            className="inline-flex items-center gap-2 text-body font-semibold px-10 py-4 rounded-full border transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
            style={{
              borderColor: "rgba(255,255,255,0.30)",
              color: "white",
              background: "transparent",
            }}
          >
            <BookOpen className="w-5 h-5" />
            Explore Library
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
