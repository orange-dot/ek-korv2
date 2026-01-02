import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Menu, X, Zap, Globe } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'sr' ? 'en' : 'sr');
  };

  const navItems = [
    { href: '#problem', label: t('nav.problem') },
    { href: '#product', label: t('nav.product') },
    { href: '#philosophy', label: t('nav.philosophy') },
    { href: '#robots', label: t('nav.robots') },
    { href: '#configurations', label: t('nav.configurations') },
    { href: '#timeline', label: t('nav.timeline') },
    { href: '#team', label: t('nav.team') },
    { href: '#contact', label: t('nav.contact') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-accent-cyan" />
            <span className="text-xl font-bold">
              <span className="text-white">ELEKTRO</span>
              <span className="text-accent-cyan">KOMBINACIJA</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-slate-300 hover:text-accent-cyan transition-colors text-sm font-medium"
              >
                {item.label}
              </a>
            ))}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full border border-border hover:border-accent-cyan transition-colors"
            >
              <Globe className="w-4 h-4 text-accent-cyan" />
              <span className="text-sm font-medium text-white">
                {i18n.language.toUpperCase()}
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full border border-border"
            >
              <Globe className="w-4 h-4 text-accent-cyan" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg border border-border"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-primary-light border-b border-border"
        >
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block text-slate-300 hover:text-accent-cyan transition-colors py-2"
              >
                {item.label}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
