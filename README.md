# Calculadora Vanilla Web

Calculadora web simple construida únicamente con **HTML**, **CSS** y **JavaScript vanilla**. Sin frameworks, sin Node, sin build tools.

## Características

- ✅ Operaciones básicas: suma (+), resta (−), multiplicación (×), división (÷)
- ✅ Porcentaje (%)
- ✅ Botón C (clear) para reiniciar
- ✅ Botón ⌫ (backspace) para borrar último dígito
- ✅ Soporte completo de teclado
- ✅ Evaluación segura **sin usar `eval()`**
- ✅ Diseño moderno tema oscuro y responsive
- ✅ Manejo de errores (división por cero)

## Uso

Simplemente abre `index.html` en tu navegador. No requiere instalación ni servidor.

bash
# Opción 1: doble clic en index.html

# Opción 2: con un servidor local
python3 -m http.server 8000
# Luego visita http://localhost:8000


## Atajos de teclado

| Tecla | Acción |
|-------|--------|
| `0`–`9` | Insertar dígito |
| `.` o `,` | Punto decimal |
| `+` `-` `*` `/` | Operadores |
| `Enter` o `=` | Calcular resultado |
| `Escape` | Limpiar todo (C) |
| `Backspace` | Borrar último dígito |
| `%` | Porcentaje |

## Estructura


.
├── index.html    # Estructura
├── styles.css    # Estilos (tema oscuro, responsive)
├── script.js     # Lógica (sin eval)
└── README.md


## Seguridad

La calculadora **no usa `eval()`** ni `Function()`. Todas las operaciones se computan con una función `compute(a, b, op)` que aplica un `switch` sobre operadores válidos, evitando inyección de código.
