import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Wrench, Target, Lightbulb, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Investor Pitch Page - English only, standalone layout
 * Presents ELEKTROKOMBINACIJA concept with honest, no-hype tone
 */
export default function InvestorPitchPage() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center circuit-bg overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-transparent to-primary" />

        {/* Animated glow circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-pulse-slow" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Company name */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
              <span className="text-white">ELEKTRO</span>
              <span className="gradient-text">KOMBINACIJA</span>
            </h1>

            {/* One-liner */}
            <h2 className="text-2xl md:text-3xl text-accent-cyan font-medium mb-6">
              Rethinking EV Charger Serviceability
            </h2>

            {/* Brief description */}
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
              Modular architecture for field-serviceable EV charging infrastructure.
              Design target: 15+ year operational life with predictable maintenance costs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-light">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">The Reliability Problem</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-primary p-6 rounded-2xl border border-border">
                <div className="text-5xl font-bold text-red-400 mb-2">71%</div>
                <div className="text-lg text-slate-300 mb-4">First-time charge success rate</div>
                <div className="text-sm text-slate-500">
                  Source: J.D. Power 2024 U.S. Electric Vehicle Experience (EVX) Public Charging Study
                </div>
              </div>

              <div className="bg-primary p-6 rounded-2xl border border-border">
                <div className="text-5xl font-bold text-orange-400 mb-2">-15 pts</div>
                <div className="text-lg text-slate-300 mb-4">Reliability drop after 3 years</div>
                <div className="text-sm text-slate-500">
                  Source: ChargerHelp! 2024 State of EV Charging Reliability Report
                </div>
              </div>
            </div>

            <div className="bg-primary p-8 rounded-2xl border border-border">
              <blockquote className="text-lg text-slate-300 italic mb-4">
                "The industry tends to focus on uptime - is the charger on? But actual charging success
                is different. A charger can be 'up' but still fail to deliver a charge due to software
                errors, payment issues, or connector problems."
              </blockquote>
              <div className="text-accent-cyan font-medium">
                — Kameale Terry, CEO of ChargerHelp!
              </div>
            </div>

            <div className="mt-8 text-slate-400 space-y-4">
              <p>
                <strong className="text-white">The root cause:</strong> Current EV chargers use integrated
                designs optimized for manufacturing cost, not serviceability. When components fail,
                field repair is impractical. The entire unit often needs replacement.
              </p>
              <p>
                This creates a vicious cycle: high repair costs lead to deferred maintenance,
                which leads to lower reliability, which damages customer trust in EV infrastructure.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent-cyan/20 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-accent-cyan" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Our Approach</h2>
            </div>

            <p className="text-xl text-slate-300 mb-12">
              Return to modular design principles. The same philosophy that made 1970s test equipment
              field-serviceable for decades - applied to modern power electronics.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-primary-light p-6 rounded-2xl border border-border">
                <div className="text-accent-cyan text-lg font-semibold mb-2">EK3 Module Concept</div>
                <div className="text-slate-400 text-sm mb-4">3.3 kW standardized power modules</div>
                <ul className="text-slate-500 text-sm space-y-2">
                  <li>• Scalable: combine modules for higher power</li>
                  <li>• Target range: small chargers to megawatt-class</li>
                  <li>• One module design across applications</li>
                </ul>
              </div>

              <div className="bg-primary-light p-6 rounded-2xl border border-border">
                <div className="text-accent-purple text-lg font-semibold mb-2">Field Replacement</div>
                <div className="text-slate-400 text-sm mb-4">Design goal: robotic serviceability</div>
                <ul className="text-slate-500 text-sm space-y-2">
                  <li>• Target: designed for automated handling</li>
                  <li>• Target: hot-swap without system shutdown</li>
                  <li>• Target: modules return to service center for repair</li>
                </ul>
              </div>

              <div className="bg-primary-light p-6 rounded-2xl border border-border">
                <div className="text-green-400 text-lg font-semibold mb-2">Predictive Diagnostics</div>
                <div className="text-slate-400 text-sm mb-4">Design goal: anticipate failures</div>
                <ul className="text-slate-500 text-sm space-y-2">
                  <li>• Target: embedded diagnostics per module</li>
                  <li>• Target: fleet-wide health monitoring</li>
                  <li>• Goal: predictive replacement</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 p-6 rounded-2xl border border-accent-cyan/30">
              <p className="text-slate-300">
                <strong className="text-white">Important:</strong> This is a design approach, not a
                proven system. We are in the concept development phase, validating these ideas
                through simulation and prototyping.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Differentiation Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-light">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-accent-purple" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Why This Approach</h2>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-1 bg-accent-cyan rounded-full flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Optimizing for Total Cost of Ownership
                  </h3>
                  <p className="text-slate-400">
                    Most charger manufacturers optimize for lowest manufacturing cost. We are optimizing
                    for total cost over a 15+ year service life. This means higher upfront component
                    cost, but potentially lower lifetime maintenance costs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1 bg-accent-purple rounded-full flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Infrastructure ≠ Consumer Electronics
                  </h3>
                  <p className="text-slate-400">
                    Consumer electronics can be replaced every few years. Charging infrastructure
                    must last decades. The design philosophy should reflect this - prioritizing
                    repairability and upgradeability over disposability.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1 bg-green-400 rounded-full flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Circular Economy by Design
                  </h3>
                  <p className="text-slate-400">
                    Design intent: failed modules return to service centers for diagnosis,
                    repair, and redeployment. This extends component life and reduces electronic waste.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-yellow-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Current Stage</h2>
            </div>

            <div className="bg-primary-light p-8 rounded-2xl border border-border mb-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-accent-cyan font-semibold mb-2">Concept & IP</div>
                  <div className="text-slate-400 text-sm">
                    Architecture concept defined. Patent family in preparation.
                  </div>
                </div>
                <div>
                  <div className="text-accent-purple font-semibold mb-2">Simulation</div>
                  <div className="text-slate-400 text-sm">
                    Physics-based simulation (84 models) testing control algorithms and fault scenarios.
                  </div>
                </div>
                <div>
                  <div className="text-green-400 font-semibold mb-2">Seeking Partners</div>
                  <div className="text-slate-400 text-sm">
                    Looking for development partners to validate and commercialize.
                  </div>
                </div>
              </div>
            </div>

            {/* Progress to Date - concrete evidence */}
            <div className="bg-primary p-6 rounded-2xl border border-accent-cyan/30 mb-8">
              <div className="text-accent-cyan font-semibold mb-4">Progress to Date</div>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>• <strong className="text-slate-300">Simulation:</strong> 84 thermal/electrical models implemented</li>
                <li>• <strong className="text-slate-300">Component evaluation:</strong> SiC MOSFETs, magnetics suppliers identified</li>
                <li>• <strong className="text-slate-300">Control:</strong> Fault recovery algorithms tested in simulation</li>
              </ul>
            </div>

            <p className="text-slate-400">
              We are an early-stage venture. The concepts presented here are our design targets -
              not validated claims. We are seeking partners who share our belief that EV charging
              infrastructure needs to be rethought from first principles, with serviceability
              as a primary design constraint.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-light to-primary">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Interested in Learning More?
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              We are seeking development partners with power electronics manufacturing
              capability, and pilot project opportunities with fleet operators or charging networks.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <a
                href="mailto:bojan@elektrokombinacija.rs"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-semibold text-lg hover:shadow-lg hover:shadow-accent-cyan/25 transition-all"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </a>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border text-slate-300 hover:text-white hover:border-slate-500 transition-all"
              >
                <ExternalLink className="w-5 h-5" />
                Technical Details
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to main site
          </Link>
          <div className="text-slate-600 text-sm">
            ELEKTROKOMBINACIJA d.o.o. · Belgrade, Serbia
          </div>
        </div>
      </footer>
    </div>
  );
}
