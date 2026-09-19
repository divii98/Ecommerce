export const products = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 79.99,
    category: 'Electronics',
    emoji: '🎧',
    color: '#4c6ef5',
    description:
      'Over-ear wireless headphones with active noise cancellation and 30-hour battery life.',
    stock: 12,
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 149.0,
    category: 'Electronics',
    emoji: '⌚',
    color: '#5c7cfa',
    description:
      'Fitness tracking smart watch with heart-rate monitor, GPS, and 5-day battery life.',
    stock: 8,
  },
  {
    id: 3,
    name: 'Running Shoes',
    price: 64.5,
    category: 'Footwear',
    emoji: '👟',
    color: '#f76707',
    description:
      'Lightweight breathable running shoes with cushioned soles, available in multiple sizes.',
    stock: 20,
  },
  {
    id: 4,
    name: 'Leather Backpack',
    price: 89.99,
    category: 'Accessories',
    emoji: '🎒',
    color: '#a0522d',
    description:
      'Durable leather backpack with padded laptop compartment and multiple pockets.',
    stock: 15,
  },
  {
    id: 5,
    name: 'Coffee Maker',
    price: 45.0,
    category: 'Home',
    emoji: '☕',
    color: '#5f3dc4',
    description:
      'Programmable drip coffee maker with a 12-cup carafe and auto shut-off.',
    stock: 6,
  },
  {
    id: 6,
    name: 'Yoga Mat',
    price: 25.99,
    category: 'Fitness',
    emoji: '🧘',
    color: '#2f9e44',
    description:
      'Extra-thick non-slip yoga mat, eco-friendly material, includes carry strap.',
    stock: 30,
  },
  {
    id: 7,
    name: 'Desk Lamp',
    price: 32.5,
    category: 'Home',
    emoji: '💡',
    color: '#e8590c',
    description:
      'Adjustable LED desk lamp with 3 brightness levels and USB charging port.',
    stock: 18,
  },
  {
    id: 8,
    name: 'Sunglasses',
    price: 39.99,
    category: 'Accessories',
    emoji: '🕶️',
    color: '#343a40',
    description:
      'Polarized UV-protection sunglasses with a lightweight aluminum frame.',
    stock: 25,
  },
  {
    id: 9,
    name: 'Bluetooth Speaker',
    price: 59.0,
    category: 'Electronics',
    emoji: '🔊',
    color: '#1c7ed6',
    description:
      'Portable waterproof Bluetooth speaker with 12-hour playback and deep bass.',
    stock: 10,
  },
]

export function getProductById(id) {
  return products.find((p) => p.id === Number(id))
}
