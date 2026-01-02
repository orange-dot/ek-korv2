import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

export default function Problem() {
  const { t } = useTranslation();

  const stats = [
    {
      icon: TrendingDown,
      value: t('problem.stats.success'),
      label: t('problem.stats.successLabel'),
      color: 'text-orange-500'
    },
    {
      icon: TrendingUp,
      value: t('problem.stats.broken'),
      label: t('problem.stats.brokenLabel'),
      color: 'text-green-500'
    },
    {
      icon: AlertTriangle,
      value: t('problem.stats.diagnostic'),
      label: t('problem.stats.diagnosticLabel'),
      color: 'text-red-500'
    },
  ];

  return (
    <section id="problem" className="py-24 bg-primary-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('problem.title')}
          </h2>
          <p className="text-xl text-slate-400 font-medium">
            {t('problem.subtitle')}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-primary/80 border border-border rounded-2xl p-8 text-center"
            >
              <div className={`w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className={`text-5xl md:text-6xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <p className="text-slate-400">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-16"
        >
          <blockquote className="text-xl md:text-2xl text-slate-300 italic text-center">
            {t('problem.quote')}
          </blockquote>
          <p className="text-slate-500 text-center mt-4">
            {t('problem.quoteAuthor')}
          </p>
        </motion.div>

        {/* Aging section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary/60 border border-border rounded-2xl p-8 mb-12"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            {t('problem.aging.title')}
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Year 0 */}
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">85%</div>
              <p className="text-slate-400 text-sm">{t('problem.aging.year0')}</p>
            </div>

            {/* Arrow */}
            <div className="text-4xl text-slate-600">→</div>

            {/* Year 3 */}
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">69.9%</div>
              <p className="text-slate-400 text-sm">{t('problem.aging.year3')}</p>
            </div>
          </div>

          <p className="text-slate-400 text-center mt-6">
            {t('problem.aging.description')}
          </p>
        </motion.div>

        {/* Challenge statement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-2xl md:text-3xl font-bold text-white">
            {t('problem.challenge')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
