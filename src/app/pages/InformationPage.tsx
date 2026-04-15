import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { faqs, dangerousGoods, shippingRequirements } from '../data/mockData';
import { MessageCircle, Phone, Mail, Flame, AlertTriangle, Droplets, Wind } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';

const dangerousGoodsIcons = {
  flame: Flame,
  bomb: AlertTriangle,
  flask: Droplets,
  wind: Wind,
};

export function InformationPage() {
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
            <h1 className="text-5xl font-bold mb-4">Information Center</h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Everything you need to know about shipping with CargoKu
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Find answers to common questions about our services</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-6 bg-card">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Customer Support */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Customer Support</h2>
            <p className="text-muted-foreground">We're here to help you 24/7</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: MessageCircle,
                title: 'Live Chat',
                description: 'Chat with our support team instantly',
                action: 'Start Chat',
              },
              {
                icon: Phone,
                title: 'Hotline',
                description: '+62 21 1234 5678',
                action: 'Call Now',
              },
              {
                icon: Mail,
                title: 'Email Support',
                description: 'info@cargoku.com',
                action: 'Send Email',
              },
            ].map((support, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <support.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{support.title}</h3>
                <p className="text-muted-foreground mb-4">{support.description}</p>
                <Button variant="outline" className="w-full">
                  {support.action}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dangerous Goods */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-primary">Prohibited Items</h2>
            <p className="text-muted-foreground">The following items are NOT allowed for shipping</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dangerousGoods.map((category, index) => {
              const Icon = dangerousGoodsIcons[category.icon as keyof typeof dangerousGoodsIcons];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6"
                >
                  <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-3 text-orange-600">{category.category}</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {category.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shipping Requirements */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Shipping Requirements</h2>
            <p className="text-muted-foreground">Please follow these guidelines for a smooth shipping experience</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shippingRequirements.map((requirement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-8"
              >
                <h3 className="font-semibold text-lg mb-4 text-primary">{requirement.title}</h3>
                <ul className="space-y-3">
                  {requirement.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="bg-primary h-1.5 w-1.5 rounded-full mt-1.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
