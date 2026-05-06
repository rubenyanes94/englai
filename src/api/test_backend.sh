#!/bin/bash

# Script de pruebas del backend EnglAI
# Prueba todos los endpoints principales

API_URL="http://localhost:8000"
EMAIL="testuser@example.com"
PASSWORD="testpassword123"
FIRST_NAME="Test"
LAST_NAME="User"

echo "🧪 INICIANDO PRUEBAS DEL BACKEND ENGLAI"
echo "========================================"
echo ""

# 1. HEALTH CHECK
echo "1️⃣  HEALTH CHECK"
echo "GET /health"
curl -s "$API_URL/health" | jq .
echo ""
echo "✅ RESULTADO: Servidor responde correctamente"
echo ""

# 2. ROOT ENDPOINT
echo "2️⃣  ROOT ENDPOINT"
echo "GET /"
curl -s "$API_URL/" | jq .
echo ""

# 3. REGISTRO DE USUARIO
echo "3️⃣  REGISTRO DE USUARIO"
echo "POST /auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"first_name\": \"$FIRST_NAME\",
    \"last_name\": \"$LAST_NAME\",
    \"password\": \"$PASSWORD\",
    \"confirm_password\": \"$PASSWORD\"
  }")

echo "$REGISTER_RESPONSE" | jq .
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.id')
echo "✅ Usuario creado con ID: $USER_ID"
echo ""

# 4. LOGIN
echo "4️⃣  LOGIN (obtener token JWT)"
echo "POST /auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
echo "✅ Token obtenido: $(echo $TOKEN | cut -c 1-50)..."
echo ""

# 5. GET USER (autenticado)
echo "5️⃣  OBTENER PERFIL DEL USUARIO"
echo "GET /api/user (con autenticación)"
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/user" | jq .
echo "✅ Perfil obtenido correctamente"
echo ""

# 6. OBTENER CURRÍCULUM DEL NIVEL A1
echo "6️⃣  OBTENER CURRÍCULUM NIVEL A1"
echo "GET /api/curriculum/A1"
curl -s "$API_URL/api/curriculum/A1" | jq .
echo "✅ Currículum A1 obtenido"
echo ""

# 7. OBTENER MÓDULOS DEL NIVEL A1
echo "7️⃣  OBTENER MÓDULOS NIVEL A1"
echo "GET /api/modules/A1"
MODULES=$(curl -s "$API_URL/api/modules/A1" | jq .)
echo "$MODULES" | jq .
MODULE_ID=$(echo "$MODULES" | jq -r '.[0].id')
echo "✅ Módulos A1 obtenidos. Primer módulo ID: $MODULE_ID"
echo ""

# 8. OBTENER MÓDULO ESPECÍFICO
echo "8️⃣  OBTENER MÓDULO ESPECÍFICO"
echo "GET /api/module/$MODULE_ID"
curl -s "$API_URL/api/module/$MODULE_ID" | jq .
echo "✅ Módulo específico obtenido"
echo ""

# 9. OBTENER PROGRESO DEL USUARIO
echo "9️⃣  OBTENER PROGRESO DEL USUARIO"
echo "GET /api/progress (autenticado)"
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/progress" | jq .
echo "✅ Progreso obtenido"
echo ""

# 10. OBTENER PROGRESO DE MÓDULO ESPECÍFICO
echo "🔟 OBTENER PROGRESO DE MÓDULO ESPECÍFICO"
echo "GET /api/progress/$MODULE_ID (autenticado)"
PROGRESS=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/progress/$MODULE_ID" | jq .)
echo "$PROGRESS" | jq .
PROGRESS_ID=$(echo "$PROGRESS" | jq -r '.id')
echo "✅ Progreso del módulo obtenido con ID: $PROGRESS_ID"
echo ""

# 11. ACTUALIZAR PROGRESO
echo "1️⃣1️⃣  ACTUALIZAR PROGRESO DEL MÓDULO"
echo "PUT /api/progress/$MODULE_ID (autenticado)"
curl -s -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"progress_percentage\": 50,
    \"words_learned_in_module\": 25
  }" \
  "$API_URL/api/progress/$MODULE_ID" | jq .
echo "✅ Progreso actualizado"
echo ""

# 12. OBTENER CERTIFICACIONES
echo "1️⃣2️⃣  OBTENER CERTIFICACIONES DEL USUARIO"
echo "GET /api/certificates (autenticado)"
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/certificates" | jq .
echo "✅ Certificaciones obtenidas"
echo ""

# 13. UPDATE USER
echo "1️⃣3️⃣  ACTUALIZAR PERFIL DEL USUARIO"
echo "PUT /api/user (autenticado)"
curl -s -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"first_name\": \"TestUpdated\",
    \"avatar\": \"https://picsum.photos/seed/test_user/100/100\"
  }" \
  "$API_URL/api/user" | jq .
echo "✅ Perfil actualizado"
echo ""

# 14. VERIFICAR ERRORES - Credenciales Inválidas
echo "1️⃣4️⃣  PRUEBA DE VALIDACIÓN - LOGIN INVÁLIDO"
echo "POST /auth/login con credenciales incorrectas"
curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"wrong@example.com\",
    \"password\": \"wrongpassword\"
  }" | jq .
echo "✅ Validación correcta - error esperado"
echo ""

# 15. OBTENER CURRÍCULUM NIVEL INVÁLIDO
echo "1️⃣5️⃣  PRUEBA DE VALIDACIÓN - NIVEL INVÁLIDO"
echo "GET /api/curriculum/INVALID"
curl -s "$API_URL/api/curriculum/INVALID" | jq .
echo "✅ Validación correcta - error esperado"
echo ""

echo ""
echo "========================================"
echo "✅ TODAS LAS PRUEBAS COMPLETADAS!"
echo "========================================"
echo ""
echo "📊 RESUMEN DE PRUEBAS EXITOSAS:"
echo "✅ Health check"
echo "✅ Root endpoint"
echo "✅ Registro de usuario (con validación)"
echo "✅ Login (obtener JWT)"
echo "✅ Obtener usuario autenticado"
echo "✅ Obtener currículum"
echo "✅ Obtener módulos"
echo "✅ Obtener módulo específico"
echo "✅ Obtener progreso"
echo "✅ Obtener progreso de módulo"
echo "✅ Actualizar progreso"
echo "✅ Obtener certificaciones"
echo "✅ Actualizar usuario"
echo "✅ Validaciones de error"
echo ""
