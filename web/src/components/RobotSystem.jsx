import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bot, Bus, Zap, Wrench, ArrowLeftRight, CheckCircle } from 'lucide-react';

function RobotSystem() {
  const { t } = useTranslation();

  return (
    <section id="robots" className="py-24 bg-gradient-to-b from-secondary to-primary">
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
            {t('robots.title')}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('robots.subtitle')}
          </p>
        </motion.div>

        {/* Two Robots Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Robot A - Bus */}
            <div className="bg-primary/50 border border-cyan/20 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bus className="w-10 h-10 text-cyan" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{t('robots.robotA.title')}</h3>
              <p className="text-cyan font-mono text-sm mb-4">{t('robots.robotA.location')}</p>
              <ul className="text-gray-400 text-left space-y-2">
                {(t('robots.robotA.features', { returnObjects: true }) || []).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coordination Arrow */}
            <div className="flex flex-col items-center justify-center">
              <motion.div
                animate={{ x: [0, 10, 0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-cyan"
              >
                <ArrowLeftRight className="w-16 h-16" />
              </motion.div>
              <p className="text-cyan font-bold mt-4">{t('robots.coordination')}</p>
              <p className="text-gray-500 text-sm">{t('robots.wireless')}</p>
            </div>

            {/* Robot B - Station */}
            <div className="bg-primary/50 border border-purple/20 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-purple/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-purple" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{t('robots.robotB.title')}</h3>
              <p className="text-purple font-mono text-sm mb-4">{t('robots.robotB.location')}</p>
              <ul className="text-gray-400 text-left space-y-2">
                {(t('robots.robotB.features', { returnObjects: true }) || []).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Self-Healing Scenario */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-cyan/10 to-purple/10 border border-cyan/20 rounded-2xl p-8 mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            {t('robots.selfHealing.title')}
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <h4 className="text-red-400 font-bold mb-4">{t('robots.selfHealing.traditional.title')}</h4>
              <ol className="text-gray-400 space-y-2">
                {(t('robots.selfHealing.traditional.steps', { returnObjects: true }) || []).map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-400 font-mono">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 pt-4 border-t border-red-500/20">
                <span className="text-red-400 font-bold">{t('robots.selfHealing.traditional.result')}</span>
              </div>
            </div>

            {/* ELEKTROKOMBINACIJA */}
            <div className="bg-green/10 border border-green/20 rounded-xl p-6">
              <h4 className="text-green font-bold mb-4">{t('robots.selfHealing.ek.title')}</h4>
              <ol className="text-gray-400 space-y-2">
                {(t('robots.selfHealing.ek.steps', { returnObjects: true }) || []).map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green font-mono">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 pt-4 border-t border-green/20">
                <span className="text-green font-bold">{t('robots.selfHealing.ek.result')}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan mb-2">2</div>
            <div className="text-gray-400">{t('robots.stats.robots')}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green mb-2">2 min</div>
            <div className="text-gray-400">{t('robots.stats.repairTime')}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple mb-2">0</div>
            <div className="text-gray-400">{t('robots.stats.truckRolls')}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">24/7</div>
            <div className="text-gray-400">{t('robots.stats.availability')}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default RobotSystem;
