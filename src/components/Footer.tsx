import Link from 'next/link'
import { Leaf, Github, Twitter } from 'lucide-react'

const learnLinks = [
  { label: 'Library', href: '/constructions' },
  { label: 'Practice', href: '/practice' },
  { label: 'AI Lab', href: '/ai-lab' },
]

const accountLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Settings', href: '/dashboard' },
]

const aboutLinks = [
  { label: 'Methodology', href: '/about' },
  { label: 'Research', href: '/about' },
  { label: 'Contact', href: '/about' },
]

export default function Footer() {
  return (
    <footer
      className="relative"
      style={{
        background: 'var(--deep-slate)',
      }}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 pt-16 pb-8">
        {/* Top row: 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Column 1: Logo + tagline */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Leaf className="w-5 h-5 text-[--lake-green]" />
              <span
                className="text-lg"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 600,
                  color: 'white',
                }}
              >
                Syntax Lab
              </span>
            </Link>
            <p
              className="text-sm mb-6"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Patterns of meaning, constructions of thought.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-[var(--duration-fast)] hover:text-white"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-[var(--duration-fast)] hover:text-white"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Learn */}
          <div>
            <h4
              className="text-sm font-semibold mb-4"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              Learn
            </h4>
            <ul className="space-y-3">
              {learnLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-[var(--duration-fast)] hover:text-[rgba(255,255,255,0.9)]"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Account */}
          <div>
            <h4
              className="text-sm font-semibold mb-4"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              Account
            </h4>
            <ul className="space-y-3">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-[var(--duration-fast)] hover:text-[rgba(255,255,255,0.9)]"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: About */}
          <div>
            <h4
              className="text-sm font-semibold mb-4"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              About
            </h4>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-[var(--duration-fast)] hover:text-[rgba(255,255,255,0.9)]"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p
            className="text-xs"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            &copy; 2026 ConstructScape. Built on Construction Grammar theory.
          </p>
          <p
            className="text-xs"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            Inspired by Adele E. Goldberg
          </p>
        </div>
      </div>
    </footer>
  )
}
