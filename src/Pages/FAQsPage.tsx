// src/Features/Pages/FAQsPage.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useReducedMotion,
} from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { useGetFaqsQuery } from '../Features/Apis/FAQs.Api';
import { Navbar } from '../Components/Navbar';
import Footer from '../Components/Footer';
import PageTitle from '../Components/PageTitle';
import SEO from '../Components/SEO';
import VirtualAssistant from '../Components/VirtualAssistant';
import {
  HelpCircle, Search, X, ChevronDown, Sparkles, RefreshCw,
  AlertCircle, MessageCircleQuestion, ArrowRight, ArrowUpRight,
  LifeBuoy, Mail, Compass, ChevronRight,
} from 'lucide-react';

const EASE = [0.2, 0.7, 0.2, 1] as const;

/* ---------- Reveal ---------- */
const Reveal = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, delay: delay / 1000, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

/* ---------- Accordion item ---------- */
const FaqItem = ({
  question,
  answer,
  index,
  isOpen,
  onToggle,
  primary,
  text,
  base,
  id,
  onInView,
}: {
  question: string;
  answer: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  primary: string;
  text: string;
  base: string;
  id: string;
  onInView: (id: string) => void;
}) => {
  const borderSoft = `${text}18`;
  const borderMid = `${text}30`;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onInView(id);
      },
      { rootMargin: '-120px 0px -55% 0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [id, onInView]);

  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.04, 0.25), ease: EASE }}
      className="scroll-mt-32 rounded-2xl border transition-all duration-300"
      style={{
        borderColor: isOpen ? primary : borderSoft,
        backgroundColor: isOpen ? `${primary}08` : `${text}03`,
        boxShadow: isOpen ? `0 24px 44px -30px ${primary}88` : 'none',
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${id}-answer`}
        className="w-full flex items-start gap-4 p-5 sm:p-6 text-left focus:outline-none focus-visible:ring-2 rounded-2xl"
        style={{ ['--tw-ring-color' as any]: primary }}
      >
        <span
          className="shrink-0 mt-0.5 text-2xl sm:text-3xl font-black tabular-nums leading-none transition-colors"
          style={{ color: isOpen ? primary : `${text}30` }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className="text-base sm:text-lg font-bold leading-snug transition-colors"
            style={{ color: isOpen ? primary : text }}
          >
            {question}
          </p>
        </div>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="grid shrink-0 place-items-center h-9 w-9 rounded-full border transition-colors"
          style={{
            borderColor: isOpen ? primary : borderMid,
            color: isOpen ? primary : text,
            backgroundColor: isOpen ? `${primary}1f` : 'transparent',
          }}
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div
              id={`${id}-answer`}
              className="px-5 sm:px-6 pb-5 sm:pb-6 pl-[3.75rem] sm:pl-[4.25rem]"
            >
              <div
                className="h-px w-full mb-4"
                style={{ backgroundColor: `${primary}22` }}
              />
              <div className="flex items-start gap-2">
                <MessageCircleQuestion
                  size={14}
                  className="shrink-0 mt-1 opacity-60"
                  style={{ color: primary }}
                />
                <p className="text-sm sm:text-[15px] leading-relaxed opacity-75 whitespace-pre-line">
                  {answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ============================================================
   PAGE
   ============================================================ */
const FAQsPage = () => {
  const { theme } = useTheme();
  const reduce = useReducedMotion();

  const { data: faqsResponse, isLoading, isError, refetch } = useGetFaqsQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.3,
  });

  const base = theme['base-100'];
  const text = theme['base-content'];
  const primary = theme.primary;

  const faqs = faqsResponse?.data ?? [];

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return faqs;
    const term = searchTerm.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(term) ||
        f.answer.toLowerCase().includes(term)
    );
  }, [faqs, searchTerm]);

  useEffect(() => {
    setOpenIndex(filteredFaqs.length > 0 ? 0 : null);
  }, [searchTerm, filteredFaqs.length]);

  const borderSoft = `${text}18`;
  const borderMid = `${text}30`;
  const clearSearch = () => setSearchTerm('');

  const scrollToFaq = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(`faq-${id}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  const onInView = React.useCallback((id: string) => {
    setActiveId(id);
  }, []);

  /* ---------- LOADING ---------- */
  if (isLoading) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-8"
        style={{ backgroundColor: base, color: text }}
      >
        <div className="relative">
          <div
            className="w-24 h-24 border-2 border-dashed rounded-full animate-[spin_6s_linear_infinite] opacity-10"
            style={{ borderColor: primary }}
          />
          <div
            className="absolute inset-2 border-t-2 rounded-full animate-spin"
            style={{ borderColor: primary }}
          />
          <div
            className="absolute inset-0 m-auto w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: primary }}
          />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black uppercase tracking-[0.6em] animate-pulse">
            Gakenye
          </h2>
          <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.4em]">
            Loading FAQs...
          </p>
        </div>
      </div>
    );
  }

  /* ---------- ERROR ---------- */
  if (isError) {
    return (
      <main
        className="relative min-h-screen"
        style={{ backgroundColor: base, color: text, overflowX: 'clip' }}
      >
        <SEO
          title="FAQs | Gakenye Ndiritu"
          description="Frequently asked questions about working with Gakenye Ndiritu."
          path="/faqs"
        />
        <PageTitle title="FAQs" />
        <div className="relative z-10">
          <Navbar />
          <section className="pt-32 pb-24 px-6 lg:px-16">
            <div className="max-w-3xl mx-auto text-center">
              <div
                className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-3xl"
                style={{ backgroundColor: `${primary}1f` }}
              >
                <AlertCircle size={44} style={{ color: primary }} />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Couldn't load <span style={{ color: primary }}>FAQs.</span>
              </h1>
              <p className="mt-4 text-base opacity-70 max-w-lg mx-auto leading-relaxed">
                Something went wrong loading the FAQs. Please try again.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                  style={{ backgroundColor: primary, color: base }}
                >
                  <RefreshCw size={15} /> Try again
                </button>
              </div>
            </div>
          </section>
        </div>
        <Footer />
        <div className="pointer-events-none fixed inset-x-0 top-[94%] -translate-y-1/2 z-[100] flex justify-end px-3 sm:inset-x-auto sm:top-auto sm:bottom-5 sm:right-6 sm:translate-y-0 sm:px-0">
          <div className="pointer-events-auto">
            <VirtualAssistant />
          </div>
        </div>
      </main>
    );
  }

  const isEmpty = faqs.length === 0;

  return (
    <main
      className="relative min-h-screen transition-colors duration-500"
      style={{ backgroundColor: base, color: text, overflowX: 'clip' }}
    >
      <SEO
        title="FAQs | Gakenye Ndiritu"
        description="Frequently asked questions about working with Gakenye Ndiritu — timelines, pricing, and how to get started."
        path="/faqs"
      />

      <PageTitle title="FAQs" />

      <style>{`
        @keyframes faq-blob {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(30px,-30px) scale(1.15); }
        }
        .faq-blob { animation: faq-blob 12s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .faq-blob { animation: none !important; }
        }
      `}</style>

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 origin-left z-[60]"
        style={{ scaleX: progress, backgroundColor: primary }}
      />

      <div
        className="absolute inset-x-0 top-0 h-[44rem] pointer-events-none opacity-60"
        style={{
          backgroundImage: `radial-gradient(${text}26 1px, transparent 1px)`,
          backgroundSize: '26px 26px',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)',
        }}
      />

      {!reduce && (
        <>
          <div
            className="faq-blob absolute -top-32 -right-24 w-[26rem] h-[26rem] rounded-full blur-[130px] opacity-20 pointer-events-none"
            style={{ backgroundColor: primary }}
          />
          <div
            className="faq-blob absolute top-[30rem] -left-24 w-[22rem] h-[22rem] rounded-full blur-[120px] opacity-10 pointer-events-none"
            style={{
              backgroundColor: theme.secondary || primary,
              animationDelay: '-5s',
            }}
          />
        </>
      )}

      <div className="relative z-10">
        <Navbar />

        {/* ---------- HERO ---------- */}
        <section className="pt-32 lg:pt-28 pb-10">
          <div className="w-full max-w-[1300px] mx-auto px-6 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-6"
              style={{ borderColor: borderMid }}
            >
              <LifeBuoy size={14} style={{ color: primary }} />
              <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                Help center
              </span>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              <div className="lg:col-span-8">
                <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05]">
                  {['Questions', '&'].map((word, i) => (
                    <span
                      key={word}
                      className="inline-block overflow-hidden align-bottom pb-[0.12em] mr-[0.25em]"
                    >
                      <motion.span
                        className="inline-block"
                        initial={{ y: '110%' }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.15 + i * 0.1, duration: 0.9, ease: EASE }}
                      >
                        {word}
                      </motion.span>
                    </span>
                  ))}
                  <br />
                  <motion.span
                    className="inline-block"
                    initial={{ opacity: 0, scale: 0.7, x: -30 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{
                      delay: 0.4,
                      duration: 0.8,
                      type: 'spring',
                      stiffness: 120,
                      damping: 12,
                    }}
                    style={{ color: primary }}
                  >
                    answers.
                  </motion.span>
                </h1>
              </div>
              <div className="lg:col-span-4">
                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.7 }}
                  className="text-base leading-relaxed opacity-70"
                >
                  Everything you might be wondering about working with me —
                  timelines, pricing, process, and how we get started.
                </motion.p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- MAIN GRID ---------- */}
        <section className="px-6 lg:px-16 pb-20 md:pb-28">
          <div className="max-w-[1300px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* ============ SIDEBAR ============ */}
              <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
                {/* Search */}
                {!isEmpty && (
                  <Reveal delay={100}>
                    <div
                      className="rounded-2xl border p-4 backdrop-blur-xl transition-all"
                      style={{
                        borderColor: searchFocused ? primary : borderSoft,
                        backgroundColor: `${base}e6`,
                        boxShadow: searchFocused ? `0 0 0 4px ${primary}22` : 'none',
                      }}
                    >
                      <label
                        htmlFor="faq-search"
                        className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 mb-2 inline-flex items-center gap-1.5"
                      >
                        <Compass size={11} /> Find an answer
                      </label>
                      <div
                        className="flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-all"
                        style={{
                          borderColor: searchFocused ? primary : borderMid,
                          backgroundColor: `${text}05`,
                        }}
                      >
                        <Search size={16} className="opacity-50 shrink-0" />
                        <input
                          id="faq-search"
                          type="text"
                          placeholder="Search FAQs…"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onFocus={() => setSearchFocused(true)}
                          onBlur={() => setSearchFocused(false)}
                          className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none placeholder:opacity-50"
                        />
                        {searchTerm && (
                          <button
                            onClick={clearSearch}
                            aria-label="Clear"
                            className="grid h-6 w-6 place-items-center rounded-full opacity-60 hover:opacity-100"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                      <p className="mt-2.5 text-[11px] opacity-50">
                        {searchTerm ? (
                          <>
                            <span className="font-semibold" style={{ color: primary }}>
                              {filteredFaqs.length}
                            </span>{' '}
                            match{filteredFaqs.length === 1 ? '' : 'es'}
                          </>
                        ) : (
                          <>
                            <span className="font-semibold" style={{ color: primary }}>
                              {faqs.length}
                            </span>{' '}
                            question{faqs.length === 1 ? '' : 's'} available
                          </>
                        )}
                      </p>
                    </div>
                  </Reveal>
                )}

                {/* Detailed Jump index */}
                {!isEmpty && filteredFaqs.length > 0 && (
                  <Reveal delay={200}>
                    <div
                      className="rounded-2xl border overflow-hidden"
                      style={{
                        borderColor: borderSoft,
                        backgroundColor: `${text}03`,
                      }}
                    >
                      <div
                        className="px-4 py-3 border-b flex items-center justify-between"
                        style={{ borderColor: borderSoft }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 inline-flex items-center gap-1.5">
                          <Compass size={11} /> On this page
                        </p>
                        <span className="text-[10px] tabular-nums opacity-40">
                          {filteredFaqs.length} Q
                        </span>
                      </div>
                      <div className="max-h-[26rem] overflow-y-auto no-scrollbar">
                        {filteredFaqs.map((faq, i) => {
                          const isActive = activeId === `faq-${faq.id}`;
                          const isOpen = openIndex === i;
                          return (
                            <button
                              key={faq.id}
                              onClick={() => {
                                scrollToFaq(faq.id);
                                setOpenIndex(i);
                              }}
                              className="group relative w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                              style={{
                                backgroundColor: isActive ? `${primary}0d` : 'transparent',
                              }}
                            >
                              {/* Active indicator bar */}
                              <span
                                className="absolute left-0 top-0 bottom-0 w-0.5 transition-all"
                                style={{
                                  backgroundColor: isActive ? primary : 'transparent',
                                }}
                              />

                              {/* Number */}
                              <span
                                className="shrink-0 mt-0.5 text-[10px] font-bold tabular-nums w-5"
                                style={{
                                  color: isActive || isOpen ? primary : `${text}55`,
                                }}
                              >
                                {String(i + 1).padStart(2, '0')}
                              </span>

                              {/* Full question */}
                              <span
                                className="flex-1 min-w-0 text-[13px] leading-snug font-medium transition-colors"
                                style={{
                                  color: isActive || isOpen ? primary : text,
                                }}
                              >
                                {faq.question}
                              </span>

                              <ChevronRight
                                size={12}
                                className="shrink-0 mt-1 transition-all group-hover:translate-x-0.5"
                                style={{
                                  color: isActive ? primary : text,
                                  opacity: isActive ? 1 : 0.3,
                                }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Reveal>
                )}

                {/* Help CTA */}
                <Reveal delay={300}>
                  <div
                    className="rounded-2xl border p-5"
                    style={{
                      borderColor: `${primary}44`,
                      backgroundColor: `${primary}0d`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="grid shrink-0 place-items-center h-10 w-10 rounded-xl"
                        style={{ backgroundColor: `${primary}1f`, color: primary }}
                      >
                        <Mail size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold">Still stuck?</h3>
                        <p className="text-xs opacity-65 mt-1 leading-relaxed">
                          Can't find what you're looking for? Drop me a message and
                          I'll reply within 24 hours.
                        </p>
                        <a
                          href="/contact"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold transition-all hover:gap-2.5"
                          style={{ color: primary }}
                        >
                          Contact me <ArrowUpRight size={13} />
                        </a>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </aside>

              {/* ============ FAQ LIST ============ */}
              <div className="lg:col-span-8 min-w-0">
                {isEmpty ? (
                  <Reveal delay={0}>
                    <div
                      className="flex flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed px-6 py-20 text-center"
                      style={{ borderColor: borderSoft }}
                    >
                      <div
                        className="grid h-24 w-24 place-items-center rounded-3xl"
                        style={{ backgroundColor: `${primary}1f` }}
                      >
                        <HelpCircle size={44} style={{ color: primary }} />
                      </div>
                      <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        No FAQs <span style={{ color: primary }}>yet.</span>
                      </h3>
                      <p className="max-w-md text-base opacity-65 leading-relaxed">
                        I haven't posted any FAQs yet. If you have a question, feel
                        free to reach out directly — I'm always happy to answer.
                      </p>
                      <a
                        href="/contact"
                        className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                        style={{ backgroundColor: primary, color: base }}
                      >
                        Contact me <ArrowRight size={15} />
                      </a>
                    </div>
                  </Reveal>
                ) : filteredFaqs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.7,
                      type: 'spring',
                      stiffness: 120,
                      damping: 14,
                    }}
                    className="py-16 md:py-24 px-6 flex flex-col items-center justify-center text-center space-y-5 rounded-3xl border-2 border-dashed"
                    style={{ borderColor: borderSoft }}
                  >
                    <motion.div
                      animate={
                        reduce
                          ? undefined
                          : { y: [0, -10, 0], rotate: [0, -6, 6, 0] }
                      }
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <HelpCircle size={56} className="opacity-30" />
                    </motion.div>
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                        Nothing matches that search
                      </h3>
                      <p className="text-sm md:text-base opacity-60 max-w-sm mx-auto">
                        {`No FAQ found for "${searchTerm}". Try a different word, or clear the search.`}
                      </p>
                    </div>
                    <motion.button
                      onClick={clearSearch}
                      whileHover={{ y: -3, scale: 1.05 }}
                      whileTap={{ scale: 0.94 }}
                      className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold shadow-lg"
                      style={{ backgroundColor: primary, color: base }}
                    >
                      <Sparkles size={16} /> Clear search
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {filteredFaqs.map((faq, i) => (
                      <FaqItem
                        key={faq.id}
                        id={`faq-${faq.id}`}
                        question={faq.question}
                        answer={faq.answer}
                        index={i}
                        isOpen={openIndex === i}
                        onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                        primary={primary}
                        text={text}
                        base={base}
                        onInView={onInView}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
      <div className="pointer-events-none fixed inset-x-0 top-[94%] -translate-y-1/2 z-[100] flex justify-end px-3 sm:inset-x-auto sm:top-auto sm:bottom-5 sm:right-6 sm:translate-y-0 sm:px-0">
        <div className="pointer-events-auto">
          <VirtualAssistant />
        </div>
      </div>
    </main>
  );
};

export default FAQsPage;