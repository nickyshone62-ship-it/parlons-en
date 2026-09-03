import { Category, Post, Answer } from '@/types';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Relations & Famille',
    slug: 'relations-famille',
    description: 'Conflits, communication, amour, amitié et liens familiaux.',
    icon: 'HeartHandshake',
    color: 'emerald',
    posts_count: 0,
  },
  {
    id: 'cat-2',
    name: 'Travail & Études',
    slug: 'travail-etudes',
    description: 'Pression, reconversion, harcèlement, examens et carrière.',
    icon: 'Briefcase',
    color: 'indigo',
    posts_count: 0,
  },
  {
    id: 'cat-3',
    name: 'Santé Mentale',
    slug: 'sante-mentale',
    description: 'Anxiété, stress, dépression, estime de soi et soutien.',
    icon: 'Brain',
    color: 'teal',
    posts_count: 0,
  },
  {
    id: 'cat-4',
    name: 'Finances & Budget',
    slug: 'finances-budget',
    description: 'Gestion des dettes, imprévus financiers et fins de mois.',
    icon: 'Coins',
    color: 'amber',
    posts_count: 0,
  },
  {
    id: 'cat-5',
    name: 'Isolement & Solitude',
    slug: 'isolement-solitude',
    description: 'Besoin d\'écoute, sentiment de décalage et réinsertion sociale.',
    icon: 'UserX',
    color: 'purple',
    posts_count: 0,
  },
  {
    id: 'cat-6',
    name: 'Orientation de Vie',
    slug: 'orientation-vie',
    description: 'Quête de sens, grands choix de vie et changements majeurs.',
    icon: 'Compass',
    color: 'blue',
    posts_count: 0,
  },
];

export const MOCK_POPULAR_POSTS: Post[] = [];

export const MOCK_RECENT_POSTS: Post[] = [];

export const MOCK_ANSWERS: Answer[] = [];
