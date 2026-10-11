import React, { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { Navbar } from '../Components/Navbar';
import {
  Github,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
  Send,
  Phone,
  CheckCircle2,
  Copy,
  Check,
  MessageSquare,
  Lightbulb,
  Target,
  CalendarClock,
  ArrowUpRight,
} from 'lucide-react';
import { RiWhatsappFill } from 'react-icons/ri';

import logoMain from '../../public/LOGO.png';
import Footer from '../Components/Footer';
import PageTitle from '../Components/PageTitle';
import SEO from '../Components/SEO';
import VirtualAssistant from '../Components/VirtualAssistant';

/* ---------- Page information ---------- */

const phoneNumber = '+254 789 757 457';
const phoneLink = 'tel:+254789757457';
const email = 'codewithgakenye@gmail.com';
const whatsappLink = 'https://wa.link/f3ajog';

const socials = [
  { icon: Github, link: 'https://github.com/Gakenye8741', label: 'GitHub', note: 'See my code' },
  {
    icon: Linkedin,
    link: 'https://www.linkedin.com/in/gakenye-ndiritu-9757923a8/',
    label: 'LinkedIn',
    note: 'Work and experience',
  },
  { icon: RiWhatsappFill, link: whatsappLink, label: 'WhatsApp', note: 'Fastest way to reach me' },
  {
    icon: Instagram,
    link: 'https://www.instagram.com/_code.d_by_gakenye_/',
    label: 'Instagram',
    note: 'Follow my journey',
  },
];

const tips = [
  { icon: Lightbulb, title: 'Your idea', desc: 'Tell me what you want to build or fix.' },
  { icon: Target, title: 'Your goal', desc: 'Tell me what you want it to do for you.' },
  { icon: CalendarClock, title: 'Your time', desc: 'Tell me when you would like it done.' },
];

/* ---------- Small helper parts ---------- */

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] } },
};

// Makes the light on a card follow the mouse.
const followMouse = (e: React.MouseEvent<HTMLElement>) => {
  const box = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - box.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - box.top}px`);
};

/* ---------- Page ---------- */

const ContactPage = () => {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState<string | null>(null);

  const base = theme['base-100'];
  const text = theme['base-content'];
  const primary = theme.primary;
  const soft = `${text}18`;

  // Copies a phone number or email so it is easy to paste
  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      /* Copy is not allowed here, so we do nothing */
    }
  };

  const cardStyle = {
    borderColor: soft,
    backgroundColor: `${text}05`,
    '--mx': '50%',
    '--my': '50%',
  } as React.CSSProperties;

  const glow = (
    <div
      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: `radial-gradient(320px circle at var(--mx) var(--my), ${primary}22, transparent 45%)` }}
    />
  );

  const heroWords = ["Let's", 'talk.'];

  return (
    <main
      className="min-h-screen pt-32 pb-20 px-6 relative"
      style={{ backgroundColor: base, color: text, overflowX: 'clip' }}
    >
      <SEO
        title="Gakenye Ndiritu | Contact & Inquiries"
        description="Get in touch with Gakenye Ndiritu, Full-Stack Software Engineer based in Nyahururu, Kenya. Available for freelance projects, technical consulting, and collaborations."
        path="/contact"
      />

      <style>{`
        @keyframes ct-blob { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-30px) scale(1.15); } }
        @keyframes ct-spin { to { transform: rotate(360deg); } }
        @keyframes ct-ping { 0% { transform: scale(1); opacity: .55; } 100% { transform: scale(2.4); opacity: 0; } }
        @keyframes ct-shine { 0% { transform: translateX(-120%) skewX(-20deg); } 60%,100% { transform: translateX(260%) skewX(-20deg); } }
        .ct-blob { animation: ct-blob 12s ease-in-out infinite; }
        .ct-spin { animation: ct-spin 26s linear infinite; }
        .ct-ping { animation: ct-ping 2s ease-out infinite; }
        .ct-shine::after {
          content: ""; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
          animation: ct-shine 3.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ct-blob, .ct-spin, .ct-ping, .ct-shine::after { animation: none !important; }
        }
      `}</style>

      <PageTitle title="Contacts" />
      <Navbar />

      {/* Big logo in the background */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <img
          src={logoMain}
          alt=""
          aria-hidden="true"
          className="w-[90vw] h-[90vw] sm:w-[60vw] sm:h-[60vw] object-contain opacity-[0.03] select-none"
        />
      </div>

      {/* Dots pattern and glowing blobs */}
      <div
        className="absolute inset-x-0 top-0 h-[38rem] pointer-events-none opacity-60"
        style={{
          backgroundImage: `radial-gradient(${text}26 1px, transparent 1px)`,
          backgroundSize: '26px 26px',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)',
        }}
      />
      <div
        className="ct-blob absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full blur-[130px] opacity-25 pointer-events-none"
        style={{ backgroundColor: primary }}
      />
      <div
        className="ct-blob absolute top-[44rem] -left-24 w-[22rem] h-[22rem] rounded-full blur-[120px] opacity-15 pointer-events-none"
        style={{ backgroundColor: theme.secondary || primary, animationDelay: '-5s' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-16 md:space-y-20">
        {/* ---------- HEADER ---------- */}
        <header className="space-y-6">
          {/* Availability badge with a pulsing dot */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.6 }}
            className="inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-md"
            style={{ borderColor: `${primary}55`, backgroundColor: `${primary}12`, color: primary }}
          >
            <span className="relative grid place-items-center w-3 h-3">
              <span className="ct-ping absolute inset-0 rounded-full bg-green-500" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-green-500" />
            </span>
            I am open to new projects
          </motion.div>

          <h1
            className="text-6xl md:text-8xl font-extrabold tracking-tight leading-[1.02]"
            aria-label="Let's talk."
          >
            {heroWords.map((word, i) => (
              <span key={word} className="inline-block overflow-hidden align-bottom pb-[0.12em] mr-[0.25em]">
                <motion.span
                  className="inline-block"
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.15 + i * 0.12, duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
                  style={{ color: i === 1 ? primary : undefined }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="max-w-2xl text-lg md:text-xl leading-relaxed opacity-70"
          >
            Do you have a big problem, a new idea, or just a question? Send me a message. I like to hear about good
            projects and I will reply as soon as I can.
          </motion.p>
        </header>

        {/* ---------- MAIN GRID ---------- */}
        <motion.div
          className="grid lg:grid-cols-5 gap-6 md:gap-8 items-start"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Left side */}
          <div className="lg:col-span-3 space-y-6">
            {/* Phone, email and place */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Phone */}
              <motion.article
                variants={rise}
                onMouseMove={followMouse}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl border p-6"
                style={cardStyle}
              >
                {glow}
                <div className="relative flex items-start gap-4">
                  <span
                    className="grid place-items-center shrink-0 w-12 h-12 rounded-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110"
                    style={{ backgroundColor: `${primary}1a`, color: primary }}
                  >
                    <Phone size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm opacity-55">Call me</p>
                    <a href={phoneLink} className="block text-lg font-bold leading-tight hover:underline">
                      {phoneNumber}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(phoneNumber, 'phone')}
                    aria-label="Copy phone number"
                    className="grid place-items-center shrink-0 w-9 h-9 rounded-full border transition-transform duration-300 hover:scale-110 active:scale-90"
                    style={{
                      borderColor: copied === 'phone' ? primary : soft,
                      color: copied === 'phone' ? primary : text,
                    }}
                  >
                    {copied === 'phone' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </motion.article>

              {/* Email */}
              <motion.article
                variants={rise}
                onMouseMove={followMouse}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl border p-6"
                style={cardStyle}
              >
                {glow}
                <div className="relative flex items-start gap-4">
                  <span
                    className="grid place-items-center shrink-0 w-12 h-12 rounded-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110"
                    style={{ backgroundColor: `${primary}1a`, color: primary }}
                  >
                    <Mail size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm opacity-55">Email me</p>
                    <a href={`mailto:${email}`} className="block text-base font-bold leading-tight break-all hover:underline">
                      {email}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(email, 'email')}
                    aria-label="Copy email address"
                    className="grid place-items-center shrink-0 w-9 h-9 rounded-full border transition-transform duration-300 hover:scale-110 active:scale-90"
                    style={{
                      borderColor: copied === 'email' ? primary : soft,
                      color: copied === 'email' ? primary : text,
                    }}
                  >
                    {copied === 'email' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </motion.article>

              {/* Place */}
              <motion.article
                variants={rise}
                onMouseMove={followMouse}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl border p-6 sm:col-span-2"
                style={cardStyle}
              >
                {glow}
                <div className="relative flex items-center gap-4">
                  <span
                    className="grid place-items-center shrink-0 w-12 h-12 rounded-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110"
                    style={{ backgroundColor: `${primary}1a`, color: primary }}
                  >
                    <MapPin size={22} />
                  </span>
                  <div>
                    <p className="text-sm opacity-55">I live in</p>
                    <p className="text-lg font-bold leading-tight">Nyahururu, Laikipia, Kenya</p>
                  </div>
                </div>
              </motion.article>
            </div>

            {/* Work availability */}
            <motion.article
              variants={rise}
              className="relative overflow-hidden rounded-3xl border p-6 sm:p-8"
              style={{ borderColor: soft, backgroundColor: `${text}05` }}
            >
              <div className="flex items-start gap-4">
                <motion.span
                  className="grid place-items-center shrink-0 w-12 h-12 rounded-2xl bg-green-500/15"
                  animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <CheckCircle2 size={22} className="text-green-500" />
                </motion.span>
                <div>
                  <h2 className="text-lg font-bold">I can take new work now</h2>
                  <p className="mt-1 text-sm sm:text-base opacity-65 leading-relaxed">
                    I am free for new freelance projects and teamwork. Tell me what you need and we can start soon.
                  </p>
                </div>
              </div>
            </motion.article>

            {/* What to tell me */}
            <motion.div variants={rise} className="space-y-4">
              <h2 className="text-xl font-bold">What to put in your message</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {tips.map((tip, i) => {
                  const Icon = tip.icon;
                  return (
                    <motion.div
                      key={tip.title}
                      whileHover={{ y: -5 }}
                      className="rounded-2xl border p-5 space-y-3"
                      style={{ borderColor: soft, backgroundColor: `${text}05` }}
                    >
                      <motion.span
                        className="grid place-items-center w-10 h-10 rounded-xl"
                        style={{ backgroundColor: `${primary}1a`, color: primary }}
                        animate={reduce ? undefined : { y: [0, -4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                      >
                        <Icon size={18} />
                      </motion.span>
                      <h3 className="font-bold">{tip.title}</h3>
                      <p className="text-sm opacity-65 leading-relaxed">{tip.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right side: WhatsApp */}
          <motion.div variants={rise} className="lg:col-span-2 lg:sticky lg:top-28">
            <div
              className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border-2 border-dashed p-8 sm:p-10 text-center"
              style={{ borderColor: `${text}30` }}
            >
              <div
                className="ct-spin absolute -right-16 -top-16 w-52 h-52 rounded-full border-2 border-dashed opacity-20 pointer-events-none"
                style={{ borderColor: primary }}
              />
              <div
                className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full blur-[100px] opacity-20 pointer-events-none"
                style={{ backgroundColor: primary }}
              />

              <div className="relative space-y-6">
                <motion.span
                  className="inline-grid place-items-center w-16 h-16 rounded-2xl"
                  style={{ backgroundColor: `${primary}1a`, color: primary }}
                  animate={reduce ? undefined : { y: [0, -10, 0], rotate: [0, 6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <MessageSquare size={30} />
                </motion.span>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Let's start building</h2>
                <p className="text-sm sm:text-base opacity-70 leading-relaxed">
                  I answer fastest on WhatsApp. For a new project or a quick question, send me a message there.
                </p>

                <motion.a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative overflow-hidden ct-shine flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold shadow-lg"
                  style={{ backgroundColor: primary, color: base }}
                >
                  Start a chat
                  <Send size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </motion.a>

                <p className="text-xs opacity-50">It opens WhatsApp in a new tab.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ---------- FIND ME ONLINE ---------- */}
        <section className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Find me online</h2>
            <p className="mt-2 opacity-60">Choose the place you like best.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {socials.map((soc) => {
              const Icon = soc.icon;
              return (
                <motion.a
                  key={soc.label}
                  variants={rise}
                  href={soc.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseMove={followMouse}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative overflow-hidden rounded-3xl border p-6 flex flex-col gap-5"
                  style={cardStyle}
                >
                  {glow}
                  <span
                    className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 ease-out"
                    style={{ backgroundColor: primary }}
                  />
                  <div className="relative flex items-start justify-between">
                    <span
                      className="grid place-items-center w-12 h-12 rounded-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110"
                      style={{ backgroundColor: `${primary}1a`, color: primary }}
                    >
                      <Icon size={22} />
                    </span>
                    <ArrowUpRight
                      size={20}
                      className="opacity-30 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1"
                      style={{ color: primary }}
                    />
                  </div>
                  <div className="relative">
                    <h3 className="text-lg font-bold">{soc.label}</h3>
                    <p className="text-sm opacity-60 mt-0.5">{soc.note}</p>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        </section>
      </div>

      <Footer />
      {/* Floating virtual assistant */}
            <div
              className="
                pointer-events-none fixed inset-x-0 top-[94%] -translate-y-1/2 z-[100]
                flex justify-end
                px-3
                sm:inset-x-auto sm:top-auto sm:bottom-5 sm:right-6 sm:translate-y-0
                sm:px-0
              "
            >
              <div className="pointer-events-auto">
                <VirtualAssistant />
              </div>
            </div>
    </main>
  );
};

export default ContactPage;