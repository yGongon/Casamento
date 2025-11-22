import { Gift } from './types';

// Wedding Date: February 14, 2026 at 16:00
// Note: Month is 0-indexed in JavaScript Dates (0 = January, 1 = February)
export const WEDDING_DATE = new Date(2026, 1, 14, 16, 0, 0);

// Placeholder image for the couple. Replace with the actual photo URL.
export const COUPLE_PHOTO = "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop";

// PIX Configuration
// Substitua pela sua chave real e pela URL da imagem do seu QR Code gerado no app do banco
export const PIX_KEY = "000.000.000-00"; 
export const PIX_HOLDER_NAME = "Gabriella & Wevelley";
export const PIX_QR_CODE_URL = "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"; // Exemplo placeholder

export const INITIAL_GIFTS: Gift[] = [
  {
    id: '1',
    name: 'Jogo de Taças de Cristal',
    description: 'Para brindarmos novas conquistas com elegância.',
    image: 'https://picsum.photos/id/431/600/400', // Wine/Glass vibe
    category: 'Casa & Decor',
    claimedBy: null,
    claimedByUserId: null,
  },
  {
    id: '2',
    name: 'Panela Francesa Le Creuset',
    description: 'Sabores que aquecem o coração e a alma.',
    image: 'https://picsum.photos/id/292/600/400', // Kitchen/Cooking vibe
    category: 'Cozinha',
    claimedBy: null,
    claimedByUserId: null,
  },
  {
    id: '3',
    name: 'Cafeteira Espresso Automática',
    description: 'Para manhãs cheias de aconchego e aroma.',
    image: 'https://picsum.photos/id/1060/600/400', // Coffee vibe
    category: 'Cozinha',
    claimedBy: null,
    claimedByUserId: null,
  },
  {
    id: '4',
    name: 'Jogo de Cama 600 Fios',
    description: 'Conforto é poesia diária em nosso descanso.',
    image: 'https://picsum.photos/id/1011/600/400', // Texture/Fabric vibe
    category: 'Cama & Banho',
    claimedBy: null,
    claimedByUserId: null,
  },
  {
    id: '5',
    name: 'Kit Spa Aromático',
    description: 'Lar com perfume de paz e tranquilidade.',
    image: 'https://picsum.photos/id/360/600/400', // Flower/Spa vibe
    category: 'Casa & Decor',
    claimedBy: null,
    claimedByUserId: null,
  },
  {
    id: '6',
    name: 'Aparelho de Jantar Cerâmica',
    description: 'Para recebermos amigos com arte à mesa.',
    image: 'https://picsum.photos/id/42/600/400', // Table setting
    category: 'Casa & Decor',
    claimedBy: null,
    claimedByUserId: null,
  }
];