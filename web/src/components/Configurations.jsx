import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Bike, Car, Truck, Check, Zap } from 'lucide-react';

export default function Configurations() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('depot');

  const configs = {
    depot: {
      icon: Bike,
      color: 'accent-green',
      modules: '1-3',
      ...t('configurations.depot', { returnObjects: true }),
    },
    opportunity: {
      icon: Car,
      color: 'accent-cyan',
      modules: '5-35',
      ...t('configurations.opportunity', { returnObjects: true }),
    },
    swap: {
      icon: Truck,
      color: 'accent-purple',
      modules: '15-100',
      ...t('configurations.swap', { returnObjects: true }),
    },
  };

  const activeConfig = configs[activeTab];
  const ActiveIcon = activeConfig.icon;

  return (
    <section id="configurations" className="py-24 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('configurations.title')}
          </h2>
          <p className="text-xl text-slate-400">{t('configurations.subtitle')}</p>
        </motion.div>

        {/* Tab buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Object.entries(configs).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full border transition-all ${
                  activeTab === key
                    ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan'
                    : 'border-border text-slate-400 hover:border-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{config.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Visualization */}
            <div className="order-2 lg:order-1">
              <div className="bg-primary-light rounded-2xl border border-border p-8">
                {/* Module grid visualization */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {[...Array(parseInt(activeConfig.modules) || 10)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`w-16 h-20 rounded-lg border-2 flex flex-col items-center justify-center ${
                        activeTab === 'depot'
                          ? 'border-accent-green/50 bg-accent-green/10'
                          : activeTab === 'opportunity'
                          ? 'border-accent-cyan/50 bg-accent-cyan/10'
                          : 'border-accent-purple/50 bg-accent-purple/10'
                      }`}
                    >
                      <Zap className={`w-5 h-5 ${
                        activeTab === 'depot'
                          ? 'text-accent-green'
                          : activeTab === 'opportunity'
                          ? 'text-accent-cyan'
                          : 'text-accent-purple'
                      }`} />
                      <span className="text-xs text-slate-400 mt-1">{activeTab === 'depot' ? 'EK3' : 'EK30'}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{activeConfig.power}</div>
                    <div className="text-xs text-slate-400">Power</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{activeConfig.modules}</div>
                    <div className="text-xs text-slate-400">Modules</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent-cyan">{activeConfig.price}</div>
                    <div className="text-xs text-slate-400">Price</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="order-1 lg:order-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  activeTab === 'depot'
                    ? 'bg-accent-green/10'
                    : activeTab === 'opportunity'
                    ? 'bg-accent-cyan/10'
                    : 'bg-accent-purple/10'
                }`}>
                  <ActiveIcon className={`w-7 h-7 ${
                    activeTab === 'depot'
                      ? 'text-accent-green'
                      : activeTab === 'opportunity'
                      ? 'text-accent-cyan'
                      : 'text-accent-purple'
                  }`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{activeConfig.title}</h3>
                  <p className="text-slate-400">{activeConfig.power}</p>
                </div>
              </div>

              <p className="text-lg text-slate-300 mb-8">
                {activeConfig.description}
              </p>

              <ul className="space-y-3">
                {activeConfig.features?.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className={`w-5 h-5 ${
                      activeTab === 'depot'
                        ? 'text-accent-green'
                        : activeTab === 'opportunity'
                        ? 'text-accent-cyan'
                        : 'text-accent-purple'
                    }`} />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
