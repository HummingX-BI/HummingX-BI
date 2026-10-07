# Reglas para Despliegues y Cambios en Base de Datos (Prisma & Vercel)

## ⚠️ Protocolo Obligatorio ante Modificaciones en `prisma/schema.prisma`

Cada vez que se agreguen modelos, campos o se modifique de cualquier forma el archivo `prisma/schema.prisma`, **DEBES** seguir rigurosamente este protocolo **ANTES** y **DURANTE** el despliegue:

### 1. Sincronización Previa de la Base de Datos (Neon DB en Producción)
**ANTES** de hacer commit o deploy a Vercel:
- Sincroniza el esquema con la base de datos de producción ejecutando:
  ```bash
  npx prisma db push
  ```
  *(Asegúrate de que use las variables de entorno correctas de producción como `DATABASE_URL` / `DIRECT_URL`).*
- Regenera el cliente local si es necesario:
  ```bash
  npx prisma generate
  ```

### 2. Despliegue con Limpieza Forzada de Caché en Vercel
Al desplegar el backend o proyecto a Vercel, **SIEMPRE** usa la bandera `--force` o `-f` para invalidar cachés de compilación anteriores y garantizar que Vercel regenere `@prisma/client` con el nuevo esquema:
```bash
npx vercel --prod -f --yes
```
*(O `vercel --prod -f` según corresponda).*

> ⛔ **NUNCA** hagas deploy a producción después de cambiar `schema.prisma` sin haber ejecutado primero `npx prisma db push` y sin incluir la bandera `-f` en Vercel.
