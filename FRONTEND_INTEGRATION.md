# 🔗 Guía de Integración Frontend-Backend paso a paso

## Parte 1: Setup y Configuración ✅

### 1.1 Cliente API Centralizado (`src/api/client.ts`)

**Función**: Centralizar todas las llamadas al backend y manejo de tokens JWT

**Características**:
- ✅ Token JWT almacenado en localStorage con clave `vene_english_token`
- ✅ Inyección automática de token en headers (`Authorization: Bearer {token}`)
- ✅ Manejo de errores unificado
- ✅ Auto-logout si 401 (sesión expirada)
- ✅ Tipado TypeScript completo

**Endpoints implementados**:
```typescript
// Auth
register(data: UserRegisterData): Promise<UserResponse>
login(data: UserLoginData): Promise<UserResponse>
logout(): Promise<void>

// User
getUser(): Promise<UserResponse>
updateUser(data: UserUpdateData): Promise<UserResponse>
getCertificates(): Promise<CertificateResponse[]>

// Curriculum
getCurriculum(level: string): Promise<CurriculumResponse>
getModulesByLevel(level: string): Promise<ModuleResponse[]>
getModule(moduleId: string): Promise<ModuleResponse>

// Progress
getAllProgress(): Promise<ProgressResponse[]>
getModuleProgress(moduleId: string): Promise<ProgressResponse>
updateModuleProgress(moduleId: string, data: ProgressUpdateData): Promise<ProgressResponse>
completeModule(moduleId: string): Promise<{ message: string }>

// Certificates
createCertificate(level: string): Promise<CertificateResponse>

// Utils
isAuthenticated(): boolean
getToken(): string | null
clearToken(): void
handleApiError(error: unknown): string
```

### 1.2 Variables de Entorno (`.env`)

```env
VITE_API_URL=http://localhost:8000
```

**Producción**: Cambiar a URL del servidor remoto

---

## Parte 2: Componentes Integrados ✅

### 2.1 Auth Component (`src/components/Auth.tsx`)

**Cambios realizados**:

```typescript
// ANTES: setTimeout simulado
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    onSuccess({ name: formData.firstName });
  }, 1500);
};

// AHORA: Llamada real a API
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  
  try {
    if (mode === 'login') {
      const user = await apiClient.login({
        email: formData.email,
        password: formData.password
      });
      onSuccess({ name: user.first_name });
    } else {
      const user = await apiClient.register({
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        confirm_password: formData.confirmPassword
      });
      await apiClient.login({
        email: formData.email,
        password: formData.password
      });
      onSuccess({ name: user.first_name });
    }
  } catch (err) {
    setError(handleApiError(err));
    setLoading(false);
  }
};
```

**Flujo**:
1. Usuario ingresa email y contraseña
2. Clic en "Entrar" o "Registrarse"
3. Llamada a `/auth/login` o `/auth/register`
4. Token JWT se guarda automáticamente
5. Se ejecuta `onSuccess()` → App navega a siguiente vista

### 2.2 App Component (`src/App.tsx`)

**Cambios realizados**:

```typescript
const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  // Al montar, cargar usuario desde API si hay token
  useEffect(() => {
    const loadUserFromApi = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const userData = await apiClient.getUser();
          
          // Mapear datos de API a formato local
          const mappedUser: User = {
            name: `${userData.first_name} ${userData.last_name}`,
            avatar: userData.avatar,
            level: userData.level as CEFRLevel,
            currentModuleIndex: userData.current_module_index,
            progress: userData.progress,
            wordsLearned: userData.words_learned,
            practiceHours: userData.practice_hours,
            streak: userData.streak,
            earnedCertificates: userData.certificates.map(cert => ({
              id: cert.id,
              level: cert.level as CEFRLevel,
              name: cert.name,
              date: cert.date,
              issuer: cert.issuer
            }))
          };
          
          setUser(mappedUser);
          setView('dashboard');
        } catch (error) {
          console.error('Error loading user:', handleApiError(error));
          setView('landing');
        }
      }
      setLoading(false);
    };
    
    loadUserFromApi();
  }, []);
};
```

**Características**:
- ✅ Auto-cargar usuario desde BD si token válido
- ✅ Navegar automáticamente a dashboard si ya está autenticado
- ✅ Volver a landing si error o token inválido
- ✅ Mapeo de datos API → UI

### 2.3 Logout Actualizado

```typescript
const handleLogout = async () => {
  try {
    await apiClient.logout();  // Llamar endpoint /api/user/logout
  } catch (error) {
    console.error('Error during logout:', handleApiError(error));
    apiClient.clearToken();   // Limpiar incluso si hay error
  }
  
  localStorage.removeItem(STORAGE_KEY);
  setUser(INITIAL_USER_STATE);
  navigate('landing');
};
```

---

## Parte 3: Próximos Componentes (Próximas Sesiones)

### 3.1 Dashboard Component

**Pendiente**: Actualizar avatar dinámico basado en `user.avatar`

```typescript
// CAMBIO: Usar avatar del usuario en lugar de URL fija
<img 
  alt="Profile" 
  className="relative w-14 h-14 rounded-full border-2 border-white object-cover shadow-sm" 
  src={user.avatar || `https://picsum.photos/seed/${user.name}/100/100`}
/>
```

### 3.2 Classroom Component

**Pendiente**: Sync de progreso con API

```typescript
// Al completar ejercicio:
await apiClient.updateModuleProgress(moduleId, {
  progress_percentage: 50,
  words_learned_in_module: 20
});

// Al completar módulo:
await apiClient.completeModule(moduleId);
```

### 3.3 Profile Component

**Pendiente**: Actualizar perfil del usuario

```typescript
// Al editar nombre o avatar:
await apiClient.updateUser({
  first_name: editName.split(' ')[0],
  last_name: editName.split(' ')[1],
  avatar: editAvatar
});

// Cargar certificados:
const certs = await apiClient.getCertificates();
```

---

## 🧪 Testing Manual

### Test 1: Registro

```bash
# Ir a Landing → Auth → Registrarse
# Llenar:
- Email: test@example.com
- Nombre: Juan
- Apellido: Pérez
- Password: Aa123456
- Método de pago: Cualquiera
# Clic "Iniciar 5 Días Gratis"

# Esperado:
✅ Token guarda en localStorage (F12 → Application)
✅ Navega a Dashboard
✅ Muestra nombre "Juan Pérez"
```

### Test 2: Login

```bash
# Salir → Landing → Auth → Entrar
# Llenar:
- Email: test@example.com
- Password: Aa123456
# Clic "Entrar ahora"

# Esperado:
✅ Navega a Dashboard
✅ Carga datos del usuario desde BD
```

### Test 3: Persistencia

```bash
# Hacer login → Cerrar navegador → Abrir
# Esperado:
✅ Carga automáticamente usuario desde BD
✅ Ve Dashboard sin llamada manual a login
```

### Test 4: Logout

```bash
# En Dashboard → Profile (Navigation) → Logout
# Esperado:
✅ Limpia token de localStorage
✅ Navega a Landing
✅ Siguiente acceso requiere login
```

---

## 📊 Tabla de Sincronización

| Componente | Estado | Acción | Endpoint |
|-----------|--------|--------|----------|
| Auth | ✅ | Register/Login | POST `/auth/register`, `/auth/login` |
| App | ✅ | Load user | GET `/api/user` |
| App | ✅ | Logout | POST `/api/user/logout` |
| Dashboard | ⏳ | Load stats | GET `/api/user` |
| Classroom | ⏳ | Update progress | PUT `/api/progress/{moduleId}` |
| Profile | ⏳ | Update user | PUT `/api/user` |
| Profile | ⏳ | Load certs | GET `/api/certificates` |

---

## 🔐 Seguridad

✅ **Contraseñas**: Cifradas con bcrypt en backend
✅ **Tokens**: JWT de 30 minutos de expiración
✅ **Storage**: Token solo en localStorage (HTTPS en producción)
✅ **API**: CORS habilitado solo para frontend
✅ **Errores**: Mensajes genéricos al usuario

---

## 🚀 Próximos Pasos

1. **Completar integración de Classroom** - Sync de progreso
2. **Completar integración de Profile** - Actualizaciones de usuario
3. **Testing E2E completo** - Flujo completo usuario
4. **Despliegue a producción** - Railway/Render con BD PostgreSQL

---

## 📝 Notas Importantes

- Token expira automáticamente en 30 minutos
- 401 Unauthorized → Se limpia token automáticamente
- Errores de red → Mostrar mensaje al usuario
- Siempre usar `apiClient` en lugar de `fetch` directo
- Mantener tipos TypeScript actualizados si cambia API

