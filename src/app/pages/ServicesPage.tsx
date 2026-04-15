import { ServiceCard } from '../components/ServiceCard';
import { services } from '../data/mockData';
import { motion } from 'motion/react';

export function ServicesPage() {
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
            <h1 className="text-5xl font-bold mb-4">Our Services</h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Choose from our range of delivery services tailored to meet your business needs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <ServiceCard {...service} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Need Help Choosing?</h2>
              <p className="text-muted-foreground mb-6">
                Not sure which service is right for you? Our team is here to help you select the best option for your shipment needs.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="bg-primary h-2 w-2 rounded-full mt-2" />
                  <span>Compare delivery times and costs</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary h-2 w-2 rounded-full mt-2" />
                  <span>Get personalized recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary h-2 w-2 rounded-full mt-2" />
                  <span>Learn about special handling options</span>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-xl"
            >
              <h3 className="text-2xl font-bold mb-4">Contact Our Team</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer Service Hotline</p>
                  <p className="text-lg font-semibold text-primary">+62 21 1234 5678</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email Support</p>
                  <p className="text-lg font-semibold text-primary">info@cargoku.com</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Live Chat</p>
                  <p className="text-sm">Available 24/7 on our website</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
