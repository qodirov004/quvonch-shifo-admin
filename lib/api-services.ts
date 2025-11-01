import { apiGet, apiPost, apiPut, apiPatch, apiCall } from './api-client';
import type {
  CallOrder,
  CallOrderLanguage,
  Doctor,
  DoctorLanguage,
  News,
  NewsLanguage,
  Vakansiya,
  VakansiyaLanguage,
  VakansiyaArizasi,
  VakansiyaArizasiLanguage,
  PaginatedResponse,
  HomeData,
  Language,
  LoginRequest,
  LoginResponse,
  AboutUs,
  AboutUsLanguage,
  Category,
  CategoryLanguage,
  WorkType,
  WorkTypeLanguage
} from './types';

// API Base URL
const API_BASE = 'https://api.greentraver.uz';

// Call Orders API
export const callOrdersApi = {
  // Get all call orders with pagination and search
  getAll: async (params?: {
    search?: string;
    ordering?: string;
    page?: number;
    lang?: Language;
  }): Promise<PaginatedResponse<CallOrderLanguage>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.ordering) searchParams.append('ordering', params.ordering);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.lang) searchParams.append('lang', params.lang);
    
    const query = searchParams.toString();
    return apiGet(`/call-orders/${query ? `?${query}` : ''}`);
  },

  // Get single call order
  getById: async (id: number): Promise<CallOrderLanguage> => {
    return apiGet(`/call-orders/${id}/`);
  },

  // Create new call order
  create: async (data: CallOrder): Promise<CallOrder> => {
    return apiPost('/call-orders/', data);
  },

  // Update call order
  update: async (id: number, data: CallOrder): Promise<CallOrder> => {
    const response = await apiCall(`/call-orders/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  // Partial update call order
  partialUpdate: async (id: number, data: Partial<CallOrder>): Promise<CallOrder> => {
    const response = await apiCall(`/call-orders/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  // Delete call order
  delete: async (id: number): Promise<void> => {
    const response = await apiCall(`/call-orders/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
  },
};

// Doctors API
export const doctorsApi = {
  // Get all doctors with pagination and search
  getAll: async (params?: {
    search?: string;
    ordering?: string;
    page?: number;
    lang?: Language;
  }): Promise<PaginatedResponse<DoctorLanguage>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.ordering) searchParams.append('ordering', params.ordering);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.lang) searchParams.append('lang', params.lang);
    
    const query = searchParams.toString();
    return apiGet(`/doctors/${query ? `?${query}` : ''}`);
  },

  // Get single doctor
  getById: async (id: number): Promise<DoctorLanguage> => {
    return apiGet(`/doctors/${id}/`);
  },

  // Create new doctor
  create: async (data: Doctor): Promise<Doctor> => {
    return apiPost('/doctors/', data);
  },

  // Create new doctor with image
  createWithImage: async (formData: FormData): Promise<Doctor> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    
    const response = await fetch(`${API_BASE}/doctors/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },

  // Update doctor
  update: async (id: number, data: Doctor): Promise<Doctor> => {
    const response = await apiCall(`/doctors/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  // Update doctor with image
  updateWithImage: async (id: number, formData: FormData): Promise<Doctor> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    
    const response = await fetch(`${API_BASE}/doctors/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },

  // Partial update doctor
  partialUpdate: async (id: number, data: Partial<Doctor>): Promise<Doctor> => {
    const response = await apiCall(`/doctors/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  // Delete doctor
  delete: async (id: number): Promise<void> => {
    const response = await apiCall(`/doctors/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
  },
};

// News API
export const newsApi = {
  // Get all news with pagination and search
  getAll: async (params?: {
    search?: string;
    ordering?: string;
    page?: number;
    lang?: Language;
  }): Promise<PaginatedResponse<NewsLanguage>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.ordering) searchParams.append('ordering', params.ordering);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.lang) searchParams.append('lang', params.lang);
    
    const query = searchParams.toString();
    return apiGet(`/news/${query ? `?${query}` : ''}`);
  },

  // Get single news
  getById: async (id: number): Promise<NewsLanguage> => {
    return apiGet(`/news/${id}/`);
  },

  // Create new news
  create: async (data: News): Promise<News> => {
    return apiPost('/news/', data);
  },

  // Create new news with image
  createWithImage: async (formData: FormData): Promise<News> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    
    const response = await fetch(`${API_BASE}/news/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },

  // Update news
  update: async (id: number, data: News): Promise<News> => {
    const response = await apiCall(`/news/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  // Update news with image
  updateWithImage: async (id: number, formData: FormData): Promise<News> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    
    const response = await fetch(`${API_BASE}/news/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },

  // Partial update news
  partialUpdate: async (id: number, data: Partial<News>): Promise<News> => {
    const response = await apiCall(`/news/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  // Delete news
  delete: async (id: number): Promise<void> => {
    const response = await apiCall(`/news/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
  },
};

// Vacancies API
export const vacanciesApi = {
  // Get all vacancies with pagination and search
  getAll: async (params?: {
    search?: string;
    ordering?: string;
    page?: number;
    lang?: Language;
  }): Promise<PaginatedResponse<VakansiyaLanguage>> => {
    const buildQuery = (includeLang: boolean) => {
      const sp = new URLSearchParams();
      if (params?.search) sp.append('search', params.search);
      if (params?.ordering) sp.append('ordering', params.ordering);
      if (params?.page) sp.append('page', params.page.toString());
      if (includeLang && params?.lang) sp.append('lang', params.lang);
      return sp.toString();
    };

    // Try primary endpoint with lang
    try {
      const query = buildQuery(true);
      return await apiGet(`/vakansiyalar/${query ? `?${query}` : ''}`);
    } catch (e1) {
      // Retry without lang param
      try {
        const queryNoLang = buildQuery(false);
        return await apiGet(`/vakansiyalar/${queryNoLang ? `?${queryNoLang}` : ''}`);
      } catch (e2) {
        // Try alternative endpoints (possible backend naming variants)
        const queryFallback = buildQuery(false);
        try {
          return await apiGet(`/vacancies/${queryFallback ? `?${queryFallback}` : ''}`);
        } catch (e3) {
          try {
            return await apiGet(`/vakansiya/${queryFallback ? `?${queryFallback}` : ''}`);
          } catch (e4) {
            // All endpoints failed, return empty result
            return {
              count: 0,
              next: undefined,
              previous: undefined,
              results: [],
            } as PaginatedResponse<VakansiyaLanguage>;
          }
        }
      }
    }
  },

  // Get single vacancy
  getById: async (id: number): Promise<VakansiyaLanguage> => {
    return apiGet(`/vakansiyalar/${id}/`);
  },

  // Create new vacancy
  create: async (data: Vakansiya): Promise<Vakansiya> => {
    return apiPost('/vakansiyalar/', data);
  },

  // Update vacancy
  update: async (id: number, data: Vakansiya): Promise<Vakansiya> => {
    const response = await apiCall(`/vakansiyalar/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  // Partial update vacancy
  partialUpdate: async (id: number, data: Partial<Vakansiya>): Promise<Vakansiya> => {
    console.log(`PATCH /vakansiyalar/${id}/ with data:`, data);
    const response = await apiCall(`/vakansiyalar/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    console.log(`PATCH response status: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status}`, errorText);
      throw new Error(`API error: ${response.status}`);
    }
    const result = await response.json();
    console.log('PATCH response data:', result);
    return result;
  },

  // Delete vacancy
  delete: async (id: number): Promise<void> => {
    const response = await apiCall(`/vakansiyalar/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
  },
};

// Job Applications API
export const jobApplicationsApi = {
  // Get all job applications with pagination and search
  getAll: async (params?: {
    search?: string;
    ordering?: string;
    page?: number;
    lang?: Language;
  }): Promise<PaginatedResponse<VakansiyaArizasiLanguage>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.ordering) searchParams.append('ordering', params.ordering);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.lang) searchParams.append('lang', params.lang);
    
    const query = searchParams.toString();
    return apiGet(`/vakansiya-arizalari/${query ? `?${query}` : ''}`);
  },

  // Get single job application
  getById: async (id: number): Promise<VakansiyaArizasiLanguage> => {
    return apiGet(`/vakansiya-arizalari/${id}/`);
  },

  // Create new job application
  create: async (data: VakansiyaArizasi): Promise<VakansiyaArizasi> => {
    return apiPost('/vakansiya-arizalari/', data);
  },

  // Update job application
  update: async (id: number, data: VakansiyaArizasi): Promise<VakansiyaArizasi> => {
    const response = await apiCall(`/vakansiya-arizalari/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  // Partial update job application
  partialUpdate: async (id: number, data: Partial<VakansiyaArizasi>): Promise<VakansiyaArizasi> => {
    const response = await apiCall(`/vakansiya-arizalari/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  // Delete job application
  delete: async (id: number): Promise<void> => {
    const response = await apiCall(`/vakansiya-arizalari/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
  },
};

// About Us API (Singleton - only one instance)
export const aboutUsApi = {
  // Get about us data
  get: async (lang: Language = 'uz'): Promise<AboutUsLanguage> => {
    return apiGet(`/aboutus/`);
  },

  // Create about us data (POST to /aboutus/)
  create: async (data: AboutUs): Promise<AboutUs> => {
    const payload: any = {
      description_uz: (data as any).content_uz ?? (data as any).description_uz ?? '',
      description_ru: (data as any).content_ru ?? (data as any).description_ru ?? '',
    };
    return apiPost('/aboutus/', payload);
  },

  // Update about us data (PUT to /aboutus/{id}/)
  update: async (id: number, data: AboutUs): Promise<AboutUs> => {
    const payload: any = {
      description_uz: (data as any).content_uz ?? (data as any).description_uz ?? '',
      description_ru: (data as any).content_ru ?? (data as any).description_ru ?? '',
    };
    return apiPut(`/aboutus/${id}/`, payload);
  },

  // Partial update about us data (PATCH to /aboutus/{id}/)
  partialUpdate: async (id: number, data: Partial<AboutUs>): Promise<AboutUs> => {
    const payload: any = {
      ...(typeof (data as any).content_uz !== 'undefined' ? { description_uz: (data as any).content_uz } : {}),
      ...(typeof (data as any).content_ru !== 'undefined' ? { description_ru: (data as any).content_ru } : {}),
      ...(typeof (data as any).description_uz !== 'undefined' ? { description_uz: (data as any).description_uz } : {}),
      ...(typeof (data as any).description_ru !== 'undefined' ? { description_ru: (data as any).description_ru } : {}),
    };
    return apiPatch(`/aboutus/${id}/`, payload);
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (params?: {
    search?: string;
    ordering?: string;
    page?: number;
    lang?: Language;
  }): Promise<PaginatedResponse<CategoryLanguage>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.ordering) searchParams.append('ordering', params.ordering);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.lang) searchParams.append('lang', params.lang);

    const query = searchParams.toString();
    try {
      return await apiGet(`/categories/${query ? `?${query}` : ''}`);
    } catch (e) {
      return apiGet(`/category/${query ? `?${query}` : ''}`);
    }
  },

  getById: async (id: number): Promise<CategoryLanguage> => {
    try {
      return await apiGet(`/categories/${id}/`);
    } catch (e) {
      return apiGet(`/category/${id}/`);
    }
  },

  create: async (data: Category): Promise<Category> => {
    try {
      return await apiPost('/categories/', data);
    } catch (e) {
      return apiPost('/category/', data);
    }
  },

  update: async (id: number, data: Category): Promise<Category> => {
    let response = await apiCall(`/categories/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok && response.status === 404) {
      response = await apiCall(`/category/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  partialUpdate: async (id: number, data: Partial<Category>): Promise<Category> => {
    let response = await apiCall(`/categories/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok && response.status === 404) {
      response = await apiCall(`/category/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    }
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    let response = await apiCall(`/categories/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status === 404) {
      response = await apiCall(`/category/${id}/`, {
        method: 'DELETE',
      });
    }
    if (!response.ok) throw new Error(`API error: ${response.status}`);
  },
};

// Work Types API
export const workTypesApi = {
  getAll: async (params?: {
    search?: string;
    ordering?: string;
    page?: number;
    lang?: Language;
  }): Promise<PaginatedResponse<WorkTypeLanguage>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.ordering) searchParams.append('ordering', params.ordering);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.lang) searchParams.append('lang', params.lang);

    const query = searchParams.toString();
    try {
      return await apiGet(`/work-types/${query ? `?${query}` : ''}`);
    } catch (e) {
      try {
        return await apiGet(`/worktypes/${query ? `?${query}` : ''}`);
      } catch (e2) {
        return apiGet(`/worktype/${query ? `?${query}` : ''}`);
      }
    }
  },

  getById: async (id: number): Promise<WorkTypeLanguage> => {
    try {
      return await apiGet(`/work-types/${id}/`);
    } catch (e) {
      try {
        return await apiGet(`/worktypes/${id}/`);
      } catch (e2) {
        return apiGet(`/worktype/${id}/`);
      }
    }
  },

  create: async (data: WorkType): Promise<WorkType> => {
    try {
      return await apiPost('/work-types/', data);
    } catch (e) {
      try {
        return await apiPost('/worktypes/', data);
      } catch (e2) {
        return apiPost('/worktype/', data);
      }
    }
  },

  update: async (id: number, data: WorkType): Promise<WorkType> => {
    let response = await apiCall(`/work-types/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok && response.status === 404) {
      response = await apiCall(`/worktypes/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
    if (!response.ok && response.status === 404) {
      response = await apiCall(`/worktype/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  partialUpdate: async (id: number, data: Partial<WorkType>): Promise<WorkType> => {
    let response = await apiCall(`/work-types/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok && response.status === 404) {
      response = await apiCall(`/worktypes/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    }
    if (!response.ok && response.status === 404) {
      response = await apiCall(`/worktype/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    }
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    let response = await apiCall(`/work-types/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status === 404) {
      response = await apiCall(`/worktypes/${id}/`, {
        method: 'DELETE',
      });
    }
    if (!response.ok && response.status === 404) {
      response = await apiCall(`/worktype/${id}/`, {
        method: 'DELETE',
      });
    }
    if (!response.ok) throw new Error(`API error: ${response.status}`);
  },
};
// Home/Overview API
export const homeApi = {
  // Get all home data
  getHomeData: async (lang: Language = 'uz'): Promise<HomeData> => {
    return apiGet(`/home/?lang=${lang}`);
  },

  // Get data for specific language
  getLanguageData: async (language: Language): Promise<any> => {
    return apiGet(`/language/${language}/`);
  },
};

// Authentication API
export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
    
    return response.json();
  },

  // Logout (clear local storage)
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('adminToken');
  },

  // Get current user
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Combined API object for easy imports
export const api = {
  auth: authApi,
  callOrders: callOrdersApi,
  doctors: doctorsApi,
  news: newsApi,
  vacancies: vacanciesApi,
  jobApplications: jobApplicationsApi,
  home: homeApi,
  aboutUs: aboutUsApi,
  categories: categoriesApi,
  workTypes: workTypesApi,
};
