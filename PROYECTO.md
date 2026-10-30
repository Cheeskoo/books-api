# Reading List API: plan, estado y decisiones

**Objetivo:** servidor Express + TypeScript que expone endpoints REST (`/books`), valida lo que recibe, lee y escribe en Supabase (PostgreSQL) mediante Prisma y responde siempre con un formato consistente. El frontend vendrá después y solo hablará con esta API, nunca con la base de datos.

**Stack:** Express, TypeScript, tsx, Supabase (Postgres), Prisma (con adapter `pg`), Zod.

---

## Plan por hitos

| Hito | Objetivo | Estado |
|---|---|---|
| 0 | Proyecto en Supabase y tabla `books` con sus `CHECK` | Hecho |
| 1 | Servidor Express + TS con `/health` y 404 en JSON | Hecho |
| 2 | Conexión a la base con Prisma, `/health` consulta la DB | Hecho |
| 3 | `POST /books` y `GET /books/:id` en capas (routes, controller, service) | Hecho |
| 4 | Validación con Zod (schema, middleware `validate`) | Hecho |
| 5 | `PATCH` y `DELETE`, regla del rating contra el estado ya guardado, `updated_at` | Pendiente |
| 6 | Listado con filtros, búsqueda, orden y paginación | Pendiente |
| 7 | Manejo de errores unificado, README, tests (Vitest + Supertest) | Pendiente |

---

## Hito 4: resumen

- Schema de creación con `z.strictObject` en `src/utils/books-schema.ts`, más el tipo `CreateBookInput` (`z.infer`) que usa el controller.
- Regla cruzada con `.refine()`: `rating` solo con `status = finished`, error en `field: "rating"`.
- `formatIssues` (`src/utils/formatIssues.ts`) convierte los issues de Zod en `{ field, message }`, con `field: ""` para errores del body completo.
- Middleware genérico `validate(schema)`: no conoce los campos de libros, responde 400 con `details` y reemplaza `req.body` por `result.data`.
- `bookIdSchema`: regex sobre el texto, conversión a número y tope `MAX_BOOK_ID` definido en un solo lugar. Se valida dentro del controller porque Express vuelve a asignar `req.params` en cada handler.
- Pruebas HTTP pasadas: los 5 casos del body y los casos del id (`0x4`, `05` y `2147483648` dan 400; `0` da 404; un id existente da 200).

---

## Formatos de respuesta

- Éxito: `{ "data": ... }`
- Error: `{ "error": { "message": "..." } }`
- Error de validación: `{ "error": { "message": "Validation failed", "details": [{ "field": "...", "message": "..." }] } }`
- Ruta inexistente: 404 en JSON con el mismo formato de error.
- Errores del servidor: 500 con mensaje genérico al cliente; el detalle real va a `console.error`.

---

## Decisiones tomadas (para el README)

**Base de datos**
- Supabase (Postgres) con Prisma. Solo se usa como base de datos, sin `supabase-js`.
- RLS activo sin políticas: la API pública de Supabase queda cerrada y la única puerta a los datos es este servidor, que se conecta con un rol que se salta RLS.
- Conexión en runtime por el pooler en modo transacción; migraciones y `db pull` por el session pooler (la conexión directa usa IPv6, que no todas las redes soportan).
- Prisma no representa los `CHECK` de la tabla, así que la API debe validar antes de escribir. La base queda como última línea de defensa.

**Validación**
- `strictObject`: se rechazan campos desconocidos para que el cliente se entere de que mandó algo que no existe. Coste: si el front manda un campo extra, recibe 400.
- `notes`: mínimo de 10 caracteres (más estricto que la tabla), máximo 2000. Para "sin notas" se omite el campo.
- `status` distingue mayúsculas: los valores son un contrato fijo igual que el `CHECK`.
- Tipos estrictos: `rating: "5"` (texto) se rechaza. Si se aceptara, el front se acostumbraría a mandar tipos incorrectos y los errores aparecerían más tarde.
- `rating` sin `status` se rechaza: el estado por defecto es `want_to_read`, que no admite rating.
- `field: ""` cuando el problema es del body completo.

**Id en `/books/:id`**
- Solo dígitos, sin ceros a la izquierda, hasta el máximo de `INTEGER` de Postgres (2.147.483.647).
- Se valida el formato del texto antes de convertir a número (`Number('0x4')` valía 4 y daba 200).
- Id fuera de rango o con formato inválido: 400.
- `0`: 404. Tiene formato válido, simplemente no existe ningún libro con ese id.
- El máximo debe definirse en un solo lugar por si la columna pasa a `BIGINT`.

---

## Cosas a recordar

- Orden en Express: el 404 va al final, después de todas las rutas y routers.
- `updated_at` no se actualiza solo en Postgres. Hay que resolverlo en el hito 5 (opciones: Prisma `@updatedAt`, trigger, o fijarlo en el service).
- Si se vuelve a ejecutar `prisma db pull`, el `schema.prisma` se regenera y puede borrar cambios manuales (por ejemplo un `@@map`).
- `.env` nunca va a Git. `.env.example` solo con valores falsos.
- El frontend debe usar constantes compartidas para los valores de `status`.

---

## Hito 5: adelanto

`PATCH /books/:id` y `DELETE /books/:id`. La regla del rating se vuelve más interesante porque depende del estado que el libro ya tiene en la base. Piensa estos casos antes de empezar:

- Libro `reading` con `PATCH { rating: 5 }`: ¿debe fallar?
- Libro `finished` con rating 4 y `PATCH { status: "reading" }`: ¿qué pasa con el rating que ya existe?
- `PATCH` con body vacío.
- `DELETE` de un id que no existe.
