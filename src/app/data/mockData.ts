export interface Service {
  id: string;
  name: string;
  eta: string;
  coverage: string;
  notes: string;
  icon: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  photo: string;
  rating: number;
  totalReviews: number;
  location: string;
  reviews: Review[];
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export const services: Service[] = [
  {
    id: '1',
    name: 'CargoKu REG',
    eta: '2-3 days',
    coverage: 'All major cities in Indonesia',
    notes: 'Standard delivery service with tracking',
    icon: 'package',
  },
  {
    id: '2',
    name: 'CargoKu Express',
    eta: '1 day',
    coverage: 'Jakarta, Surabaya, Bandung',
    notes: 'Same-day delivery for selected areas',
    icon: 'zap',
  },
  {
    id: '3',
    name: 'CargoKu Cargo',
    eta: '3-5 days',
    coverage: 'Nationwide',
    notes: 'For heavy and bulky items',
    icon: 'truck',
  },
  {
    id: '4',
    name: 'CargoKu International',
    eta: '5-7 days',
    coverage: 'Asia Pacific region',
    notes: 'International shipping service',
    icon: 'plane',
  },
  {
    id: '5',
    name: 'CargoKu Same Day',
    eta: '4-6 hours',
    coverage: 'Jakarta area only',
    notes: 'Urgent delivery within the same day',
    icon: 'clock',
  },
  {
    id: '6',
    name: 'CargoKu Economy',
    eta: '4-7 days',
    coverage: 'All regions',
    notes: 'Most affordable option',
    icon: 'dollar-sign',
  },
];

export const staff: Staff[] = [
  {
    id: '1',
    name: 'Ahmad Rizki',
    role: 'Senior Courier',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    rating: 4.8,
    totalReviews: 142,
    location: 'Jakarta Selatan',
    reviews: [
      {
        id: '1',
        customerName: 'Budi Santoso',
        rating: 5,
        comment: 'Very professional and friendly. Package arrived on time!',
        date: '2026-04-10',
      },
      {
        id: '2',
        customerName: 'Siti Aminah',
        rating: 5,
        comment: 'Fast delivery and careful handling. Highly recommended!',
        date: '2026-04-08',
      },
      {
        id: '3',
        customerName: 'Dewi Lestari',
        rating: 4,
        comment: 'Good service, package was well protected.',
        date: '2026-04-05',
      },
    ],
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    role: 'Courier',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    rating: 4.9,
    totalReviews: 98,
    location: 'Jakarta Pusat',
    reviews: [
      {
        id: '4',
        customerName: 'Andi Wijaya',
        rating: 5,
        comment: 'Excellent service! Very polite and efficient.',
        date: '2026-04-11',
      },
      {
        id: '5',
        customerName: 'Rina Kusuma',
        rating: 5,
        comment: 'Best courier ever! Always on time.',
        date: '2026-04-09',
      },
    ],
  },
  {
    id: '3',
    name: 'Bambang Sutrisno',
    role: 'Senior Courier',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    rating: 4.7,
    totalReviews: 203,
    location: 'Jakarta Barat',
    reviews: [
      {
        id: '6',
        customerName: 'Fitri Handayani',
        rating: 5,
        comment: 'Very experienced and trustworthy courier.',
        date: '2026-04-12',
      },
      {
        id: '7',
        customerName: 'Hadi Pratama',
        rating: 4,
        comment: 'Good communication and careful delivery.',
        date: '2026-04-07',
      },
    ],
  },
  {
    id: '4',
    name: 'Dewi Kartika',
    role: 'Courier',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    rating: 4.6,
    totalReviews: 87,
    location: 'Jakarta Timur',
    reviews: [
      {
        id: '8',
        customerName: 'Yanto Suryadi',
        rating: 5,
        comment: 'Very friendly and helpful!',
        date: '2026-04-06',
      },
    ],
  },
  {
    id: '5',
    name: 'Eko Prasetyo',
    role: 'Team Leader',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    rating: 4.9,
    totalReviews: 156,
    location: 'Jakarta Utara',
    reviews: [
      {
        id: '9',
        customerName: 'Linda Wijaya',
        rating: 5,
        comment: 'Outstanding service and professionalism!',
        date: '2026-04-11',
      },
      {
        id: '10',
        customerName: 'Agus Setiawan',
        rating: 5,
        comment: 'Always reliable and on time.',
        date: '2026-04-09',
      },
    ],
  },
  {
    id: '6',
    name: 'Fitri Rahmawati',
    role: 'Courier',
    photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
    rating: 4.8,
    totalReviews: 124,
    location: 'Tangerang',
    reviews: [
      {
        id: '11',
        customerName: 'Dedi Kurniawan',
        rating: 5,
        comment: 'Great courier! Very careful with fragile items.',
        date: '2026-04-10',
      },
    ],
  },
];

export const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How to send a package?',
    answer: 'You can send a package by visiting our nearest service point or requesting a pickup through our customer service. Make sure to pack your items properly and provide complete recipient information.',
  },
  {
    id: '2',
    question: 'How to track my shipment?',
    answer: 'Enter your tracking number on our homepage or tracking page. You will see real-time updates of your package location and delivery status.',
  },
  {
    id: '3',
    question: 'What if my package is damaged?',
    answer: 'Please contact our customer service immediately with your tracking number and photos of the damage. We will investigate and provide appropriate compensation according to our terms and conditions.',
  },
  {
    id: '4',
    question: 'What are the prohibited items?',
    answer: 'Prohibited items include: flammable materials, explosives, hazardous chemicals, illegal substances, perishable food items, and live animals. Please refer to our Information page for a complete list.',
  },
  {
    id: '5',
    question: 'How long does delivery take?',
    answer: 'Delivery time depends on the service type and destination. Regular service takes 2-3 days, Express takes 1 day, and Same Day service delivers within 4-6 hours for Jakarta area.',
  },
  {
    id: '6',
    question: 'Can I change the delivery address?',
    answer: 'Yes, you can request to change the delivery address before the package reaches the destination city. Please contact our customer service with your tracking number to make the change.',
  },
  {
    id: '7',
    question: 'What is the maximum package weight?',
    answer: 'For regular packages, the maximum weight is 30kg. For cargo service, we can handle packages up to 100kg. Additional charges may apply for overweight items.',
  },
  {
    id: '8',
    question: 'How do I file a complaint?',
    answer: 'You can file a complaint through our customer service hotline, email, or live chat. Please provide your tracking number and detailed information about the issue for faster resolution.',
  },
];

export const dangerousGoods = [
  {
    category: 'Flammable Materials',
    items: ['Gasoline', 'Paint thinner', 'Aerosol sprays', 'Lighters'],
    icon: 'flame',
  },
  {
    category: 'Explosives',
    items: ['Fireworks', 'Ammunition', 'Flares', 'Firecrackers'],
    icon: 'bomb',
  },
  {
    category: 'Hazardous Chemicals',
    items: ['Acids', 'Bleach', 'Pesticides', 'Mercury'],
    icon: 'flask',
  },
  {
    category: 'Compressed Gases',
    items: ['Oxygen tanks', 'Propane', 'Fire extinguishers', 'Spray paint'],
    icon: 'wind',
  },
];

export const shippingRequirements = [
  {
    title: 'Packaging Rules',
    items: [
      'Use sturdy boxes or packaging materials',
      'Seal all openings securely with strong tape',
      'Add cushioning materials for fragile items',
      'Use waterproof packaging for sensitive items',
    ],
  },
  {
    title: 'Weight & Dimension Limits',
    items: [
      'Maximum weight: 30kg (regular), 100kg (cargo)',
      'Maximum dimensions: 100cm x 100cm x 100cm',
      'Oversized items require special cargo service',
      'Accurate weight declaration is mandatory',
    ],
  },
  {
    title: 'Required Documents',
    items: [
      'Sender and recipient ID/contact information',
      'Detailed item description and value',
      'Special permits for restricted items',
      'Commercial invoice for international shipments',
    ],
  },
];
