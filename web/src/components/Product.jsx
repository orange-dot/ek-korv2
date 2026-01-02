import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Zap,
  Eye,
  Target,
  Wrench,
  Infinity,
  Check
} from 'lucide-react';

export default function Product() {
  const { t } = useTranslation();

  const features = [
    { icon: Eye, title: t('product.features.modular'), desc: t('product.features.modularDesc') },
    { icon: Target, title: t('product.features.hotswap'), desc: t('product.features.hotswapDesc') },
    { icon: Wrench, title: t('product.features.protection'), desc: t('product.features.protectionDesc') },
    { icon: Infinity, title: t('product.features.local'), desc: t('product.features.localDesc') },
  ];

  const phase1 = t('product.phase1', { returnObjects: true });
  const phase2 = t('product.phase2', { returnObjects: true });

  return (
    <section id="product" className="py-24 bg-primary-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('product.title')}
          </h2>
          <p className="text-xl text-accent-cyan mb-4">{t('product.subtitle')}</p>
          <p className="text-slate-400 max-w-2xl mx-auto">{t('product.description')}</p>
        </motion.div>

        {/* Two Modules Side by Side */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Phase 1: EK3 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-primary rounded-2xl border-2 border-accent-green/50 p-8 h-full">
              <div className="absolute -top-4 left-8 bg-accent-green text-primary px-4 py-1 rounded-full text-sm font-bold">
                {phase1.title}
              </div>

              {/* Module visualization */}
              <div className="flex justify-center mb-6 mt-4">
                <div className="w-32 h-40 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-accent-green/30 flex flex-col items-center justify-center">
                  <Zap className="w-10 h-10 text-accent-green mb-2" />
                  <div className="text-2xl font-bold text-white">{phase1.power}</div>
                  <div className="text-xs text-slate-400">EK3</div>
                </div>
              </div>

              <p className="text-center text-accent-green font-medium mb-6">
                {phase1.description}
              </p>

              <ul className="space-y-3">
                {phase1.specs?.map((spec, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-accent-green" />
                    <span className="text-slate-300">{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Phase 2: Rack System */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-primary rounded-2xl border-2 border-accent-cyan/50 p-8 h-full">
              <div className="absolute -top-4 left-8 bg-accent-cyan text-primary px-4 py-1 rounded-full text-sm font-bold">
                {phase2.title}
              </div>

              {/* Rack visualization - 84 modules */}
              <div className="flex justify-center mb-6 mt-4">
                <div className="w-48 h-56 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-accent-cyan/30 flex flex-col items-center justify-center p-4">
                  <div className="grid grid-cols-6 gap-1 mb-2">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="w-2 h-6 bg-accent-cyan/40 rounded-sm"></div>
                    ))}
                  </div>
                  <div className="text-2xl font-bold text-white">{phase2.power}</div>
                  <div className="text-xs text-slate-400">84× EK3</div>
                </div>
              </div>

              <p className="text-center text-accent-cyan font-medium mb-6">
                {phase2.description}
              </p>

              <ul className="space-y-3">
                {phase2.specs?.map((spec, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-accent-cyan" />
                    <span className="text-slate-300">{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Arrow between phases */}
        <div className="hidden md:flex justify-center items-center -mt-12 mb-8">
          <div className="flex items-center space-x-4 bg-primary-light px-6 py-2 rounded-full border border-border">
            <span className="text-accent-green font-bold">1× EK3</span>
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="text-accent-cyan font-bold">84× EK3</span>
            <span className="text-slate-400 text-sm ml-2">3 kW → 252 kW</span>
          </div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            {t('product.features.title')}
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-primary rounded-xl border border-border text-center hover:border-accent-cyan/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-accent-cyan/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-accent-cyan" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
