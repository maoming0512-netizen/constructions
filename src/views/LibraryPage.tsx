import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowRight,
  BookOpen,
  SlidersHorizontal,
} from "lucide-react";
import { constructions, getCategories } from "@/data/constructions";
import type { ConstructionDetail } from "@/data/constructions";

/* ------------------------------------------------------------------ */
/*  Difficulty dots                                                     */
/* ------------------------------------------------------------------ */
function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-colors"
          style={{
            background:
              i <= level ? "rgba(107,163,190,0.55)" : "rgba(107,163,190,0.12)",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Difficulty label                                                    */
/* ------------------------------------------------------------------ */
function difficultyLabel(level: 1 | 2 | 3) {
  return level === 1 ? "Beginner" : level === 2 ? "Intermediate" : "Advanced";
}

/* ------------------------------------------------------------------ */
/*  Category badge color (consistent)                                   */
/* ------------------------------------------------------------------ */
function categoryColor(cat: string) {
  const map: Record<string, string> = {
    "Argument Structure": "rgba(107,163,190,0.12)",
    Motion: "rgba(138,184,154,0.12)",
    Resultative: "rgba(184,169,201,0.12)",
    Question: "rgba(244,162,97,0.12)",
    "Information Structure": "rgba(107,163,190,0.12)",
    Transfer: "rgba(138,184,154,0.12)",
    Advanced: "rgba(184,169,201,0.12)",
    Idiomatic: "rgba(244,162,97,0.12)",
  };
  return map[cat] || "rgba(107,163,190,0.12)";
}

/* ------------------------------------------------------------------ */
/*  Sort options                                                        */
/* ------------------------------------------------------------------ */
type SortOption = "name_asc" | "name_desc" | "diff_asc" | "diff_desc";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "diff_asc", label: "Difficulty (Easy-Hard)" },
  { value: "diff_desc", label: "Difficulty (Hard-Easy)" },
];

/* ------------------------------------------------------------------ */
/*  Main page component                                                 */
/* ------------------------------------------------------------------ */
export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeDifficulties, setActiveDifficulties] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("name_asc");
  const [sortOpen, setSortOpen] = useState(false);

  const categories = getCategories();

  /* ---- filter & sort ---- */
  const filtered = useMemo(() => {
    let list = [...constructions];

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.coreMeaning.toLowerCase().includes(q) ||
          c.semanticFormula.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // category
    if (activeCategory !== "All") {
      list = list.filter((c) => c.category === activeCategory);
    }

    // difficulty
    if (activeDifficulties.length > 0) {
      list = list.filter((c) => activeDifficulties.includes(c.difficulty));
    }

    // sort
    list.sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "diff_asc":
          return a.difficulty - b.difficulty;
        case "diff_desc":
          return b.difficulty - a.difficulty;
      }
    });

    return list;
  }, [search, activeCategory, activeDifficulties, sortBy]);

  /* ---- difficulty toggle ---- */
  const toggleDifficulty = (level: number) => {
    setActiveDifficulties((prev) =>
      prev.includes(level) ? prev.filter((d) => d !== level) : [...prev, level]
    );
  };

  /* ---- clear all ---- */
  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setActiveDifficulties([]);
    setSortBy("name_asc");
  };

  return (
    <div className="min-h-[100dvh]">
      {/* ============================================================ */}
      {/* SECTION 1 — Page Header                                       */}
      {/* ============================================================ */}
      <section
        style={{
          background:
            "linear-gradient(180deg, rgba(107,163,190,0.08) 0%, var(--mist-white) 100%)",
          paddingTop: "var(--space-24)",
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
            <span>Constructions</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="text-h1"
            style={{ color: "var(--deep-slate)" }}
          >
            The Construction Library
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="text-body-lg mt-3"
            style={{ color: "var(--soft-gray)", maxWidth: 640 }}
          >
            Explore English constructions — form-meaning pairings that shape how
            we communicate. Filter by category or difficulty to find patterns to
            practice.
          </motion.p>

          {/* Count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="text-caption mt-2"
            style={{ color: "var(--lake-blue)" }}
          >
            Showing {filtered.length} construction{filtered.length !== 1 ? "s" : ""}
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — Filter Bar                                        */}
      {/* ============================================================ */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="sticky top-16 z-10"
        style={{
          background: "rgba(245, 247, 250, 0.92)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search input */}
            <div className="relative shrink-0">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--soft-gray)" }}
              />
              <input
                type="text"
                placeholder="Search constructions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-[280px] pl-9 pr-4 py-2 text-body-sm rounded-full border transition-all duration-[var(--duration-fast)] outline-none"
                style={{
                  background: "rgba(255,255,255,0.80)",
                  borderColor: "var(--glass-border)",
                  color: "var(--deep-slate)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--lake-blue)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(107,163,190,0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--glass-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Category chips */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="text-caption px-4 py-1.5 rounded-full border transition-all duration-[var(--duration-fast)] whitespace-nowrap"
                    style={{
                      borderColor:
                        activeCategory === cat
                          ? "var(--lake-blue)"
                          : "var(--glass-border)",
                      background:
                        activeCategory === cat
                          ? "var(--lake-blue)"
                          : "transparent",
                      color:
                        activeCategory === cat ? "white" : "var(--soft-gray)",
                    }}
                    onMouseEnter={(e) => {
                      if (activeCategory !== cat) {
                        e.currentTarget.style.background =
                          "rgba(107,163,190,0.08)";
                        e.currentTarget.style.color = "var(--deep-slate)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeCategory !== cat) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--soft-gray)";
                      }
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Right side: difficulty + sort */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Difficulty toggles */}
              {([1, 2, 3] as const).map((level) => {
                const active = activeDifficulties.includes(level);
                const colors: Record<number, { border: string; bg: string; text: string; dot: string }> = {
                  1: { border: "#8AB89A", bg: "rgba(138,184,154,0.12)", text: "#2D3748", dot: "#8AB89A" },
                  2: { border: "#6BA3BE", bg: "rgba(107,163,190,0.12)", text: "#2D3748", dot: "#6BA3BE" },
                  3: { border: "#B8A9C9", bg: "rgba(184,169,201,0.12)", text: "#2D3748", dot: "#B8A9C9" },
                };
                const c = colors[level];
                return (
                  <button
                    key={level}
                    onClick={() => toggleDifficulty(level)}
                    className="flex items-center gap-1.5 text-caption px-3 py-1.5 rounded-full border transition-all duration-[var(--duration-fast)]"
                    style={{
                      borderColor: active ? c!.border : "var(--glass-border)",
                      background: active ? c!.bg : "transparent",
                      color: active ? c!.text : "var(--soft-gray)",
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: active ? c!.dot : "var(--soft-gray)",
                      }}
                    />
                    {difficultyLabel(level as 1 | 2 | 3)}
                  </button>
                );
              })}

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-1 text-caption px-3 py-1.5 rounded-full border transition-all duration-[var(--duration-fast)]"
                  style={{
                    borderColor: "var(--glass-border)",
                    color: "var(--soft-gray)",
                  }}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {sortOptions.find((s) => s.value === sortBy)?.label}
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setSortOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 z-20 rounded-lg overflow-hidden min-w-[200px]"
                        style={{
                          background: "var(--glass-bg)",
                          backdropFilter: "var(--glass-blur)",
                          WebkitBackdropFilter: "var(--glass-blur)",
                          border: "1px solid var(--glass-border)",
                          boxShadow: "var(--glass-shadow)",
                        }}
                      >
                        {sortOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSortBy(opt.value);
                              setSortOpen(false);
                            }}
                            className="block w-full text-left text-body-sm px-4 py-2.5 transition-colors duration-[var(--duration-fast)]"
                            style={{
                              color:
                                sortBy === opt.value
                                  ? "var(--lake-blue)"
                                  : "var(--deep-slate)",
                              background:
                                sortBy === opt.value
                                  ? "rgba(107,163,190,0.08)"
                                  : "transparent",
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ============================================================ */}
      {/* SECTION 3 — Constructions Grid                                  */}
      {/* ============================================================ */}
      <section
        style={{
          background: "var(--mist-white)",
          paddingTop: "var(--space-8)",
          paddingBottom: "var(--space-20)",
        }}
      >
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                key="grid"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08 } },
                }}
              >
                {filtered.map((c) => (
                  <ConstructionCard key={c.slug} construction={c} />
                ))}
              </motion.div>
            ) : (
              <EmptyState onClear={clearFilters} />
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Construction Card                                                   */
/* ------------------------------------------------------------------ */
function ConstructionCard({ construction: c }: { construction: ConstructionDetail }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          },
        },
      }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
      className="group rounded-[var(--border-radius-lg)] p-6 flex flex-col transition-all duration-[var(--duration-normal)]"
      style={{
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--glass-border-hover)";
        e.currentTarget.style.boxShadow =
          "0 16px 48px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--glass-border)";
        e.currentTarget.style.boxShadow = "var(--glass-shadow)";
      }}
    >
      {/* Top row: badge + difficulty */}
      <div className="flex items-center justify-between">
        <span
          className="text-caption px-3 py-1 rounded-full"
          style={{
            background: categoryColor(c.category),
            color: "var(--lake-blue)",
          }}
        >
          {c.category}
        </span>
        <DifficultyDots level={c.difficulty} />
      </div>

      {/* Icon */}
      <div
        className="mt-4 w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(107,163,190,0.08)" }}
      >
        <BookOpen className="w-6 h-6" style={{ color: "var(--lake-blue)" }} />
      </div>

      {/* Name */}
      <h3
        className="text-h3 mt-2 group-hover:text-[--lake-blue] transition-colors duration-[var(--duration-fast)]"
        style={{ color: "var(--deep-slate)" }}
      >
        {c.name}
      </h3>

      {/* Form template */}
      <code
        className="inline-block mt-2 text-body-sm px-2 py-1 rounded"
        style={{
          fontFamily: "'Courier New', monospace",
          color: "var(--lake-blue)",
          background: "rgba(107,163,190,0.06)",
        }}
      >
        {c.formPattern}
      </code>

      {/* Meaning */}
      <p className="text-body mt-3" style={{ color: "var(--deep-slate)" }}>
        {c.semanticFormula}
      </p>

      {/* Example */}
      <p
        className="text-example mt-3 pl-3 border-l-2 italic"
        style={{
          color: "var(--deep-slate)",
          borderColor: "rgba(107,163,190,0.25)",
        }}
      >
        {c.prototypeExamples[0]?.sentence.replace(/\*\*/g, "") ||
          c.semanticAnchors[0]}
      </p>

      {/* Action row */}
      <div className="flex items-center justify-between mt-auto pt-5">
        <Link
          href={`/constructions/${c.slug}`}
          className="text-body-sm font-medium inline-flex items-center gap-1 transition-colors duration-[var(--duration-fast)] hover:underline"
          style={{ color: "var(--lake-blue)" }}
        >
          Learn More
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/practice"
          className="text-caption font-medium px-4 py-1.5 rounded-full text-white transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
          style={{ background: "var(--lake-blue)" }}
        >
          Practice
        </Link>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                         */
/* ------------------------------------------------------------------ */
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="flex flex-col items-center text-center py-24"
    >
      <Search
        className="w-16 h-16 mb-6"
        style={{ color: "var(--soft-gray)", opacity: 0.5 }}
      />
      <h3
        className="text-h3"
        style={{ color: "var(--deep-slate)" }}
      >
        No constructions found
      </h3>
      <p
        className="text-body mt-2"
        style={{ color: "var(--soft-gray)" }}
      >
        Try adjusting your filters or search terms to find what you&apos;re
        looking for.
      </p>
      <button
        onClick={onClear}
        className="mt-6 text-body-sm font-medium px-6 py-3 rounded-full text-white transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5"
        style={{ background: "var(--lake-blue)" }}
      >
        Clear All Filters
      </button>
    </motion.div>
  );
}
