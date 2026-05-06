/**
 * Vene-English Academy API Client
 * Centralizado servicio para comunicación con el backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'vene_english_token';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Manejo de errores API
 */
class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
  }
}

/**
 * Obtener token del localStorage
 */
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Guardar token en localStorage
 */
function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Limpiar token del localStorage
 */
function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Verificar si usuario está autenticado
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Hacer petición HTTP
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Agregar token JWT si existe
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parsear respuesta
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Manejar errores HTTP
    if (!response.ok) {
      // Si es 401, limpiar token
      if (response.status === 401) {
        clearToken();
      }

      throw new ApiError(
        response.status,
        data?.detail || data?.message || `HTTP ${response.status}`,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Error de red o parsing
    throw new ApiError(0, 'Network error or invalid response', error);
  }
}

/**
 * ==================== AUTH ====================
 */

export interface UserRegisterData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  current_module_index: number;
  progress: number;
  words_learned: number;
  practice_hours: number;
  streak: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  certificates: CertificateResponse[];
}

export interface CertificateResponse {
  id: string;
  level: string;
  name: string;
  issuer: string;
  date: string;
}

/**
 * Registrar nuevo usuario
 */
export async function register(data: UserRegisterData): Promise<UserResponse> {
  const response = await request<UserResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response;
}

/**
 * Login de usuario
 */
export async function login(data: UserLoginData): Promise<UserResponse> {
  const response = await request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  // Guardar token
  setToken(response.access_token);

  // Obtener datos del usuario
  const user = await getUser();
  return user;
}

/**
 * Logout de usuario
 */
export async function logout(): Promise<void> {
  try {
    await request('/api/user/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

/**
 * ==================== USER ====================
 */

/**
 * Obtener usuario actual
 */
export async function getUser(): Promise<UserResponse> {
  return request<UserResponse>('/api/user');
}

/**
 * Actualizar usuario
 */
export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  avatar?: string;
  level?: string;
}

export async function updateUser(data: UserUpdateData): Promise<UserResponse> {
  return request<UserResponse>('/api/user', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * ==================== CURRICULUM ====================
 */

export interface ModuleResponse {
  id: string;
  level: string;
  title: string;
  description: string;
  week: number;
}

export interface CurriculumResponse {
  level: string;
  title: string;
  description: string;
  modules: ModuleResponse[];
}

/**
 * Obtener currículum por nivel
 */
export async function getCurriculum(level: string): Promise<CurriculumResponse> {
  return request<CurriculumResponse>(`/api/curriculum/${level.toUpperCase()}`);
}

/**
 * Obtener módulos de un nivel
 */
export async function getModulesByLevel(level: string): Promise<ModuleResponse[]> {
  return request<ModuleResponse[]>(`/api/modules/${level.toUpperCase()}`);
}

/**
 * Obtener módulo específico
 */
export async function getModule(moduleId: string): Promise<ModuleResponse> {
  return request<ModuleResponse>(`/api/module/${moduleId}`);
}

/**
 * ==================== PROGRESS ====================
 */

export interface ProgressResponse {
  id: number;
  user_id: number;
  module_id: string;
  progress_percentage: number;
  words_learned_in_module: number;
  is_completed: boolean;
  passed_exam: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ProgressUpdateData {
  progress_percentage?: number;
  words_learned_in_module?: number;
  is_completed?: boolean;
  passed_exam?: boolean;
}

/**
 * Obtener todo progress del usuario
 */
export async function getAllProgress(): Promise<ProgressResponse[]> {
  return request<ProgressResponse[]>('/api/progress');
}

/**
 * Obtener progress de un módulo
 */
export async function getModuleProgress(moduleId: string): Promise<ProgressResponse> {
  return request<ProgressResponse>(`/api/progress/${moduleId}`);
}

/**
 * Actualizar progress de un módulo
 */
export async function updateModuleProgress(
  moduleId: string,
  data: ProgressUpdateData
): Promise<ProgressResponse> {
  return request<ProgressResponse>(`/api/progress/${moduleId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Marcar módulo como completado
 */
export async function completeModule(moduleId: string): Promise<{ message: string }> {
  return request<{ message: string }>('/api/progress/complete-module', {
    method: 'POST',
    body: JSON.stringify({ module_id: moduleId }),
  });
}

/**
 * ==================== CERTIFICATES ====================
 */

/**
 * Obtener certificados del usuario
 */
export async function getCertificates(): Promise<CertificateResponse[]> {
  return request<CertificateResponse[]>('/api/certificates');
}

/**
 * Crear certificado (después de pasar examen)
 */
export async function createCertificate(level: string): Promise<CertificateResponse> {
  return request<CertificateResponse>('/api/certificates', {
    method: 'POST',
    body: JSON.stringify({ level: level.toUpperCase() }),
  });
}

/**
 * ==================== ERROR HANDLER ====================
 */

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    // Errores específicos
    if (error.status === 401) {
      return 'Sesión expirada. Por favor inicia sesión nuevamente.';
    }
    if (error.status === 400) {
      return error.data?.detail || error.message || 'Datos inválidos';
    }
    if (error.status === 404) {
      return 'Recurso no encontrado';
    }
    if (error.status === 500) {
      return 'Error en el servidor. Intenta más tarde.';
    }
    return error.message || 'Error desconocido';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}

export default {
  // Auth
  register,
  login,
  logout,
  isAuthenticated,
  getToken,
  clearToken,

  // User
  getUser,
  updateUser,

  // Curriculum
  getCurriculum,
  getModulesByLevel,
  getModule,

  // Progress
  getAllProgress,
  getModuleProgress,
  updateModuleProgress,
  completeModule,

  // Certificates
  getCertificates,
  createCertificate,

  // Error
  handleApiError,
};
