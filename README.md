# Calculadora Vanilla Web - Tema Día/Noche

Calculadora científica en HTML + CSS + JavaScript puro (sin frameworks) con soporte de **modo día/noche**.

## ✨ Feature: Tema Día/Noche

- **Botón toggle** en la esquina superior con icono ☀️ / 🌙 que alterna entre los modos.
- **Modo noche (default)**: tema oscuro con fondos profundos y texto claro.
- **Modo día**: tema claro con fondos blancos/grises claros, texto oscuro y acentos azul/naranja en operadores.
- **Persistencia** en `localStorage` bajo la clave `calc-theme`.
- **Detección automática**: si no hay preferencia guardada, se utiliza `prefers-color-scheme` del sistema operativo.
- **Transiciones suaves** de `0.3s` en `background-color` y `color`.
- Implementado con **variables CSS** en `:root` y override mediante `body[data-theme="light"]`.

### Cómo funciona

1. Al cargar la página, `script.js` lee `localStorage.getItem('calc-theme')`.
2. Si existe (`light` o `dark`), se aplica.
3. Si no, se consulta `window.matchMedia('(prefers-color-scheme: light)')`.
4. Al hacer click en el botón `#theme-toggle`, se alterna el atributo `data-theme` en el `<body>` y se persiste el valor.

## 🧮 Modo Científico

Incluye todas las funciones científicas, intactas:

- Trigonométricas: `sin`, `cos`, `tan` (radianes)
- Logarítmicas: `log` (base 10), `ln` (base e)
- Potencias: `x²`, `x^y`, `√` (raíz cuadrada)
- Constantes: `π`, `e`
- Factorial: `n!`
- Paréntesis: `(`, `)`
- Operaciones básicas: `+`, `−`, `×`, `÷`

## 🔒 Sin `eval`

La evaluación de expresiones se realiza con un **parser propio**:

1. **Tokenizer** que reconoce números, operadores, funciones y paréntesis.
2. **Algoritmo Shunting-Yard** para convertir a notación polaca inversa (RPN).
3. **Evaluador de RPN** con stack.

Esto evita riesgos de seguridad y entrega errores controlados.

## 📁 Estructura


.
├── index.html      # Estructura: toggle + display + teclado científico
├── styles.css      # Variables CSS, temas dark/light, transiciones
├── script.js       # Toggle de tema + lógica calculadora (parser sin eval)
└── README.md


## 🚀 Uso

Abre `index.html` directamente en cualquier navegador moderno. No requiere build ni dependencias.

bash
# Opcional: servir con un servidor estático
npx serve .
# o
python3 -m http.server 8080


## ⌨️ Soporte de teclado

- Dígitos `0-9` y `.`
- Operadores `+ - * / ^`
- Paréntesis `( )`
- `Enter` o `=` para evaluar
- `Backspace` para borrar
- `Escape` para limpiar todo

## 🎨 Personalización de tema

Edita las variables CSS en `styles.css`:

css
:root {
  --bg-app: #0f1115;
  --bg-key-op: #f59e0b;
  /* ... */
}

body[data-theme="light"] {
  --bg-app: #f3f4f6;
  --bg-key-op: #f59e0b;
  /* ... */
}

