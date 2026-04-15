import { Target, Eye, Award, Users } from 'lucide-react';
import { motion } from 'motion/react';

export function AboutPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-4">About CargoKu</h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Your trusted logistics partner since 2010
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Profile */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Who We Are</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  CargoKu is Indonesia's leading logistics and delivery service provider, specializing in fast, reliable, and secure package transportation across the archipelago and beyond.
                </p>
                <p>
                  Founded in 2010, we have grown from a small local courier service to a nationwide logistics network serving thousands of businesses and individuals every day.
                </p>
                <p>
                  With our advanced tracking technology, professional team, and commitment to customer satisfaction, we ensure your packages arrive safely and on time, every time.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-96 rounded-2xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop"
                alt="CargoKu Team"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl p-8"
            >
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-muted-foreground">
                To become the most trusted and innovative logistics partner in Southeast Asia, connecting businesses and communities through seamless delivery solutions.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl p-8"
            >
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground">
                To provide fast, reliable, and affordable delivery services while maintaining the highest standards of customer service and package security.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Award,
                title: 'Excellence',
                description: 'We strive for excellence in every delivery',
              },
              {
                icon: Users,
                title: 'Customer First',
                description: 'Your satisfaction is our top priority',
              },
              {
                icon: Target,
                title: 'Reliability',
                description: 'Consistent performance you can count on',
              },
              {
                icon: Eye,
                title: 'Transparency',
                description: 'Clear communication at every step',
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="bg-primary/10 group-hover:bg-primary transition-all w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-primary group-hover:text-white transition-all" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-muted-foreground">Key milestones in CargoKu's history</p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                year: '2010',
                title: 'Founded',
                description: 'CargoKu started as a small local courier service in Jakarta',
              },
              {
                year: '2015',
                title: 'Nationwide Expansion',
                description: 'Expanded operations to cover all major cities across Indonesia',
              },
              {
                year: '2020',
                title: 'Technology Innovation',
                description: 'Launched real-time tracking system and mobile app',
              },
              {
                year: '2024',
                title: 'International Service',
                description: 'Started international shipping to Asia Pacific region',
              },
              {
                year: '2026',
                title: 'Market Leader',
                description: 'Recognized as one of Indonesia\'s top logistics providers',
              },
            ].map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="flex gap-6"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center font-bold">
                    {milestone.year.slice(-2)}
                  </div>
                  {index < 4 && <div className="w-0.5 h-full bg-primary/20 mt-2" />}
                </div>
                <div className="pb-8 flex-1">
                  <h3 className="font-semibold text-lg mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
