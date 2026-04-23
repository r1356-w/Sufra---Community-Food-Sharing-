/**
 * config/seed.js
 *
 * Run with: npm run seed
 *
 * Seeds the database with:
 *  - Sample menu items
 *  - A demo admin user
 *  - Initial Impact document
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { MenuItem, Impact } = require('../models/Impact');
const User = require('../models/User');

const MENU_ITEMS = [
  // ── Starters ───────────────────────────────────────────────────────────────
  {
    name: 'Hummus Baladna',
    description: 'House-made hummus with warm flatbread, olive oil, za\'atar and toasted pine nuts.',
    price: 6.50,
    category: 'starters',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600',
    tags: ['vegan', 'gluten-free-option'],
    calories: 320,
    prepTime: 10,
    featured: true,
    isSuspendable: true,
    sortOrder: 1,
  },
  {
    name: 'Fattoush Salad',
    description: 'Crispy pita, sumac-dressed vegetables, pomegranate molasses.',
    price: 7.00,
    category: 'starters',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
    tags: ['vegan'],
    calories: 280,
    prepTime: 10,
    isSuspendable: true,
    sortOrder: 2,
  },
  // ── Mains ──────────────────────────────────────────────────────────────────
  {
    name: 'Lamb Mansaf',
    description: 'Slow-cooked lamb shoulder over saffron rice with fermented jameed sauce.',
    price: 18.50,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600',
    tags: ['signature', 'halal'],
    calories: 780,
    prepTime: 25,
    featured: true,
    isSuspendable: true,
    sortOrder: 10,
  },
  {
    name: 'Mujaddara',
    description: 'Lentils and bulgur with caramelised onion, fresh yoghurt and herbs.',
    price: 12.00,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600',
    tags: ['vegetarian', 'vegan-option'],
    calories: 520,
    prepTime: 20,
    featured: true,
    isSuspendable: true,
    sortOrder: 11,
  },
  {
    name: 'Grilled Sea Bream',
    description: 'Whole sea bream, chermoula marinade, charred lemon, harissa verde.',
    price: 22.00,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600',
    tags: ['halal', 'gluten-free'],
    calories: 610,
    prepTime: 30,
    isSuspendable: false,
    sortOrder: 12,
  },
  {
    name: 'Shakshuka Sufra',
    description: 'Eggs poached in spiced tomato-pepper sauce, feta, sourdough to dip.',
    price: 13.50,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=600',
    tags: ['vegetarian'],
    calories: 490,
    prepTime: 20,
    isSuspendable: true,
    sortOrder: 13,
  },
  // ── Sides ──────────────────────────────────────────────────────────────────
  {
    name: 'Roasted Cauliflower',
    description: 'Whole-roasted cauliflower, tahini, pomegranate seeds, dukkah.',
    price: 8.00,
    category: 'sides',
    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600',
    tags: ['vegan', 'gluten-free'],
    calories: 220,
    prepTime: 15,
    isSuspendable: true,
    sortOrder: 20,
  },
  {
    name: 'Mejadra Rice',
    description: 'Fragrant rice with fried onions, cumin and turmeric.',
    price: 5.00,
    category: 'sides',
    image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600',
    tags: ['vegan', 'gluten-free'],
    calories: 310,
    prepTime: 10,
    isSuspendable: true,
    sortOrder: 21,
  },
  // ── Desserts ───────────────────────────────────────────────────────────────
  {
    name: 'Knafeh',
    description: 'Warm shredded pastry, melted akkawi cheese, rose syrup, crushed pistachios.',
    price: 8.50,
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600',
    tags: ['vegetarian', 'signature'],
    calories: 520,
    prepTime: 15,
    featured: true,
    isSuspendable: true,
    sortOrder: 30,
  },
  {
    name: 'Ma\'amoul Cookies',
    description: 'Date-filled semolina cookies dusted with powdered sugar (3 pcs).',
    price: 5.50,
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600',
    tags: ['vegetarian'],
    calories: 280,
    prepTime: 5,
    isSuspendable: true,
    sortOrder: 31,
  },
  // ── Drinks ─────────────────────────────────────────────────────────────────
  {
    name: 'Jallab Juice',
    description: 'Traditional grape-rose water drink with pine nuts and raisins.',
    price: 4.50,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600',
    tags: ['vegan', 'non-alcoholic'],
    calories: 180,
    prepTime: 5,
    isSuspendable: true,
    sortOrder: 40,
  },
  {
    name: 'Mint Lemonade',
    description: 'Fresh-squeezed lemon, garden mint, a touch of rose water.',
    price: 4.00,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600',
    tags: ['vegan', 'non-alcoholic'],
    calories: 120,
    prepTime: 5,
    isSuspendable: true,
    sortOrder: 41,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await MenuItem.deleteMany({});
  await User.deleteMany({});
  await Impact.deleteMany({});

  // Seed menu
  const items = await MenuItem.insertMany(MENU_ITEMS);
  console.log(`✅ Seeded ${items.length} menu items`);

  // Seed admin user
  await User.create({
    name:         'Sufra Admin',
    email:        'admin@sufra.com',
    passwordHash: 'Password123!',
    role:         'admin',
  });
  console.log('✅ Created admin user  →  admin@sufra.com / Password123!');

  // Initialise Impact singleton
  await Impact.create({
    _id:                     'global',
    suspendedMealsAvailable: 12,
    totalMealsDonated:       248,
    totalMealsDelivered:     236,
    totalCo2Saved:           42.7,
    totalSharedDeliveries:   122,
    totalOrders:             1840,
    totalDonors:             94,
  });
  console.log('✅ Seeded Impact document');

  await mongoose.disconnect();
  console.log('🎉 Seed complete!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
