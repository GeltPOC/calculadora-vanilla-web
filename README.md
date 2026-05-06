# Calculadora Vanilla Web - Modo Científico

Calculadora web construida en **HTML + CSS + JavaScript vanilla** (sin frameworks). Incluye modo básico y modo científico con parser propio (sin `eval()`).

## 🚀 Uso

Abre `index.html` en tu navegador. No requiere instalación ni dependencias.

bash
# Opcional: servir con cualquier servidor estático
python3 -m http.server 8000
# Luego abre http://localhost:8000


## ✨ Características

- Tema oscuro responsive
- Operaciones básicas: `+`, `-`, `×`, `÷`, `%`
- Soporte completo de teclado
- Historial de la última operación
- Modo científico colapsable
- Parser de expresiones propio (precedencia + paréntesis), **sin `eval()`**
- Manejo robusto de errores

## 🔬 Modo científico

Activa el panel pulsando el botón **Científico** en la cabecera. Funciones disponibles:

| Botón | Función | Descripción |
|-------|---------|-------------|
| `sin` | `Math.sin(x)` | Seno (radianes) |
| `cos` | `Math.cos(x)` | Coseno (radianes) |
| `tan` | `Math.tan(x)` | Tangente (radianes) |
| `log` | `Math.log10(x)` | Logaritmo base 10 |
| `ln`  | `Math.log(x)` | Logaritmo natural |
| `√`   | `Math.sqrt(x)` | Raíz cuadrada |
| `x²`  | `(x)^2` | Eleva al cuadrado la expresión actual |
| `x^y` | `Math.pow` | Potencia (operador `^`) |
| `π`   | `Math.PI` | Constante pi |
| `e`   | `Math.E` | Constante de Euler |
| `n!`  | factorial | Factorial entero, 0 ≤ n ≤ 170 |
| `(` `)` | paréntesis | Agrupación |

### Reglas

- Las funciones trigonométricas trabajan en **radianes**.
- `sqrt(x)` requiere `x ≥ 0`.
- `n!` requiere entero no negativo y `n ≤ 170` (límite de precisión IEEE 754).
- División entre 0 lanza error.
- Paréntesis desbalanceados lanzan error.

## ⌨️ Atajos de teclado

| Tecla | Acción |
|-------|--------|
| `0-9` `.` | Insertar dígito |
| `+ - * / % ^ ( )` | Operadores |
| `Enter` o `=` | Calcular |
| `Backspace` | Borrar último carácter |
| `Escape` | Limpiar todo |

## 📁 Estructura


.
├── index.html    # Estructura
├── styles.css    # Tema oscuro responsive
├── script.js     # Parser + lógica
└── README.md


## 🧠 Implementación del parser

El evaluador implementa **descenso recursivo** con la siguiente gramática:


expression := term (('+'|'-') term)*
term       := factor (('*'|'/'|'%') factor)*
factor     := unary ('^' factor)?      // ^ asociativo a la derecha
unary      := ('+'|'-') unary | primary
primary    := number | '(' expression ')' | func '(' expression ')'


Esto evita por completo el uso de `eval()` y proporciona mensajes de error específicos.

## 📜 Licencia

MIT
