# 🎨 Color Accessibility Checker - GPT App

**Aplicación de verificación de accesibilidad de colores integrada con ChatGPT.**

Este proyecto demuestra cómo crear una aplicación web interactiva que permite analizar el contraste de colores y extraer paletas de sitios web, diseñada para funcionar tanto como aplicación independiente como widget dentro de ChatGPT.

![Color App Preview](https://raw.githubusercontent.com/placeholder/preview.png)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [¿Cómo Funciona?](#-cómo-funciona)
- [Requisitos](#-requisitos)
- [Instalación Local](#-instalación-local)
- [Desarrollo Local](#-desarrollo-local)
- [Despliegue](#-despliegue)
- [Integración con ChatGPT](#-integración-con-chatgpt)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Comandos Disponibles](#-comandos-disponibles)
- [Licencia](#-licencia)

## ✨ Características

- **✅ Verificación WCAG**: Comprobación automática de estándares AA y AAA para texto normal y grande.
- **🔍 Extracción por URL**: Analiza cualquier sitio web (ej. `google.com`) para extraer sus colores de marca automáticamente.
- **🎨 Análisis de Paleta**: Genera una paleta completa de colores desde la URL proporcionada.
- **🤖 Combinaciones Inteligentes**: Calcula y muestra automáticamente todas las combinaciones de colores accesibles de la paleta extraída.
- **🌗 Diseño Premium**: Interfaz moderna con modo oscuro, glassmorphism y animaciones fluidas.
- **📱 Responsive**: Funciona perfectamente en escritorio y móvil.

## 🛠 ¿Cómo Funciona?

El widget utiliza React y Vite para el frontend. Para la extracción de colores, se integra con la API de **Microlink**, lo que permite procesar URLs y obtener metadatos de diseño (logos, imágenes) para derivar la paleta de colores dominante.

1.  **Entrada**: El usuario introduce una URL o selecciona colores manualmente.
2.  **Procesamiento**: La app consulta la API o calcula el ratio de contraste localmente (fórmula de luminancia relativa).
3.  **Salida**: Se muestran los resultados de cumplimiento WCAG y una lista de pares de colores seguros.

## 📋 Requisitos

- **Node.js**: v18 o superior.
- **NPM**: v9 o superior.

## 💻 Instalación Local

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/tu-usuario/color-accessibility-checker.git
    cd color-accessibility-checker
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

## 🚀 Desarrollo Local

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## ☁️ Despliegue

Este proyecto es estático y se puede desplegar fácilmente en **Vercel**, **Netlify** o **GitHub Pages**.

### Vercel
1.  Instala Vercel CLI: `npm i -g vercel`
2.  Ejecuta: `vercel`

## 🤖 Integración con ChatGPT

Para integrar esta herramienta en ChatGPT como una **GPT Action** o mediante **MCP**, puedes exponer la funcionalidad de análisis.

### Schema para GPT Action (Ejemplo)

```yaml
openapi: 3.1.0
info:
  title: Color Analysis API
  version: 1.0.0
servers:
  - url: https://api.microlink.io
paths:
  /:
    get:
      operationId: extractColors
      summary: Extrae la paleta de colores de una URL
      parameters:
        - name: url
          in: query
          required: true
          schema:
            type: string
        - name: palette
          in: query
          schema:
            type: boolean
            default: true
      responses:
        '200':
          description: Paleta de colores extraída
```

## 📂 Estructura del Proyecto

```
color-accessibility-checker/
├── src/
│   ├── components/
│   │   └── ColorAccessibilityWidget.tsx  # Lógica principal del widget
│   ├── App.tsx                           # Componente raíz
│   ├── index.css                         # Estilos globales y variables CSS
│   └── main.tsx                          # Punto de entrada
├── public/                               # Activos estáticos
├── index.html                            # Template HTML
├── package.json                          # Dependencias y scripts
├── tsconfig.json                         # Configuración TypeScript
└── vite.config.ts                        # Configuración Vite
```

## 📜 Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local. |
| `npm run build` | Compila la aplicación para producción. |
| `npm run preview` | Vista previa de la build de producción. |
| `npm run lint` | Ejecuta el linter para encontrar errores. |

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
