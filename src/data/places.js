// ============================================================
// Mock Data for QueueAI
// Simulates real places with queue and AI prediction details.
// In a real app, this data would come from a backend API.
// ============================================================

export const places = [
  {
    id: 1,
    name: 'Cafe Aroma',
    category: 'Café',
    categoryIcon: '☕',
    address: '12 University Avenue, Block A',
    hours: 'Mon–Sat: 7:00 AM – 9:00 PM',
    rating: 4.5,
    reviews: 128,
    description:
      'A cosy specialty coffee shop known for its artisan brews, fresh pastries, and relaxed atmosphere. Popular with students and remote workers.',
    currentQueue: 8,
    maxQueue: 20,
    estimatedWait: '15 min',
    estimatedWaitMinutes: 15,
    bestTimeToVisit: '2:00 PM – 3:30 PM',
    status: 'moderate', // low | moderate | busy
    statusLabel: 'Moderate Wait',
    aiConfidence: 92,
    color: '#F59E0B',
    bgGradient: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
  },
  {
    id: 2,
    name: 'QuickCut Salon',
    category: 'Salon',
    categoryIcon: '✂️',
    address: '45 Market Street, Ground Floor',
    hours: 'Tue–Sun: 9:00 AM – 7:00 PM',
    rating: 4.7,
    reviews: 94,
    description:
      'A modern walk-in hair salon offering professional haircuts, styling, and grooming services at affordable prices with fast turnaround.',
    currentQueue: 3,
    maxQueue: 10,
    estimatedWait: '8 min',
    estimatedWaitMinutes: 8,
    bestTimeToVisit: '10:00 AM – 11:30 AM',
    status: 'low',
    statusLabel: 'Short Wait',
    aiConfidence: 88,
    color: '#8B5CF6',
    bgGradient: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
  },
  {
    id: 3,
    name: 'City Clinic',
    category: 'Clinic',
    categoryIcon: '🏥',
    address: '7 Health Square, Medical Zone',
    hours: 'Mon–Fri: 8:00 AM – 6:00 PM',
    rating: 4.3,
    reviews: 211,
    description:
      'A well-equipped general medical clinic providing consultations, routine check-ups, and minor procedure services with experienced doctors.',
    currentQueue: 14,
    maxQueue: 25,
    estimatedWait: '35 min',
    estimatedWaitMinutes: 35,
    bestTimeToVisit: '8:00 AM – 9:00 AM',
    status: 'busy',
    statusLabel: 'Busy Now',
    aiConfidence: 85,
    color: '#EF4444',
    bgGradient: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
  },
  {
    id: 4,
    name: 'Burger Hub',
    category: 'Restaurant',
    categoryIcon: '🍔',
    address: '88 Food Court Lane, Level 2',
    hours: 'Daily: 11:00 AM – 10:00 PM',
    rating: 4.6,
    reviews: 305,
    description:
      'A trendy gourmet burger joint famous for its smash burgers, loaded fries, and craft milkshakes. A go-to for quick, satisfying meals.',
    currentQueue: 6,
    maxQueue: 15,
    estimatedWait: '12 min',
    estimatedWaitMinutes: 12,
    bestTimeToVisit: '3:00 PM – 5:00 PM',
    status: 'moderate',
    statusLabel: 'Moderate Wait',
    aiConfidence: 90,
    color: '#10B981',
    bgGradient: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
  },
]

// Helper: get a single place by ID
export const getPlaceById = (id) => places.find((p) => p.id === parseInt(id))
