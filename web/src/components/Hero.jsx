import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronDown, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

export default function Hero() {
  const { t } = useTranslation();

  const stats = [
    { icon: CheckCircle, value: t('hero.stats.power'), label: t('hero.stats.powerLabel') },
    { icon: Clock, value: t('hero.stats.weight'), label: t('hero.stats.weightLabel') },
    { icon: ShieldCheck, value: t('hero.stats.price'), label: t('hero.stats.priceLabel') },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center circuit-bg overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-transparent to-primary" />

      {/* Animated glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-pulse-slow" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Main title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-4">
            <span className="text-white">{t('hero.title')}</span>
          </h1>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="gradient-text">{t('hero.subtitle')}</span>
          </h2>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-accent-cyan font-medium mb-4">
            {t('hero.tagline')}
          </p>

          {/* Description */}
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
            {t('hero.description')}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-xl bg-primary-light border border-border flex items-center justify-center mb-3 glow-border">
                  <stat.icon className="w-8 h-8 text-accent-cyan" />
                </div>
                <span className="text-3xl md:text-4xl font-bold text-white">{stat.value}</span>
                <span className="text-sm text-slate-400">{stat.label}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.a
            href="#problem"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-semibold text-lg hover:shadow-lg hover:shadow-accent-cyan/25 transition-all"
          >
            {t('hero.cta')}
          </motion.a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-slate-500 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
