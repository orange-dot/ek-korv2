import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Brain,
  Bus,
  Bot,
  Route,
  ArrowRight,
  Truck,
  UserX,
  Package,
  Recycle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

function SelfHealingFleet() {
  const { t } = useTranslation();

  const steps = [
    { key: 'predict', icon: Brain, color: 'cyan' },
    { key: 'carry', icon: Bus, color: 'green' },
    { key: 'swap', icon: Bot, color: 'purple' },
    { key: 'transport', icon: Route, color: 'orange' },
  ];

  const benefits = [
    { key: 'noTruckRolls', icon: Truck },
    { key: 'noFieldTech', icon: UserX },
    { key: 'fleetSpares', icon: Package },
    { key: 'circular', icon: Recycle },
  ];

  return (
    <section id="self-healing" className="py-24 bg-gradient-to-b from-primary to-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('selfHealingFleet.title')}
          </h2>
          <p className="text-2xl text-cyan font-bold mb-4">
            {t('selfHealingFleet.subtitle')}
          </p>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto">
            {t('selfHealingFleet.description')}
          </p>
        </motion.div>

        {/* 4-Step Process */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-4 gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const colorClasses = {
                cyan: 'bg-cyan/20 text-cyan border-cyan/30',
                green: 'bg-green/20 text-green border-green/30',
                purple: 'bg-purple/20 text-purple border-purple/30',
                orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
              };
              return (
                <div key={step.key} className="relative">
                  <div className={`bg-primary/50 border ${colorClasses[step.color]} rounded-xl p-6 text-center h-full`}>
                    <div className="text-4xl font-bold text-gray-600 mb-2">{index + 1}</div>
                    <div className={`w-16 h-16 ${colorClasses[step.color]} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {t(`selfHealingFleet.steps.${step.key}.title`)}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {t(`selfHealingFleet.steps.${step.key}.description`)}
                    </p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Comparison: Traditional vs EK */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-red-400">
                  {t('selfHealingFleet.comparison.traditional.title')}
                </h3>
                <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-bold">{t('selfHealingFleet.comparison.traditional.time')}</span>
                </div>
              </div>
              <div className="space-y-3">
                {(t('selfHealingFleet.comparison.traditional.steps', { returnObjects: true }) || []).map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-300">{step}</span>
                    {index < 5 && <ArrowRight className="w-4 h-4 text-red-400/50 ml-auto" />}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-red-500/30 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-400" />
                <span className="text-red-400">Downtime, truck rolls, waiting</span>
              </div>
            </div>

            {/* ELEKTROKOMBINACIJA */}
            <div className="bg-green/10 border border-green/30 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-green">
                  {t('selfHealingFleet.comparison.ek.title')}
                </h3>
                <div className="flex items-center gap-2 bg-green/20 px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5 text-green" />
                  <span className="text-green font-bold">{t('selfHealingFleet.comparison.ek.time')}</span>
                </div>
              </div>
              <div className="space-y-3">
                {(t('selfHealingFleet.comparison.ek.steps', { returnObjects: true }) || []).map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green/20 rounded-full flex items-center justify-center text-green font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-300">{step}</span>
                    {index < 3 && <ArrowRight className="w-4 h-4 text-green/50 ml-auto" />}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-green/30 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green" />
                <span className="text-green">Continuous operation, zero waiting</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-4 gap-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.key} className="bg-primary/30 border border-gray-700/50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-cyan" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    {t(`selfHealingFleet.benefits.${benefit.key}.title`)}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {t(`selfHealingFleet.benefits.${benefit.key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default SelfHealingFleet;
