// API Types based on Swagger documentation

export interface CallOrder {
  id?: number;
  name_uz: string;
  name_ru: string;
  phone: string;
  created_at?: string;
}

export interface CallOrderLanguage {
  id: number;
  name: string;
  name_uz: string;
  name_ru: string;
  phone: string;
  created_at: string;
}

export interface Doctor {
  id?: number;
  full_name_uz: string;
  specialty_uz: string;
  description_uz: string;
  full_name_ru: string;
  specialty_ru: string;
  description_ru: string;
  experience: number;
  image?: string;
}

export interface DoctorLanguage {
  id: number;
  full_name: string;
  full_name_uz: string;
  full_name_ru: string;
  specialty: string;
  specialty_uz: string;
  specialty_ru: string;
  description: string;
  description_uz: string;
  description_ru: string;
  experience: number;
  image?: string;
}

export interface News {
  id?: number;
  title_uz: string;
  title_ru: string;
  content_uz: string;
  content_ru: string;
  image?: string;
  created_at?: string;
  is_published?: boolean;
}

export interface NewsLanguage {
  id: number;
  title: string;
  title_uz: string;
  title_ru: string;
  content: string;
  content_uz: string;
  content_ru: string;
  image?: string;
  created_at: string;
  is_published: boolean;
}

export interface Vakansiya {
  id?: number;
  title_uz: string;
  title_ru: string;
  description_uz: string;
  description_ru: string;
  requirements_uz: string;
  requirements_ru: string;
  salary?: string; // backward compatibility
  expiring_date?: string; // ISO date (YYYY-MM-DD)
  category?: number; // FK id
  working_type?: number; // legacy naming in some UIs
  work_type?: number; // FK id expected by backend
  is_active?: boolean;
  created_at?: string;
}

export interface VakansiyaLanguage {
  id: number;
  title: string;
  title_uz: string;
  title_ru: string;
  description: string;
  description_uz: string;
  description_ru: string;
  requirements: string;
  requirements_uz: string;
  requirements_ru: string;
  is_active: boolean;
  created_at: string;
}

export interface VakansiyaArizasi {
  id?: number;
  full_name_uz: string;
  full_name_ru: string;
  diplom_id: string;
  phone: string;
  email: string;
  cover_letter_uz: string;
  cover_letter_ru: string;
  status?: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  created_at?: string;
  vakansiya: number;
}

export interface VakansiyaArizasiLanguage {
  id: number;
  vakansiya: number;
  vakansiya_title: string;
  full_name: string;
  full_name_uz: string;
  full_name_ru: string;
  diplom_id: string;
  phone: string;
  email: string;
  cover_letter: string;
  cover_letter_uz: string;
  cover_letter_ru: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface HomeData {
  doctors: DoctorLanguage[];
  news: NewsLanguage[];
  vacancies: VakansiyaLanguage[];
  call_orders: CallOrderLanguage[];
}

export type Language = 'uz' | 'ru';

// API Response types for authentication
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email?: string;
  };
}

export interface AboutUs {
  id?: number;
  content_uz: string;
  content_ru: string;
  created_at?: string;
  updated_at?: string;
}

export interface AboutUsLanguage {
  id: number;
  content: string;
  content_uz: string;
  content_ru: string;
  created_at: string;
  updated_at: string;
}

// Category
export interface Category {
  id?: number;
  name_uz: string;
  name_ru: string;
  created_at?: string;
}

export interface CategoryLanguage {
  id: number;
  name: string;
  name_uz: string;
  name_ru: string;
  created_at?: string;
}

// Work Type
export interface WorkType {
  id?: number;
  name_uz: string;
  name_ru: string;
  created_at?: string;
}

export interface WorkTypeLanguage {
  id: number;
  name: string;
  name_uz: string;
  name_ru: string;
  created_at?: string;
}

// Service Price
export interface ServicePrice {
  id?: number;
  name_uz: string;
  name_ru: string;
  description_uz?: string;
  description_ru?: string;
  price: number;
  doctor?: number; // FK to Doctor
  is_active?: boolean;
  created_at?: string;
}

export interface ServicePriceLanguage {
  id: number;
  name: string;
  name_uz: string;
  name_ru: string;
  description?: string;
  description_uz?: string;
  description_ru?: string;
  price: number;
  doctor?: number;
  is_active: boolean;
  created_at: string;
}
