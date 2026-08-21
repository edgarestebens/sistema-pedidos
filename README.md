# Brasas del Sur — Sistema de pedidos

Angular 19 + Supabase (Auth, Postgres, Realtime).

## Arranque

1. Credenciales Supabase en `src/environments/environment.ts` (mismo proyecto que antes).
2. `npm install && npm run dev`
3. Abrí [http://localhost:4200](http://localhost:4200)

## Demo online

Después del deploy a GitHub Pages:

https://edgarestebens.github.io/sistema-pedidos/


## Credenciales demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Cliente | `cliente@brasas.com` | `brasas123` |
| Admin | `admin@brasas.com` | `brasas123` |
| Cocinero | `cocinero@brasas.com` | `brasas123` |

## Qué usa Supabase

- Auth (login / registro / sesión)
- Menú, pedidos, ítems, ajustes del restaurante
- RLS por rol (`cliente` / `admin` / `cocinero`)
- Realtime en el Kanban de cocina

El carrito sigue en `localStorage` hasta el checkout. Los pagos son simulados.

## E2E (Chrome visible)

Con `npm run dev` corriendo:

```bash
npm run e2e:headed
```
