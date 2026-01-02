import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary-light border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Zap className="w-6 h-6 text-accent-cyan" />
            <span className="text-lg font-bold">
              <span className="text-white">ELEKTRO</span>
              <span className="text-accent-cyan">KOMBINACIJA</span>
            </span>
          </div>

          {/* Tagline */}
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            {t('footer.tagline')}
          </p>

          {/* Copyright */}
          <p className="text-slate-500 text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
