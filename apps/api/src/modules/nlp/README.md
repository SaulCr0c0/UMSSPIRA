# Módulo NLP

Extrae palabras clave canónicas de textos de perfiles y vacantes usando un diccionario cargado en memoria. No usa machine learning ni escribe en la base de datos.

## Normalización

`domain/policies/text-normalizer.ts` expone:

- `normalizeText(text)`: devuelve tokens normalizados.
- `splitSegments(text)`: divide por saltos de línea antes de normalizar.
- `normalizePhrase(text)`: une los tokens con un espacio.

`normalizePhrase` es la forma canónica que se guarda en `termino_normalizado` y `alias_normalizado`. Ninguna otra regla de normalización debe reemplazarla.

La normalización convierte paréntesis, barras y guiones en separadores. Conserva `+` y `#` finales, y puntos y guiones bajos internos.

## Extracción

`application/services/keyword-extractor.service.ts` busca n-gramas de 1 a 3 palabras, sin cruzar segmentos ni delimitadores de aclaración. En cada posición gana la frase más larga. Las stopwords no se eliminan antes de buscar frases del diccionario; solo filtran candidatos de `unmapped`.

Los resultados se ordenan por conteo descendente y luego alfabéticamente. `unmapped` se limita a 50 entradas.

## Misma mención

Una keyword y su alias, o el alias y la keyword, cuentan como una sola mención cuando están adyacentes y separados únicamente por:

- paréntesis de aclaración: `Amazon Web Services (AWS)`.
- una barra con espacios a ambos lados: `JS / JavaScript`.

La regla se aplica sobre el texto crudo del segmento, antes de la normalización destructiva. Una cadena de la misma canónica unida por separadores válidos también cuenta una sola vez: `JS / JavaScript / JS` produce `javascript` ×1.

No consolidan:

- comas, guiones, punto y coma, ni la conjunción `y`.
- una barra sin espacios: `JS/JavaScript` cuenta ×2.
- canónicas distintas: `Node.js / JavaScript` cuenta una vez cada una.
- menciones en segmentos distintos.

Las palabras desconocidas dentro del paréntesis siguen la regla normal de `unmapped`: `React (hooks)` produce `react` ×1 y deja `hooks` como candidata.
