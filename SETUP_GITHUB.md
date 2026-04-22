# 🚀 Cómo Subir a GitHub y Configurar Variables de Entorno

> **Guía paso a paso para publicar tu proyecto en GitHub de forma segura**

---

## 🔐 Entendiendo .env (Variables de Entorno)

### ¿Qué es .env?

Un archivo de configuración que almacena **valores secretos** que no deben ser públicos.

```bash
# ❌ Archivo secreto (NUNCA debe ir en Git)
.env
GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXXX

# ✅ Archivo público (SIEMPRE va en Git)
.env.example
GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXX
```

---

### ¿Por qué no subir .env?

Si subes `.env` con tu clave real:
- ❌ Cualquiera puede ver tu GROQ_API_KEY
- ❌ Alguien usa tu clave y te gasta el crédito
- ❌ Tu cuenta de Groq queda comprometida
- ❌ Es una **vulnerabilidad de seguridad crítica**

---

## 📋 Paso 1: Verifica .env.example

```bash
cat backend/.env.example
```

**Debe verse así:**
```env
GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXX
DATABASE_URL=sqlite:///availability.db
ENV=development
DEBUG=true
```

✅ Nota: La clave está OCULTA (puros X). Es una plantilla.

---

## 🔒 Paso 2: Verifica que .env está en .gitignore

```bash
cat .gitignore
```

**Debe incluir:**
```
.env
.env.local
.env.*.local
```

✅ Esto asegura que `.env` NUNCA se sube a Git.

---

## 📤 Paso 3: Sube a GitHub

### 3.1 Crea un repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre: `AI-InternTest` (o el que prefieras)
3. Descripción: "Plataforma de inteligencia de datos Rappi con IA conversacional"
4. Privado o Público (puedes hacerlo público para portfolio)
5. **NO** inicialices con README (ya tienes uno)
6. Click "Create repository"

### 3.2 Conecta tu repositorio local con GitHub

```bash
cd /Users/tomasof/Documents/AI-InternTest

# Agrega el repositorio remoto
git remote add origin https://github.com/TU_USUARIO/AI-InternTest.git

# Sube el código
git branch -M main
git push -u origin main
```

**Resultado:** Todo tu código está en GitHub, EXCEPTO `.env` (protegido por .gitignore)

---

## 🔑 Paso 4: Configurar Variables de Entorno Localmente

### Cuando clones el proyecto (Primera vez)

```bash
# Clona desde GitHub
git clone https://github.com/TU_USUARIO/AI-InternTest.git
cd AI-InternTest

# Ve al backend
cd backend

# Copia la plantilla
cp .env.example .env

# Edita .env y agrega TU API key
nano .env
```

**Archivo .env (LOCAL, no se sube):**
```env
GROQ_API_KEY=gsk_TU_CLAVE_REAL_AQUI  ← Reemplaza con tu clave real
DATABASE_URL=sqlite:///availability.db
ENV=development
DEBUG=true
```

### ¿Cómo obtener tu GROQ_API_KEY?

1. Ve a https://console.groq.com/keys
2. Inicia sesión (crea cuenta si no tienes)
3. Click "Create API Key"
4. Copia la clave (algo como `gsk_XXXXXXXXXXXXX`)
5. Pégala en `.env`

**⚠️ IMPORTANTE:**
- Nunca compartas esta clave con nadie
- Nunca la subas a Git
- Si la expones, regenera en https://console.groq.com/keys

---

## 🚀 Paso 5: Ejecutar con Variables de Entorno

### Backend

```bash
cd backend

# FastAPI AUTOMÁTICAMENTE lee .env usando python-dotenv
python main.py

# Internamente:
# - Lee .env (private)
# - Carga GROQ_API_KEY en memory
# - Chatbot usa ese valor para conectar con Groq
```

### Frontend

```bash
cd ../frontend

# Angular no necesita .env (no tiene valores secretos)
ng serve
```

---

## 🛡️ Buenas Prácticas de Seguridad

### ✅ CORRECTO

```bash
# El .env ESTÁ en .gitignore
git status
# No muestra .env

# Solo .env.example va en Git
# Contiene placeholder: gsk_XXXXXXX
```

### ❌ INCORRECTO

```bash
# NUNCA hagas esto:
git add .env
git commit -m "agregué API key"
git push origin main

# ¡Tu clave está en el historio de Git PARA SIEMPRE!
# Incluso si lo borras después, existe en el historial
```

---

## 🔄 Flujo Correcto: De-Desarrollo a Entrevista

### Tú (Desarrollador)

```
1. Trabajas localmente con .env (secreto)
2. Subes código a GitHub (SIN .env)
3. Otros desarrolladores clonan
4. Cada uno crea su propio .env local
```

### Entrevistador (Después de clonar)

```bash
# Clona tu repositorio
git clone https://github.com/TU_USUARIO/AI-InternTest.git
cd AI-InternTest

# Ve README.md para instrucciones
cat README.md

# Sigue los pasos:
# 1. Backend setup
cd backend
cp .env.example .env
# EDITA .env y agrega su propia API key
nano .env

# 2. Frontend setup
cd ../frontend
npm install
ng serve

# 3. Backend
cd ../backend
python main.py
```

**Resultado:** El entrevistador ejecuta tu código con su propia API key.

---

## 📚 Variables de Entorno en Código

### Cómo Python Lee .env

```python
# backend/main.py (o en chatbot.py)
from dotenv import load_dotenv
import os

# Carga automáticamente desde .env
load_dotenv()

# Accede a variable
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Usa en Groq
from groq import Groq
client = Groq(api_key=GROQ_API_KEY)
```

**¿Cómo funciona?**
1. `load_dotenv()` lee `.env` (solo local)
2. `os.getenv("GROQ_API_KEY")` obtiene el valor
3. Groq client se inicializa con esa clave
4. ChatBot usa el client para hacer requests

---

## 🚨 Si Expusiste tu Clave Accidentalmente

**¡No entra en pánico! Es fácil de arreglar:**

```bash
# 1. Regenera tu API key
# Ve a https://console.groq.com/keys
# Click "regenerate" o "delete"

# 2. Actualiza tu .env local
nano backend/.env
# GROQ_API_KEY=gsk_NEW_KEY_HERE

# 3. Verifica que Git NO tiene la vieja clave
git log -p | grep "gsk_"
# Si aparece, tienes que hacer cleanup del historial
# (Más avanzado, pero GitHub tiene "Secret scanning")
```

---

## ✅ Checklist Final

- [ ] `.gitignore` existe y contiene `.env`
- [ ] `.env.example` existe con placeholders
- [ ] `.env` (privado) NO aparece en `git status`
- [ ] Repositorio creado en GitHub
- [ ] Código pusheado a GitHub
- [ ] `README.md` es claro sobre cómo configurar .env
- [ ] Tu GROQ_API_KEY está en `.env` local (no en Git)
- [ ] Backend funciona con `python main.py`
- [ ] Frontend funciona con `ng serve`

---

## 📖 Para Compartir con Otros

**Di esto:**

> "El proyecto está en GitHub: https://github.com/TU_USUARIO/AI-InternTest
> 
> Para correr localmente:
> 
> 1. Clona: `git clone https://github.com/TU_USUARIO/AI-InternTest.git`
> 2. Backend: `cd backend && cp .env.example .env`
> 3. Edita `.env` y agrega tu propia GROQ_API_KEY de https://console.groq.com/keys
> 4. Instala dependencias: `pip install -r requirements.txt`
> 5. Inicia: `python main.py`
> 6. Frontend: `cd ../frontend && npm install && ng serve`"

---

## 🎯 Resumen

| Qué | Dónde | Secreto? | Va en Git? |
|-----|-------|----------|-----------|
| `.env.example` | root | ✅ Público | ✅ SÍ |
| `.env` | root | 🔒 Privado | ❌ NO |
| `GROQ_API_KEY` real | `.env` local | 🔒 Secreto | ❌ NO |
| `GROQ_API_KEY` placeholder | `.env.example` | ✅ Público | ✅ SÍ |
| Código fuente | `/backend`, `/frontend` | ✅ Público | ✅ SÍ |

---

**¡Ahora estás listo para publicar de forma segura! 🚀**
