import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Tv,
  Cpu,
  Bot,
  Wrench,
  ArrowRight,
  CheckCircle,
  XCircle,
  RefreshCw,
  Building2,
  Truck
} from 'lucide-react';

export default function Philosophy() {
  const { t } = useTranslation();

  const era1Features = t('philosophy.era1.features', { returnObjects: true }) || [];
  const era2Features = t('philosophy.era2.features', { returnObjects: true }) || [];
  const era3Features = t('philosophy.era3.features', { returnObjects: true }) || [];
  const workflowSteps = t('philosophy.workflow.steps', { returnObjects: true }) || [];

  return (
    <section id="philosophy" className="py-24 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('philosophy.title')}
          </h2>
          <p className="text-xl text-accent-cyan mb-4">{t('philosophy.subtitle')}</p>
          <p className="text-slate-400 max-w-3xl mx-auto">{t('philosophy.description')}</p>
        </motion.div>

        {/* TV Example - Historical Context */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-4">
            {t('philosophy.history.title')}
          </h3>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            {t('philosophy.history.subtitle')}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Era 1: Modular */}
            <div className="bg-primary-light rounded-2xl border-2 border-accent-green/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center">
                  <Tv className="w-6 h-6 text-accent-green" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{t('philosophy.era1.title')}</h4>
                  <p className="text-accent-green text-sm">{t('philosophy.era1.period')}</p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">{t('philosophy.era1.description')}</p>

              <ul className="space-y-3">
                {era1Features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 bg-accent-green/10 rounded-lg">
                <p className="text-accent-green font-medium text-center">
                  {t('philosophy.era1.result')}
                </p>
              </div>
            </div>

            {/* Era 2: Integrated */}
            <div className="bg-primary-light rounded-2xl border-2 border-red-500/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{t('philosophy.era2.title')}</h4>
                  <p className="text-red-400 text-sm">{t('philosophy.era2.period')}</p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">{t('philosophy.era2.description')}</p>

              <ul className="space-y-3">
                {era2Features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 bg-red-500/10 rounded-lg">
                <p className="text-red-400 font-medium text-center">
                  {t('philosophy.era2.result')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Arrow transition */}
        <div className="flex justify-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 bg-primary-light px-8 py-4 rounded-full border border-border"
          >
            <span className="text-slate-400">{t('philosophy.transition.from')}</span>
            <ArrowRight className="w-6 h-6 text-accent-cyan" />
            <span className="text-accent-cyan font-bold">{t('philosophy.transition.to')}</span>
          </motion.div>
        </div>

        {/* Era 3: ELEKTROKOMBINACIJA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="bg-gradient-to-br from-accent-cyan/10 to-accent-green/10 rounded-3xl border-2 border-accent-cyan p-8 md:p-12">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                <Bot className="w-8 h-8 text-accent-cyan" />
              </div>
              <div>
                <h4 className="text-2xl md:text-3xl font-bold text-white">{t('philosophy.era3.title')}</h4>
                <p className="text-accent-cyan">{t('philosophy.era3.period')}</p>
              </div>
            </div>

            <p className="text-xl text-slate-300 text-center mb-8 max-w-3xl mx-auto">
              {t('philosophy.era3.description')}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {era3Features.map((feature, index) => (
                <div key={index} className="bg-primary/50 rounded-xl p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-accent-cyan mx-auto mb-3" />
                  <p className="text-white font-medium">{feature}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-primary/50 rounded-xl">
              <p className="text-accent-cyan font-bold text-xl text-center">
                {t('philosophy.era3.result')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Service Workflow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-4">
            {t('philosophy.workflow.title')}
          </h3>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            {t('philosophy.workflow.subtitle')}
          </p>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 z-0" />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-primary-light rounded-2xl border border-border p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-accent-cyan">{index + 1}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                  <div className="mt-4 text-accent-cyan font-mono text-sm">{step.time}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Two-location system */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-white text-center mb-12">
            {t('philosophy.locations.title')}
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Field - Robot */}
            <div className="bg-primary-light rounded-2xl border border-border p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                  <Bot className="w-7 h-7 text-accent-cyan" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{t('philosophy.locations.field.title')}</h4>
                  <p className="text-accent-cyan">{t('philosophy.locations.field.subtitle')}</p>
                </div>
              </div>

              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent-cyan" />
                  <span className="text-slate-300">{t('philosophy.locations.field.point1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent-cyan" />
                  <span className="text-slate-300">{t('philosophy.locations.field.point2')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent-cyan" />
                  <span className="text-slate-300">{t('philosophy.locations.field.point3')}</span>
                </li>
              </ul>

              <div className="mt-6 flex items-center justify-center gap-2 text-accent-cyan">
                <Truck className="w-5 h-5" />
                <span className="font-medium">{t('philosophy.locations.field.note')}</span>
              </div>
            </div>

            {/* Service Center - Humans */}
            <div className="bg-primary-light rounded-2xl border border-border p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-accent-green/20 flex items-center justify-center">
                  <Wrench className="w-7 h-7 text-accent-green" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{t('philosophy.locations.service.title')}</h4>
                  <p className="text-accent-green">{t('philosophy.locations.service.subtitle')}</p>
                </div>
              </div>

              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent-green" />
                  <span className="text-slate-300">{t('philosophy.locations.service.point1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent-green" />
                  <span className="text-slate-300">{t('philosophy.locations.service.point2')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent-green" />
                  <span className="text-slate-300">{t('philosophy.locations.service.point3')}</span>
                </li>
              </ul>

              <div className="mt-6 flex items-center justify-center gap-2 text-accent-green">
                <RefreshCw className="w-5 h-5" />
                <span className="font-medium">{t('philosophy.locations.service.note')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
