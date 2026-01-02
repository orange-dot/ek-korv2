import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';

export default function Team() {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Calendar,
      value: t('team.stats.guarantee'),
      label: t('team.stats.guaranteeLabel'),
    },
    {
      icon: Clock,
      value: t('team.stats.refund'),
      label: t('team.stats.refundLabel'),
    },
  ];

  return (
    <section id="team" className="py-24 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('team.title')}
          </h2>
          <p className="text-xl text-accent-cyan">{t('team.subtitle')}</p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-primary-light rounded-xl border border-border p-6 text-center"
            >
              <stat.icon className="w-8 h-8 text-accent-cyan mx-auto mb-3" />
              <div className="text-4xl font-bold text-accent-cyan mb-1">
                {stat.value}
              </div>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-primary-light rounded-2xl border border-border p-8 text-center">
            <p className="text-lg text-slate-300 leading-relaxed">
              {t('team.mission')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
