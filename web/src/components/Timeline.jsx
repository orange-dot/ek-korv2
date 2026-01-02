import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Cpu, Layers, Award, Zap, Battery } from 'lucide-react';

export default function Timeline() {
  const { t } = useTranslation();

  const phases = [
    { key: 'phase1', icon: Cpu, color: 'accent-cyan' },
    { key: 'phase2', icon: Layers, color: 'accent-purple' },
    { key: 'phase3', icon: Award, color: 'accent-green' },
    { key: 'phase4', icon: Zap, color: 'accent-cyan' },
    { key: 'phase5', icon: Battery, color: 'accent-purple' },
  ];

  return (
    <section id="timeline" className="py-24 bg-primary-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('timeline.title')}
          </h2>
          <p className="text-xl text-slate-400">{t('timeline.subtitle')}</p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border transform md:-translate-x-1/2" />

          {phases.map((phase, index) => {
            const Icon = phase.icon;
            const phaseData = t(`timeline.${phase.key}`, { returnObjects: true });
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={phase.key}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center mb-12 ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`w-full md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:pl-12'} pl-20 md:pl-0`}>
                  <div className="bg-primary rounded-xl border border-border p-6 hover:border-accent-cyan/30 transition-colors">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${phase.color}/10`}>
                        <Icon className={`w-5 h-5 text-${phase.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{phaseData.title}</h3>
                        <span className="text-sm text-accent-cyan">{phaseData.duration}</span>
                      </div>
                    </div>

                    <p className="text-slate-400 mb-4">{phaseData.description}</p>

                    <ul className="space-y-2">
                      {phaseData.items?.map((item, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Center dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-accent-cyan border-4 border-primary transform -translate-x-1/2" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
