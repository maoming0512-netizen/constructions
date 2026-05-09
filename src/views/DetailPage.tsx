'use client'

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import {
  getConstructionBySlug,
  getRelatedConstructions,
} from "@/data/constructions";
import type { ConstructionDetail, PrototypeExample, ExtendedExample, ContrastPair } from "@/data/constructions";

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                   */
/* ------------------------------------------------------------------ */
const easeGentle = [0.22, 1, 0.36, 1] as [number, number, number, number];
const easeSpring = [0.175, 0.885, 0.32, 1.275] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Difficulty dots                                                     */
/* ------------------------------------------------------------------ */
function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background:
              i <= level ? "var(--lake-blue)" : "rgba(107,163,190,0.15)",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */
export default function DetailPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const construction = getConstructionBySlug(slug || "");

  if (!construction) {
    return <NotFound />;
  }

  return (
    <div className="min-h-[100dvh]">
      <HeroHeader c={construction} />
      <FormMeaningMap c={construction} />
      <MeaningOverview c={construction} />
      <PrototypeExamples c={construction} />
      <ExtendedExamples c={construction} />
      <ContrastZone c={construction} />
      <PracticeEntry c={construction} />
      <RelatedConstructions c={construction} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Not Found                                                           */
/* ------------------------------------------------------------------ */
function NotFound() {
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center"
      style={{ background: "var(--mist-white)" }}
    >
      <div className="text-center">
        <h1 className="text-h1" style={{ color: "var(--deep-slate)" }}>
          Construction Not Found
        </h1>
        <p className="text-body mt-4" style={{ color: "var(--soft-gray)" }}>
          The construction you are looking for does not exist.
        </p>
        <Link
          href="/constructions"
          className="inline-flex items-center gap-2 mt-6 text-body-sm font-medium text-white px-6 py-3 rounded-full transition-all hover:-translate-y-0.5"
          style={{ background: "var(--lake-blue)" }}
        >
          <ArrowRight className="w-4 h-4" />
          Back to Library
        </Link>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Section 1 — Hero Header                                           */
/* ================================================================== */
function HeroHeader({ c }: { c: ConstructionDetail }) {
  return (
    <section
      style={{
        background:
          "linear-gradient(135deg, rgba(107,163,190,0.10) 0%, rgba(184,169,201,0.08) 100%)",
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
          <Link
            href="/constructions"
            className="hover:text-[--lake-blue] transition-colors"
          >
            Constructions
          </Link>
          <span className="mx-2">/</span>
          <span>{c.name}</span>
        </motion.div>

        {/* Category + Difficulty */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: easeGentle }}
          className="flex items-center gap-3"
        >
          <span
            className="text-caption px-3 py-1 rounded-full"
            style={{
              background: "rgba(107,163,190,0.12)",
              color: "var(--lake-blue)",
            }}
          >
            {c.category}
          </span>
          <DifficultyDots level={c.difficulty} />
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: easeGentle }}
          className="text-h1 mt-3"
          style={{ color: "var(--deep-slate)" }}
        >
          {c.name}
        </motion.h1>

        {/* Form template */}
        <motion.code
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: easeGentle }}
          className="inline-block mt-4 px-5 py-3 rounded-[var(--border-radius-md)] text-xl"
          style={{
            fontFamily: "'Courier New', monospace",
            background: "rgba(107,163,190,0.08)",
            color: "var(--lake-blue)",
            letterSpacing: "0.02em",
          }}
        >
          {c.formPattern}
        </motion.code>

        {/* Semantic formula */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="text-body-lg mt-3"
          style={{ color: "var(--soft-gray)" }}
        >
          {c.semanticFormula}
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65, ease: easeGentle }}
          className="flex items-center gap-3 mt-6"
        >
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 text-body-sm font-medium text-white px-6 py-3 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "var(--lake-blue)" }}
          >
            <GraduationCap className="w-4 h-4" />
            Practice This
          </Link>
          <button
            className="inline-flex items-center gap-2 text-body-sm font-medium px-6 py-3 rounded-full border transition-all duration-[var(--duration-fast)] hover:border-[--lake-blue] hover:text-[--lake-blue]"
            style={{
              borderColor: "var(--glass-border)",
              color: "var(--soft-gray)",
            }}
          >
            <Bookmark className="w-4 h-4" />
            Bookmark
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Section 2 — Form-Meaning Map                                        */
/* ================================================================== */
function FormMeaningMap({ c }: { c: ConstructionDetail }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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
          className="text-h3 text-center"
          style={{ color: "var(--deep-slate)" }}
        >
          Form–Meaning Map
        </motion.h2>

        {/* Diagram container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: easeSpring }}
          className="mt-6 rounded-[var(--border-radius-xl)] p-6 sm:p-10"
          style={{
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            boxShadow: "var(--glass-shadow)",
          }}
          aria-label="Diagram showing the mapping from syntactic form slots to semantic meaning roles"
        >
          {/* Form Row (Top) */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {c.formMeaningMap.map((slot, i) => (
              <motion.div
                key={`form-${i}`}
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div
                  className="px-4 sm:px-5 py-2.5 rounded-[var(--border-radius-md)] text-center min-w-[72px] transition-all duration-[var(--duration-fast)]"
                  style={{
                    border: "2px solid var(--lake-blue)",
                    background:
                      hoveredIdx === i
                        ? "rgba(107,163,190,0.18)"
                        : "rgba(107,163,190,0.08)",
                    boxShadow:
                      hoveredIdx === i
                        ? "0 0 12px rgba(107,163,190,0.25)"
                        : "none",
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  role="img"
                  aria-label={`Form slot: ${slot.formSlot}`}
                >
                  <span
                    className="text-body-sm font-semibold"
                    style={{ color: "var(--lake-blue)" }}
                  >
                    {slot.formSlot}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Arrows + Labels */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 my-4 sm:my-6">
            {c.formMeaningMap.map((slot, i) => (
              <div
                key={`arrow-${i}`}
                className="flex flex-col items-center min-w-[72px]"
                style={{ flex: "0 0 auto" }}
              >
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="w-0.5 h-6 sm:h-8 origin-top"
                  style={{
                    background:
                      "linear-gradient(to bottom, var(--lake-blue), var(--lake-green))",
                  }}
                />
                <span
                  className="text-caption mt-1"
                  style={{ color: "var(--soft-gray)" }}
                >
                  {slot.semanticRole}
                </span>
              </div>
            ))}
          </div>

          {/* Central meaning label */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="text-body text-center font-medium my-4 sm:my-6"
            style={{ color: "var(--deep-slate)" }}
          >
            → {c.semanticFormula}
          </motion.p>

          {/* Meaning Row (Bottom) */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {c.formMeaningMap.map((slot, i) => (
              <motion.div
                key={`mean-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div
                  className="px-4 sm:px-5 py-2.5 rounded-[var(--border-radius-md)] text-center min-w-[72px] transition-all duration-[var(--duration-fast)]"
                  style={{
                    border: "2px solid var(--lake-green)",
                    background:
                      hoveredIdx === i
                        ? "rgba(138,184,154,0.18)"
                        : "rgba(138,184,154,0.08)",
                    boxShadow:
                      hoveredIdx === i
                        ? "0 0 12px rgba(138,184,154,0.25)"
                        : "none",
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  role="img"
                  aria-label={`Meaning slot: ${slot.meaningSlot}`}
                >
                  <span
                    className="text-body-sm font-semibold"
                    style={{ color: "var(--lake-green)" }}
                  >
                    {slot.meaningSlot}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Section 3 — Meaning & Usage Overview                                */
/* ================================================================== */
function MeaningOverview({ c }: { c: ConstructionDetail }) {
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
          className="text-h3"
          style={{ color: "var(--deep-slate)" }}
        >
          Meaning &amp; Usage
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-body-lg mt-6 space-y-4"
          style={{ color: "var(--deep-slate)", lineHeight: 1.75 }}
          dangerouslySetInnerHTML={{ __html: c.meaningDescription.replace(/\n\n/g, "</p><p class='mt-4'>") }}
        />

        {/* Semantic Anchors */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6"
        >
          <h4 className="text-h4" style={{ color: "var(--deep-slate)" }}>
            Semantic Anchors
          </h4>
          <div className="flex flex-wrap gap-2 mt-3">
            {c.semanticAnchors.map((verb) => (
              <span
                key={verb}
                className="text-caption px-3 py-1 rounded-full"
                style={{
                  background: "rgba(107,163,190,0.08)",
                  color: "var(--lake-blue)",
                }}
              >
                {verb}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Usage Contexts Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 space-y-3"
        >
          <h4 className="text-h4" style={{ color: "var(--deep-slate)" }}>
            Usage Contexts
          </h4>
          {c.usageContexts.map((ctx, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-[var(--border-radius-md)] overflow-hidden"
                style={{
                  border: "1px solid var(--glass-border)",
                  background: "var(--glass-bg)",
                }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[rgba(107,163,190,0.04)]"
                  aria-expanded={isOpen}
                >
                  <span className="text-h4" style={{ color: "var(--deep-slate)" }}>
                    {ctx.title}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown
                      className="w-5 h-5"
                      style={{ color: "var(--soft-gray)" }}
                    />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: easeGentle }}
                  className="overflow-hidden"
                >
                  <p
                    className="px-5 pb-4 text-body"
                    style={{ color: "var(--deep-slate)" }}
                  >
                    {ctx.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Section 4 — Prototype Examples                                      */
/* ================================================================== */
function PrototypeExamples({ c }: { c: ConstructionDetail }) {
  return (
    <section
      style={{
        background: "var(--mist-white)",
        padding: "var(--space-16) 0",
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
            className="text-caption uppercase tracking-[0.12em]"
            style={{ color: "var(--lake-green)" }}
          >
            Prototype Examples
          </span>
          <h2
            className="text-h3 mt-2"
            style={{ color: "var(--deep-slate)" }}
          >
            The Most Natural Uses
          </h2>
          <p className="text-body mt-2" style={{ color: "var(--soft-gray)" }}>
            These are the most typical, frequent examples. Master these first.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {c.prototypeExamples.map((ex, i) => (
            <PrototypeCard key={i} example={ex} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PrototypeCard({
  example: ex,
  index: i,
}: {
  example: PrototypeExample;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: i * 0.12,
        ease: easeSpring,
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="rounded-[var(--border-radius-lg)] p-6 transition-all duration-[var(--duration-fast)]"
      style={{
        border: "1px solid var(--glass-border)",
        background: "rgba(138,184,154,0.06)",
      }}
    >
      {/* Sentence */}
      <p
        className="text-example-lg italic"
        style={{ color: "var(--deep-slate)" }}
        dangerouslySetInnerHTML={{ __html: ex.sentence }}
      />

      {/* Verb label */}
      <p
        className="text-body-sm font-medium mt-3"
        style={{ color: "var(--lake-green)" }}
      >
        Verb: <strong>{ex.verb}</strong>
      </p>

      {/* Naturalness bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-caption" style={{ color: "var(--soft-gray)" }}>
            Naturalness
          </span>
          <span
            className="text-caption"
            style={{ color: "var(--lake-green)" }}
          >
            {ex.naturalnessScore}%
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(138,184,154,0.15)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${ex.naturalnessScore}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: easeGentle }}
            className="h-full rounded-full"
            style={{ background: "var(--lake-green)" }}
          />
        </div>
      </div>

      {/* Explanation */}
      <p
        className="text-body-sm mt-3"
        style={{ color: "var(--soft-gray)" }}
      >
        {ex.explanation}
      </p>
    </motion.div>
  );
}

/* ================================================================== */
/*  Section 5 — Extended Examples                                       */
/* ================================================================== */
function ExtendedExamples({ c }: { c: ConstructionDetail }) {
  return (
    <section
      style={{
        background: "var(--warm-white)",
        padding: "var(--space-16) 0",
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
            className="text-caption uppercase tracking-[0.12em]"
            style={{ color: "var(--lavender)" }}
          >
            Extended Examples
          </span>
          <h2
            className="text-h3 mt-2"
            style={{ color: "var(--deep-slate)" }}
          >
            Creative Extensions
          </h2>
          <p className="text-body mt-2" style={{ color: "var(--soft-gray)" }}>
            These are less typical but still acceptable. They show how
            constructions stretch beyond their prototypes.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {c.extendedExamples.map((ex, i) => (
            <ExtendedCard key={i} example={ex} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ExtendedCard({
  example: ex,
  index: i,
}: {
  example: ExtendedExample;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: i * 0.12,
        ease: easeSpring,
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="rounded-[var(--border-radius-lg)] p-6 transition-all duration-[var(--duration-fast)]"
      style={{
        border: "1px solid rgba(184,169,201,0.25)",
        background: "rgba(184,169,201,0.06)",
      }}
    >
      {/* Sentence */}
      <p
        className="text-example-lg italic"
        style={{ color: "var(--deep-slate)" }}
        dangerouslySetInnerHTML={{ __html: ex.sentence }}
      />

      {/* Verb label */}
      <p
        className="text-body-sm font-medium mt-3"
        style={{ color: "var(--lavender)" }}
      >
        Verb: <strong>{ex.verb}</strong>
      </p>

      {/* Naturalness bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-caption" style={{ color: "var(--soft-gray)" }}>
            Naturalness
          </span>
          <span className="text-caption" style={{ color: "var(--lavender)" }}>
            {ex.naturalnessScore}%
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(184,169,201,0.15)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${ex.naturalnessScore}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: easeGentle }}
            className="h-full rounded-full"
            style={{ background: "var(--lavender)" }}
          />
        </div>
      </div>

      {/* Acceptability badge */}
      <div className="mt-3">
        <span
          className="text-caption px-2.5 py-0.5 rounded-full"
          style={{
            background:
              ex.acceptability === "acceptable"
                ? "rgba(107,203,119,0.12)"
                : "rgba(244,162,97,0.12)",
            color:
              ex.acceptability === "acceptable"
                ? "var(--success)"
                : "var(--warning)",
          }}
        >
          {ex.acceptability === "acceptable" ? "✓ Acceptable" : "△ Marginal"}
        </span>
      </div>

      {/* Explanation */}
      <p
        className="text-body-sm mt-3"
        style={{ color: "var(--soft-gray)" }}
      >
        {ex.explanation}
      </p>
    </motion.div>
  );
}

/* ================================================================== */
/*  Section 6 — Contrast Zone                                           */
/* ================================================================== */
function ContrastZone({ c }: { c: ConstructionDetail }) {
  return (
    <section
      style={{
        background: "var(--mist-white)",
        padding: "var(--space-16) 0",
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
            className="text-caption uppercase tracking-[0.12em]"
            style={{ color: "var(--warning)" }}
          >
            Contrast Zone
          </span>
          <h2
            className="text-h3 mt-2"
            style={{ color: "var(--deep-slate)" }}
          >
            How Is This Different?
          </h2>
          <p className="text-body mt-2" style={{ color: "var(--soft-gray)" }}>
            Compare this construction with similar patterns to understand when
            to use which.
          </p>
        </motion.div>

        {/* Contrast pairs */}
        <div className="mt-8 space-y-8">
          {c.contrastPairs.map((pair, i) => (
            <ContrastPair key={i} pair={pair} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ContrastPair({ pair, index: i }: { pair: ContrastPair; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: i * 0.15, ease: easeGentle }}
      className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center"
      aria-label={`Compare ${pair.thisExample} with ${pair.otherExample}`}
    >
      {/* Left card — This construction */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-[var(--border-radius-lg)] p-6"
        style={{
          border: "2px solid var(--lake-blue)",
          background: "rgba(107,163,190,0.06)",
        }}
      >
        <span
          className="text-caption px-3 py-1 rounded-full text-white"
          style={{ background: "var(--lake-blue)" }}
        >
          THIS CONSTRUCTION
        </span>
        <p
          className="text-example-lg mt-4"
          style={{ color: "var(--deep-slate)" }}
          dangerouslySetInnerHTML={{ __html: pair.thisExample }}
        />
        <p className="text-body-sm mt-3" style={{ color: "var(--soft-gray)" }}>
          {pair.thisNote}
        </p>
      </motion.div>

      {/* VS divider */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3, ease: easeSpring }}
        className="flex items-center justify-center"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center border-2"
          style={{
            borderColor: "var(--glass-border)",
            background: "var(--mist-white)",
          }}
        >
          <span
            className="text-caption font-semibold"
            style={{ color: "var(--soft-gray)" }}
          >
            VS
          </span>
        </div>
      </motion.div>

      {/* Right card — Contrast construction */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-[var(--border-radius-lg)] p-6"
        style={{
          border: "2px solid rgba(136,153,170,0.3)",
          background: "rgba(255,255,255,0.60)",
        }}
      >
        <span
          className="text-caption px-3 py-1 rounded-full"
          style={{
            background: "rgba(136,153,170,0.15)",
            color: "var(--soft-gray)",
          }}
        >
          {pair.otherConstructionName}
        </span>
        <p
          className="text-example-lg mt-4"
          style={{ color: "var(--deep-slate)" }}
          dangerouslySetInnerHTML={{ __html: pair.otherExample }}
        />
        <p className="text-body-sm mt-3" style={{ color: "var(--soft-gray)" }}>
          {pair.otherNote}
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Section 7 — Practice Entry                                          */
/* ================================================================== */
function PracticeEntry({ c }: { c: ConstructionDetail }) {
  const exerciseTypes = [
    "Meaning from Form",
    "Naturalness Judgment",
    "Repair the Sentence",
    "Pattern Recognition",
  ];

  return (
    <section
      style={{
        background:
          "linear-gradient(135deg, rgba(107,163,190,0.10) 0%, rgba(138,184,154,0.08) 100%)",
        padding: "var(--space-16) 0",
      }}
    >
      <div className="max-w-[var(--container-narrow)] mx-auto px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: easeGentle }}
          className="text-h2"
          style={{ color: "var(--deep-slate)" }}
        >
          Ready to Practice?
        </motion.h2>

        {/* Exercise pills */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mt-6"
        >
          {exerciseTypes.map((et, i) => (
            <motion.span
              key={et}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
              className="text-caption px-4 py-1.5 rounded-full border"
              style={{
                borderColor: "rgba(107,163,190,0.30)",
                background: "rgba(255,255,255,0.60)",
                color: "var(--lake-blue)",
              }}
            >
              {et}
            </motion.span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4, ease: easeSpring }}
          className="mt-8"
        >
          <Link
            href="/practice"
            className="inline-flex items-center gap-3 text-h4 font-semibold text-white px-12 py-4 rounded-full transition-all duration-[var(--duration-fast)] hover:-translate-y-1"
            style={{
              background: "var(--lake-blue)",
              boxShadow: "0 8px 32px rgba(107,163,190,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 12px 40px rgba(107,163,190,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 8px 32px rgba(107,163,190,0.25)";
            }}
          >
            <GraduationCap className="w-6 h-6" />
            Practice {c.name}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Section 8 — Related Constructions                                   */
/* ================================================================== */
function RelatedConstructions({ c }: { c: ConstructionDetail }) {
  const related = getRelatedConstructions(c.slug);

  if (related.length === 0) return null;

  return (
    <section
      style={{
        background: "var(--warm-white)",
        padding: "var(--space-16) 0 var(--space-20)",
      }}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: easeGentle }}
        >
          <h2
            className="text-h3"
            style={{ color: "var(--deep-slate)" }}
          >
            Continue Exploring
          </h2>
          <p className="text-body mt-2" style={{ color: "var(--soft-gray)" }}>
            Related constructions you might want to learn next.
          </p>
        </motion.div>

        {/* Horizontal scroll cards */}
        <div
          className="flex gap-5 overflow-x-auto mt-8 pb-4"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {related.map((rc, i) => (
            <motion.div
              key={rc.slug}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              style={{ scrollSnapAlign: "start", minWidth: 300, flexShrink: 0 }}
            >
              <CompactCard construction={rc} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Compact card for related constructions                              */
/* ------------------------------------------------------------------ */
function CompactCard({ construction: c }: { construction: ConstructionDetail }) {
  return (
    <Link href={`/constructions/${c.slug}`} className="block group">
      <div
        className="rounded-[var(--border-radius-lg)] p-5 h-full transition-all duration-[var(--duration-normal)]"
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
          e.currentTarget.style.transform = "translateY(-4px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--glass-border)";
          e.currentTarget.style.boxShadow = "var(--glass-shadow)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-caption px-2.5 py-0.5 rounded-full"
            style={{
              background: "rgba(107,163,190,0.12)",
              color: "var(--lake-blue)",
            }}
          >
            {c.category}
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background:
                    i <= c.difficulty
                      ? "rgba(107,163,190,0.55)"
                      : "rgba(107,163,190,0.12)",
                }}
              />
            ))}
          </div>
        </div>

        <h3
          className="text-h3 mt-3 group-hover:text-[--lake-blue] transition-colors duration-[var(--duration-fast)]"
          style={{ color: "var(--deep-slate)" }}
        >
          {c.name}
        </h3>

        <code
          className="inline-block mt-2 text-body-sm px-2 py-0.5 rounded"
          style={{
            fontFamily: "'Courier New', monospace",
            color: "var(--lake-blue)",
            background: "rgba(107,163,190,0.06)",
          }}
        >
          {c.formPattern}
        </code>

        <p
          className="text-body-sm mt-2"
          style={{ color: "var(--deep-slate)" }}
        >
          {c.semanticFormula}
        </p>
      </div>
    </Link>
  );
}
