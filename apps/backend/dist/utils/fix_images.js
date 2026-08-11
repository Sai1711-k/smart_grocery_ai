"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const IMAGE_MAP = {
    // Fruits
    'Apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bc6c?w=400&q=80',
    'Banana': 'https://images.unsplash.com/photo-1571501478200-c5c4e785f838?w=400&q=80',
    'Orange': 'https://images.unsplash.com/photo-1549888834-3ec93abae044?w=400&q=80',
    'Mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80',
    'Grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80',
    'Strawberry': 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=400&q=80',
    'Watermelon': 'https://images.unsplash.com/photo-1587049352847-4d4b1ed74476?w=400&q=80',
    'Pineapple': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80',
    'Papaya': 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400&q=80',
    'Pomegranate': 'https://images.unsplash.com/photo-1615486171448-4fbaf08cb4be?w=400&q=80',
    // Vegetables
    'Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
    'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
    'Onion': 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400&q=80',
    'Carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80',
    'Cabbage': 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&q=80',
    'Cauliflower': 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&q=80',
    'Spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
    'Broccoli': 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80',
    'Capsicum': 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&q=80',
    'Cucumber': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80',
    'Garlic': 'https://images.unsplash.com/photo-1540148426945-6667d092058e?w=400&q=80',
    'Ginger': 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=400&q=80',
    'Green Chili': 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=400&q=80',
    'Lady Finger': 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=400&q=80',
    'Brinjal': 'https://images.unsplash.com/photo-1629853925765-b153b6fa6ce2?w=400&q=80',
    'Mushroom': 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400&q=80',
    // Dairy
    'Milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
    'Curd': 'https://images.unsplash.com/photo-1570197571499-166b5343541c?w=400&q=80',
    'Paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946cea?w=400&q=80',
    'Cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80',
    'Butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
    'Ghee': 'https://images.unsplash.com/photo-1630145265430-6b6a032dc1df?w=400&q=80',
    'Eggs': 'https://images.unsplash.com/photo-1587486913049-53fc88980bfc?w=400&q=80',
    'Yogurt': 'https://images.unsplash.com/photo-1570197571499-166b5343541c?w=400&q=80',
    // Bakery
    'Bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    'Whole Wheat Bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    'Croissant': 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?w=400&q=80',
    'Muffin': 'https://images.unsplash.com/photo-1558401391-7899b4bd5bbf?w=400&q=80',
    'Cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80',
    'Cookies': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80',
    // Meat
    'Chicken': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80', // Replace with meat image
    'Mutton': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80',
    'Fish': 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&q=80',
    'Prawns': 'https://images.unsplash.com/photo-1559742811-822873691df8?w=400&q=80',
    // Grains & Pulses
    'Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400&q=80',
    'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
    'Dal': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
    'Oats': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&q=80',
    'Flour': 'https://images.unsplash.com/photo-1508338712271-40539c95ae47?w=400&q=80',
    // Oils
    'Olive Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    'Sunflower Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80', // using olive oil placeholder
    'Mustard Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
};
const CATEGORY_FALLBACKS = {
    'Fruits': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80',
    'Vegetables': 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&q=80',
    'Dairy': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80',
    'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    'Meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
    'Oils': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    'Grains': 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400&q=80',
};
async function updateImages() {
    console.log('Fetching products to update images...');
    const { data: products, error } = await supabase.from('products').select('id, name, category');
    if (error || !products) {
        console.error('Failed to fetch products:', error);
        return;
    }
    let count = 0;
    for (const product of products) {
        let imageUrl = '';
        // Check direct match
        if (IMAGE_MAP[product.name]) {
            imageUrl = IMAGE_MAP[product.name];
        }
        else {
            // Try to find a partial match
            const matchedKey = Object.keys(IMAGE_MAP).find(k => product.name.toLowerCase().includes(k.toLowerCase()));
            if (matchedKey) {
                imageUrl = IMAGE_MAP[matchedKey];
            }
            else {
                // Fallback to category
                imageUrl = CATEGORY_FALLBACKS[product.category] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80'; // generic grocery
            }
        }
        const { error: updateErr } = await supabase
            .from('products')
            .update({ image_url: imageUrl })
            .eq('id', product.id);
        if (updateErr) {
            console.error(`Failed to update ${product.name}:`, updateErr.message);
        }
        else {
            count++;
        }
    }
    console.log(`Successfully updated ${count} images with realistic Unsplash photos!`);
}
updateImages();
