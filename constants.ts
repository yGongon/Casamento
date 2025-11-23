import { Gift } from './types';

// Wedding Date: February 14, 2026 at 16:00
// Note: Month is 0-indexed in JavaScript Dates (0 = January, 1 = February)
export const WEDDING_DATE = new Date(2026, 1, 14, 17, 0, 0);

// Placeholder image for the couple. Replace with the actual photo URL.
export const COUPLE_PHOTO = "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop";

// PIX Configuration
export const PIX_KEY = "(75)992258902"; 
export const PIX_HOLDER_NAME = "Gabriella & Wevelley";
export const PIX_QR_CODE_URL = "https://i.ibb.co/4np1C1gC/QR-code-wevelley.jpg"; 

export const INITIAL_GIFTS: Gift[] = [
  // --- Cama & Banho ---
  {
    id: 'cb-1',
    name: 'Cama Queen',
    description: 'O alicerce dos nossos sonhos e descanso diário.',
    image: 'https://martinelloeletrodomesticos.fbitsstatic.net/img/p/conjunto-box-queen-ortobom-star-158x198-79271/265863.jpg?w=482&h=482&v=no-change&qs=ignore',
    category: 'Cama & Banho',
    maxQuantity: 1
  },
  {
    id: 'cb-2',
    name: 'Jogo de Cama Queen',
    description: 'Toque macio de 600 fios para noites tranquilas.',
    image: 'https://i.pinimg.com/736x/ec/69/dd/ec69ddf0202b3cb30e02e650f66d5039.jpg',
    category: 'Cama & Banho',
    maxQuantity: 4
  },
  {
    id: 'cb-3',
    name: 'Jogo de Banho',
    description: 'Para o conforto de um banho relaxante.',
    image: 'https://i.pinimg.com/736x/55/1b/d5/551bd5b2b61b72f2c8861f988c70fafe.jpg',
    category: 'Cama & Banho',
    maxQuantity: 4
  },
  {
    id: 'cb-4',
    name: 'Par de Travesseiros',
    description: 'Nuvens suaves para apoiar nossos pensamentos.',
    image: 'https://i.pinimg.com/736x/6e/53/bd/6e53bd5829f56d4b2aaf2749eb319fa6.jpg',
    category: 'Cama & Banho',
    maxQuantity: 2
  },
  {
    id: 'cb-5',
    name: 'Edredom',
    description: 'Aconchego garantido para os dias mais frios.',
    image: 'https://i.pinimg.com/1200x/dc/49/09/dc49093e6f6a48ce17e304fb0bc1b920.jpg',
    category: 'Cama & Banho',
    maxQuantity: 2
  },
  {
    id: 'cb-6',
    name: 'Cobertor',
    description: 'Um abraço quentinho para nossas maratonas de filmes.',
    image: 'https://i.pinimg.com/1200x/b9/48/7e/b9487eabb96337c9170bd1a6980fc370.jpg',
    category: 'Cama & Banho',
    maxQuantity: 3
  },

  // --- Casa & Décor ---
  {
    id: 'cd-1',
    name: 'Abajur',
    description: 'Luz suave para criar uma atmosfera intimista.',
    image: 'https://i.pinimg.com/736x/bf/39/dc/bf39dc3d84220e973951b59b55a975c7.jpg',
    category: 'Casa & Décor',
    maxQuantity: 2
  },
  {
    id: 'cd-2',
    name: 'Lixeira Inox',
    description: 'Elegância e organização em cada detalhe.',
    image: 'https://i.pinimg.com/736x/d4/33/23/d43323d31932954c597655b27151476e.jpg',
    category: 'Casa & Décor',
    maxQuantity: 2
  },
  {
    id: 'cd-3',
    name: 'Jogo de Tapetes',
    description: 'Conforto aos pés em todos os cômodos.',
    image: 'https://feiraodetoalhas.cdn.magazord.com.br/img/2023/09/produto/3592/tapate-oval-algodao-indian.jpg',
    category: 'Casa & Décor',
  },
  {
    id: 'cd-4',
    name: 'Mesa de Escritório',
    description: 'Um espaço dedicado para planejar nosso futuro.',
    image: 'https://i.pinimg.com/1200x/56/46/aa/5646aa776110b2b47fffb33926f45772.jpg',
    category: 'Casa & Décor',
  },
  {
    id: 'cd-5',
    name: 'Impressora',
    description: 'Praticidade para o nosso home office.',
    image: 'https://i.pinimg.com/1200x/92/44/a0/9244a08251b34ff9e168ef501cf972e0.jpg',
    category: 'Casa & Décor',
  },
  {
    id: 'cd-6',
    name: 'Mesa de Cabeceira',
    description: 'Para apoiar nossos livros e sonhos antes de dormir.',
    image: 'https://i.pinimg.com/736x/c9/11/2f/c9112fee8d4fce93d829f6a29880cfd3.jpg',
    category: 'Casa & Décor',
  },
  {
    id: 'cd-7',
    name: 'Sapateira',
    description: 'Organização para começar o dia com o pé direito.',
    image: 'https://i.pinimg.com/1200x/14/12/24/141224b5c9b9739c0d100e092cdc3277.jpg',
    category: 'Casa & Décor',
  },
  {
    id: 'cd-8',
    name: 'Ventilador',
    description: 'Brisas frescas para os dias de verão.',
    image: 'https://i.pinimg.com/1200x/b7/9a/fc/b79afc846118d8f9b79393ed91ca27e2.jpg',
    category: 'Casa & Décor',
  },
  {
    id: 'cd-9',
    name: 'Umidificador de Ar',
    description: 'Bem-estar e saúde para o nosso ambiente.',
    image: 'https://i.pinimg.com/736x/8a/b5/1c/8ab51c38e9f9cfe19b35f22508b045cf.jpg',
    category: 'Casa & Décor',
  },
  {
    id: 'cd-10',
    name: 'Máquina de Lavar',
    description: 'Cuidado essencial para nossas roupas favoritas.',
    image: 'https://i.pinimg.com/1200x/d4/29/ad/d429adac49b66715895893be051c46f3.jpg',
    category: 'Casa & Décor',
  },
  {
    id: 'cd-11',
    name: 'Tanquinho',
    description: 'Auxílio prático para a lavanderia.',
    image: 'https://i.pinimg.com/736x/bd/02/11/bd0211c8d888dfa9b20d8a8b21e9a0de.jpg',
    category: 'Casa & Décor',
  },
  {
    id: 'cd-12',
    name: 'Aspirador de Pó',
    description: 'Para manter nosso lar sempre impecável.',
    image: 'https://i.pinimg.com/736x/1a/cd/ad/1acdadc648753f4402ce413f4d9daa37.jpg',
    category: 'Casa & Décor',
  },
  {
    id: 'cd-13',
    name: 'Ferro de Passar',
    description: 'Para estarmos sempre alinhados em ocasiões especiais.',
    image: 'https://i.pinimg.com/1200x/d0/73/7b/d0737b30ee7bd1d350ea20c07df6b2bb.jpg',
    category: 'Casa & Décor',
  },
  {
    id: 'cd-14',
    name: 'Tábua de Passar',
    description: 'O suporte perfeito para o cuidado com as roupas.',
    image: 'https://i.pinimg.com/736x/9f/51/2f/9f512f3f0ffac2ea2f0fecc16dd4389f.jpg',
    category: 'Casa & Décor',
  },
  {
    id: 'cd-15',
    name: 'Cesto de Roupa',
    description: 'Charme até na organização da lavanderia.',
    image: 'https://i.pinimg.com/736x/05/55/eb/0555ebd5f09020d7c1f6b1fc554c23d7.jpg',
    category: 'Casa & Décor',
  },
  
  {
    id: 'cd-18',
    name: 'Espelho Decorativo',
    description: 'Para refletir a alegria da nossa casa.',
    image: 'https://i.pinimg.com/1200x/92/f5/62/92f56222c5eeb4106eeaf0aae111aeda.jpg',
    category: 'Casa & Décor',
  },
  {
    id: 'cd-19',
    name: 'Mop de Limpeza',
    description: 'Praticidade moderna para a limpeza diária.',
    image: 'https://i.pinimg.com/1200x/02/0b/c6/020bc6caf7d069efe0d16fa5d33a52b3.jpg',
    category: 'Casa & Décor',
  },

  // --- Cozinha ---
  {
    id: 'cz-1',
    name: 'Geladeira',
    description: 'O coração da nossa cozinha, preservando sabores.',
    image: 'https://i.pinimg.com/736x/db/ae/77/dbae774bdacd782b5e9a106e34154669.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-2',
    name: 'Fogão',
    description: 'Onde as receitas de família ganharão vida.',
    image: 'https://i.pinimg.com/736x/01/91/60/0191606d1462558392e100519cb5b581.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-3',
    name: 'Air Fryer',
    description: 'Sabor e saúde para nossas refeições rápidas.',
    image: 'https://i.pinimg.com/736x/28/8a/74/288a74ca157de712c14b0ed6ad22e56b.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-4',
    name: 'Microondas',
    description: 'Facilidade para a correria do dia a dia.',
    image: 'https://i.pinimg.com/736x/c0/c9/9b/c0c99b38f0cb723e4eb41be1d2cbdf9e.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-5',
    name: 'Liquidificador',
    description: 'Para sucos frescos e vitaminas matinais.',
    image: 'https://i.pinimg.com/736x/46/9a/5a/469a5a2ad31914251624ac7e45cc7ec6.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-6',
    name: 'Jogo de Panelas',
    description: 'Os instrumentos para nossa arte culinária.',
    image: 'https://i.pinimg.com/1200x/ab/0b/e0/ab0be033a21ea2da63ea1e8089ab94b5.jpg',
    category: 'Cozinha',
    maxQuantity: 2
  },
  {
    id: 'cz-7',
    name: 'Panela de Pressão',
    description: 'Segurança e rapidez no preparo dos clássicos.',
    image: 'https://i.pinimg.com/1200x/05/2a/07/052a07e39fd6a4e755536fd300a99a68.jpg',
    category: 'Cozinha',
    maxQuantity: 1
  },
  {
    id: 'cz-8',
    name: 'Jogo de Talheres',
    description: 'Para servir com elegância em todos os jantares.',
    image: 'https://i.pinimg.com/736x/53/fd/43/53fd4338b67fec116199dbf9f11eec0b.jpg',
    category: 'Cozinha',
    maxQuantity: 2
  },
  {
    id: 'cz-9',
    name: 'Jogo de Copos',
    description: 'Para brindarmos as pequenas vitórias.',
    image: 'https://i.pinimg.com/736x/f0/49/1e/f0491e3429222709717ea033575476ba.jpg',
    category: 'Cozinha',
    maxQuantity: 2
  },
  {
    id: 'cz-10',
    name: 'Pratos',
    description: 'Para servir nossas melhores receitas.',
    image: 'https://i.pinimg.com/736x/4b/28/0b/4b280b57184dc8687afdf0c7b5612a80.jpg',
    category: 'Cozinha',
    maxQuantity: 2
  },
  {
    id: 'cz-11',
    name: 'Filtro de Água',
    description: 'Água pura e fresca sempre à mão.',
    image: 'https://i.pinimg.com/736x/df/b3/50/dfb350e3b8176281ecd4c915c100567b.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-12',
    name: 'Faqueiro',
    description: 'Peças finas para ocasiões especiais.',
    image: 'https://i.pinimg.com/736x/67/3b/8c/673b8cf96baed30ffd012e618fa0ff96.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-13',
    name: 'Cuscuzeira',
    description: 'Tradição e sabor no nosso café da manhã.',
    image: 'https://i.pinimg.com/736x/e8/f5/00/e8f5001d69c84a26f12e3f6c88e1d77b.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-14',
    name: 'Frigideira Antiaderente',
    description: 'Perfeita para grelhados e tapiocas.',
    image: 'https://i.pinimg.com/736x/59/89/2c/59892cd877cfe0cf1cba15420e2d4763.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-15',
    name: 'Forno Elétrico',
    description: 'Assados perfeitos e gratinados deliciosos.',
    image: 'https://i.pinimg.com/1200x/12/4f/49/124f49f55dac0073732e73acb332a418.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-16',
    name: 'Processador de Alimentos',
    description: 'Agilidade no preparo de receitas complexas.',
    image: 'https://i.pinimg.com/1200x/f2/30/56/f230566bdc1c5e88a7d1a85d648afb02.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-17',
    name: 'Jogo de Pano de Prato',
    description: 'Charme e utilidade pendurados na copa.',
    image: 'https://i.pinimg.com/736x/cb/ac/dc/cbacdcf3f1249f47e2fbdd438a0254b6.jpg',
    category: 'Cozinha',
    maxQuantity: 2
  },
  {
    id: 'cz-18',
    name: 'Formas e Assadeiras',
    description: 'Para bolos, tortas e momentos doces.',
    image: 'https://i.pinimg.com/1200x/98/f5/33/98f533a133cf6e5b79daaa3602c0a9c7.jpg',
    category: 'Cozinha',
    maxQuantity: 2
  },
  {
    id: 'cz-19',
    name: 'Utensílios de Cozinha',
    description: 'Conchas, espátulas e colheres para o dia a dia.',
    image: 'https://i.pinimg.com/736x/4d/b9/d7/4db9d72532a6abb146fb5e6de9ed9a06.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-20',
    name: 'Travessa de Vidro',
    description: 'Transparência para servir com elegância.',
    image: 'https://i.pinimg.com/1200x/b5/e5/96/b5e596ed3722e6f37e5ce9737fcf0b11.jpg',
    category: 'Cozinha',
    maxQuantity: 2
  },
  {
    id: 'cz-21',
    name: 'Chaleira Elétrica',
    description: 'Água quente em segundos para o chá da tarde.',
    image: 'https://i.pinimg.com/736x/cf/ab/e6/cfabe6dea70cd53ba1f2b934276a08c7.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-22',
    name: 'Conjunto de Potes',
    description: 'Organização hermética para a despensa.',
    image: 'https://i.pinimg.com/736x/8e/e7/a7/8ee7a7547134a7a39d26c46eb553ca23.jpg',
    category: 'Cozinha',
    maxQuantity: 3
  },
  {
    id: 'cz-23',
    name: 'Potes de Tempero',
    description: 'O segredo do sabor sempre à mão.',
    image: 'https://i.pinimg.com/1200x/62/d6/f7/62d6f7c75858b0bb4f9317450abba2c5.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-24',
    name: 'Jarras',
    description: 'Para servir refrescos com estilo.',
    image: 'https://i.pinimg.com/736x/74/2e/d3/742ed3416ec6a917c356c781df5877a0.jpg',
    category: 'Cozinha',
    maxQuantity: 2
  },
  {
    id: 'cz-25',
    name: 'Sanduicheira',
    description: 'Lanches rápidos e crocantes.',
    image: 'https://i.pinimg.com/736x/56/de/51/56de511cae71027b937235579945542a.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-26',
    name: 'Grill',
    description: 'Grelhados saudáveis e suculentos.',
    image: 'https://i.pinimg.com/1200x/45/31/e8/4531e8eed9b893bbc58d3d8e49213491.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-27',
    name: 'Batedeira',
    description: 'Para criar bolos fofinhos e memórias.',
    image: 'https://i.pinimg.com/736x/db/ad/07/dbad077788362602e3a3af138f5375b9.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-28',
    name: 'Cafeteira',
    description: 'Aroma de café fresco para começar o dia.',
    image: 'https://i.pinimg.com/1200x/ff/8d/79/ff8d791967926ed4c2cd1a4a9e8d3851.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-29',
    name: 'Panela de Arroz',
    description: 'Arroz soltinho com praticidade total.',
    image: 'https://i.pinimg.com/1200x/f3/5d/f6/f35df6c73729f8d949111406f374eebe.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-30',
    name: 'Fruteira',
    description: 'Cores e saúde decorando a cozinha.',
    image: 'https://i.pinimg.com/1200x/29/95/c9/2995c9caa9955054ca20b8b4479a8cbd.jpg',
    category: 'Cozinha',
  },
  {
    id: 'cz-31',
    name: 'Escorredor de Louça',
    description: 'Organização essencial após as refeições.',
    image: 'https://i.pinimg.com/736x/63/04/47/63044773dc5cbb7b0726ebca201abcc1.jpg',
    category: 'Cozinha',
  }
];