import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, MapPin } from 'lucide-react';

export default function Contact() {
  const { t } = useTranslation();

  return (
    <section id="contact" className="py-24 bg-primary-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-slate-400">{t('contact.subtitle')}</p>
        </motion.div>

        {/* Contact Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary rounded-2xl border border-border p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {/* Email */}
            <a
              href={`mailto:${t('contact.info.email')}`}
              className="flex items-center gap-4 group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 flex items-center justify-center border border-accent-cyan/30 group-hover:border-accent-cyan/60 transition-colors">
                <Mail className="w-7 h-7 text-accent-cyan" />
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Email</div>
                <div className="text-lg md:text-xl text-white font-medium group-hover:text-accent-cyan transition-colors">
                  {t('contact.info.email')}
                </div>
              </div>
            </a>

            {/* Divider */}
            <div className="hidden md:block w-px h-16 bg-border" />
            <div className="md:hidden w-32 h-px bg-border" />

            {/* Address */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 flex items-center justify-center border border-accent-purple/30">
                <MapPin className="w-7 h-7 text-accent-purple" />
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Lokacija</div>
                <div className="text-lg md:text-xl text-white font-medium">
                  {t('contact.info.address')}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
