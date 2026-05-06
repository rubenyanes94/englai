# 🔗 GUÍA: Conectar Frontend con Backend

## ⚡ Resumen Rápido

Tu backend está **100% funcional** en `http://localhost:8000`

Todos los endpoints están listos para consumir desde React:
- ✅ Autenticación (Register, Login)
- ✅ Gestión de usuario
- ✅ Currículum completo
- ✅ Progreso de estudiante
- ✅ Certificaciones

---

## 🚀 Pasos para Conectar Frontend

### 1. Crear archivo de configuración de API

**Archivo**: `src/utils/api.ts`

```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('access_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}
```

### 2. Actualizar componente Auth.tsx

Cambiar de autenticación local a API:

```typescript
// ANTES: localStorage solo
// DESPUÉS: API + localStorage

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!canSubmit()) return;
  
  try {
    setLoading(true);
    
    if (mode === 'register') {
      // Call backend register
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password: formData.password,
          confirm_password: formData.confirmPassword,
        }),
      });
      
      // Save token
      const loginResponse = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      
      localStorage.setItem('access_token', loginResponse.access_token);
    } else {
      // Call backend login
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      
      localStorage.setItem('access_token', response.access_token);
    }
    
    onSuccess({ name: formData.firstName });
  } catch (error) {
    alert('Error: ' + error.message);
  } finally {
    setLoading(false);
  }
};
```

### 3. Actualizar App.tsx

Reemplazar `localStorage` con API:

```typescript
// En lugar de: localStorage.getItem('vene_english_user_data')
// Usar: GET /api/user

useEffect(() => {
  // Intentar obtener usuario desde API si hay token
  const token = localStorage.getItem('access_token');
  if (token) {
    fetchUser();
  }
}, []);

async function fetchUser() {
  try {
    const user = await apiFetch('/api/user');
    setUser(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    localStorage.removeItem('access_token');
  }
}

// Cuando actualices usuario:
const handleUpdateUser = async (updatedFields: Partial<User>) => {
  try {
    const updated = await apiFetch('/api/user', {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    setUser(updated);
  } catch (error) {
    console.error('Error updating user:', error);
  }
};
```

### 4. Actualizar componentes que usen API

#### Dashboard.tsx - Obtener currículum

```typescript
useEffect(() => {
  async function loadModules() {
    try {
      const curriculum = await apiFetch(`/api/curriculum/${user.level}`);
      // Usar curriculum.modules
    } catch (error) {
      console.error('Error loading curriculum:', error);
    }
  }
  loadModules();
}, [user.level]);
```

#### Classroom.tsx - Actualizar progreso

```typescript
const updateProgress = async (progress: number, wordsLearned: number) => {
  try {
    await apiFetch(`/api/progress/${currentModuleId}`, {
      method: 'PUT',
      body: JSON.stringify({
        progress_percentage: progress,
        words_learned_in_module: wordsLearned,
      }),
    });
  } catch (error) {
    console.error('Error updating progress:', error);
  }
};

const completeModule = async () => {
  try {
    await apiFetch('/api/progress/complete-module', {
      method: 'POST',
      body: JSON.stringify({ module_id: currentModuleId }),
    });
    // Trigger módulo completado
    onCompleteModule();
  } catch (error) {
    console.error('Error completing module:', error);
  }
};
```

#### Profile.tsx - Obtener certificaciones

```typescript
useEffect(() => {
  async function loadCertificates() {
    try {
      const certs = await apiFetch('/api/certificates');
      // Mostrar certificaciones
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  }
  loadCertificates();
}, []);

const createCertificate = async (level: string) => {
  try {
    const cert = await apiFetch('/api/certificates', {
      method: 'POST',
      body: JSON.stringify({ level }),
    });
    // Mostrar certificado creado
  } catch (error) {
    console.error('Error creating certificate:', error);
  }
};
```

---

## 🔌 Endpoints Disponibles

### Autenticación
```
POST /auth/register
POST /auth/login
POST /api/user/logout
```

### Usuario
```
GET  /api/user
PUT  /api/user
GET  /api/certificates
POST /api/certificates
```

### Currículum
```
GET /api/curriculum/{level}        # A1-C2
GET /api/modules/{level}           # Array de módulos
GET /api/module/{module_id}        # Módulo específico
```

### Progreso
```
GET    /api/progress                # Todo progreso del usuario
GET    /api/progress/{module_id}    # Progreso de módulo
PUT    /api/progress/{module_id}    # Actualizar progreso
POST   /api/progress/complete-module # Marcar completado
```

---

## 📝 Variables de Entorno

**Frontend (.env)**:
```
REACT_APP_API_URL=http://localhost:8000
```

---

## 🔒 Manejo de Tokens

El token JWT se almacena en localStorage:
```typescript
// Guardar
localStorage.setItem('access_token', token);

// Usar en requests (manejado por apiFetch)
headers['Authorization'] = `Bearer ${token}`;

// Limpiar en logout
localStorage.removeItem('access_token');
```

---

## 📊 Flujo de Autenticación

```
1. Usuario entra en Landing
2. Click "Comenzar" → Auth component
3. Ingresa email/password
4. Frontend POST /auth/register o /auth/login
5. Backend retorna JWT token
6. Frontend guarda token en localStorage
7. Frontend obtiene datos del usuario con GET /api/user
8. Redirect a Dashboard
```

---

## 🧪 Testing desde Frontend

```typescript
// En React DevTools Console:
fetch('http://localhost:8000/api/user', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
}).then(r => r.json()).then(d => console.log(d))
```

---

## ⚠️ Consideraciones

1. **CORS**: Backend tiene CORS configurado para `http://localhost:5173`
2. **Tokens**: Expiran en 30 minutos (configurable en .env)
3. **Errores**: Maneja 401 Unauthorized en frontend (token expirado)
4. **Refresh**: Para produccción, implementar refresh tokens

---

## 🚀 Próximos Pasos

1. Integrar endpoints en componentes React
2. Implementar manejo de errores
3. Agregar loading states
4. Testing E2E (Cypress)
5. Deploy a producción

---

**Backend URL**: http://localhost:8000  
**Swagger Docs**: http://localhost:8000/docs  
**ReDoc**: http://localhost:8000/redoc
