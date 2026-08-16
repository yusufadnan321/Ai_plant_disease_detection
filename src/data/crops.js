export const cropImages = {
  Rice:
    'https://images.pexels.com/photos/34765104/pexels-photo-34765104.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  Tomato:
    'https://images.pexels.com/photos/5503106/pexels-photo-5503106.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  Potato:
    'https://images.pexels.com/photos/3173586/pexels-photo-3173586.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  Corn:
    'https://images.pexels.com/photos/33117776/pexels-photo-33117776.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  Banana:
    'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  Mango:
    'https://images.pexels.com/photos/2667738/pexels-photo-2667738.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  Eggplant:
    'https://images.pexels.com/photos/6342164/pexels-photo-6342164.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  Chili:
    'https://images.pexels.com/photos/12845412/pexels-photo-12845412.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
};

export const heroImage =
  'https://images.pexels.com/photos/16166053/pexels-photo-16166053/free-photo-of-farmer-working-in-tea-field.jpeg?auto=compress&cs=tinysrgb&w=1000&h=1000&fit=crop';

export const supportedCrops = [
  { id: 'rice', name: 'Rice', image: cropImages.Rice, tagline: 'Paddy & grain analysis' },
  { id: 'tomato', name: 'Tomato', image: cropImages.Tomato, tagline: 'Leaf & fruit disease detection' },
  { id: 'potato', name: 'Potato', image: cropImages.Potato, tagline: 'Early & late blight detection' },
  { id: 'corn', name: 'Corn', image: cropImages.Corn, tagline: 'Maize leaf disease detection' },
  { id: 'banana', name: 'Banana', image: cropImages.Banana, tagline: 'Sigatoka & panama wilt' },
  { id: 'mango', name: 'Mango', image: cropImages.Mango, tagline: 'Anthracnose & powdery mildew' },
  { id: 'eggplant', name: 'Eggplant', image: cropImages.Eggplant, tagline: 'Leaf spot & fruit rot' },
  { id: 'chili', name: 'Chili', image: cropImages.Chili, tagline: 'Anthracnose & leaf curl' },
];

export const cropOptions = [
  'Unknown',
  'Apple',
  'Rice',
  'Tomato',
  'Potato',
];

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
// Vercel Functions have a 4.5 MB request-body limit. Four MB leaves room for
// multipart form metadata while preserving the existing upload flow.
export const MAX_IMAGE_SIZE_MB = 4;
