import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Zap, Globe, Play, ChevronDown, FileText, Lock, Cpu, Hexagon } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'sr' ? 'en' : 'sr');
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const sectionId = href.replace('#', '');

    // If not on home page, navigate there first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
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
          <Link to="/" className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-accent-cyan" />
            <span className="text-xl font-bold">
              <span className="text-white">ELEKTRO</span>
              <span className="text-accent-cyan">KOMBINACIJA</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-slate-300 hover:text-accent-cyan transition-colors text-sm font-medium cursor-pointer"
              >
                {item.label}
              </a>
            ))}

            {/* Simulations Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 300)}
                className="flex items-center space-x-1 px-4 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan hover:bg-accent-cyan/20 transition-colors"
              >
                <Play className="w-4 h-4 text-accent-cyan" />
                <span className="text-sm font-medium text-accent-cyan">
                  {t('nav.simulations')}
                </span>
                <ChevronDown className={`w-4 h-4 text-accent-cyan transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full mt-2 right-0 bg-primary-light border border-border rounded-lg shadow-lg py-2 min-w-[180px]">
                  <Link
                    to="/simulation"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-accent-cyan hover:bg-primary transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>{t('nav.busCharging')}</span>
                  </Link>
                  <Link
                    to="/la-delivery"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-accent-cyan hover:bg-primary transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>{t('nav.laDelivery')}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Patent Link */}
            <Link
              to="/patent"
              className="flex items-center space-x-1 px-3 py-1.5 text-slate-300 hover:text-accent-cyan transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">{t('nav.patent')}</span>
            </Link>

            {/* JEZGRO Dev Link (Protected) */}
            <Link
              to="/jezgro-dev"
              className="flex items-center space-x-1 px-3 py-1.5 text-slate-300 hover:text-accent-cyan transition-colors"
            >
              <Lock className="w-3 h-3" />
              <Cpu className="w-4 h-4" />
              <span className="text-sm font-medium">{t('nav.jezgroDev')}</span>
            </Link>

            {/* ROJ Link (Protected) */}
            <Link
              to="/roj"
              className="flex items-center space-x-1 px-3 py-1.5 text-slate-300 hover:text-accent-cyan transition-colors"
            >
              <Lock className="w-3 h-3" />
              <Hexagon className="w-4 h-4" />
              <span className="text-sm font-medium">{t('nav.roj')}</span>
            </Link>

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
                onClick={(e) => handleNavClick(e, item.href)}
                className="block text-slate-300 hover:text-accent-cyan transition-colors py-2 cursor-pointer"
              >
                {item.label}
              </a>
            ))}
            <div className="border-t border-border pt-3 mt-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{t('nav.simulations')}</p>
              <Link
                to="/simulation"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-accent-cyan py-2"
              >
                <Play className="w-4 h-4" />
                <span>{t('nav.busCharging')}</span>
              </Link>
              <Link
                to="/la-delivery"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-accent-cyan py-2"
              >
                <Play className="w-4 h-4" />
                <span>{t('nav.laDelivery')}</span>
              </Link>
            </div>
            <Link
              to="/patent"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 text-slate-300 hover:text-accent-cyan py-2"
            >
              <FileText className="w-4 h-4" />
              <span>{t('nav.patent')}</span>
            </Link>
            <Link
              to="/jezgro-dev"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 text-slate-300 hover:text-accent-cyan py-2"
            >
              <Lock className="w-3 h-3" />
              <Cpu className="w-4 h-4" />
              <span>{t('nav.jezgroDev')}</span>
            </Link>
            <Link
              to="/roj"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 text-slate-300 hover:text-accent-cyan py-2"
            >
              <Lock className="w-3 h-3" />
              <Hexagon className="w-4 h-4" />
              <span>{t('nav.roj')}</span>
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
