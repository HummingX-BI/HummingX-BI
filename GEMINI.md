# Directrices y Reglas del Proyecto (HummingX BI)

## 📌 Protocolo Obligatorio para Prisma y Despliegues en Vercel

Cada vez que modifiques el archivo `prisma/schema.prisma`:
1. **ANTES de hacer deploy a Vercel**: Debes asegurarte de sincronizar la base de datos de producción ejecutando:
   ```bash
   npx prisma db push
   ```
   *(Asegúrate de contar con las variables de entorno de producción correctas).*
2. **Durante el despliegue a Vercel**: Usa siempre la bandera `--force` o `-f` (por ejemplo: `vercel --prod -f` o `npx vercel --prod -f --yes`) para limpiar el caché de compilación y asegurar que `@prisma/client` se regenere con el nuevo schema actualizado.

## 📌 Contexto de la Aplicación y Despliegues
- **Monorepo**:
  - Backend API: `api/index.js` y `api/_src/routes/` servido en Vercel vía rewrite `/api/:path*`.
  - Frontend Portal: Aplicación Vite + React en la carpeta `portal/` (`https://portal.hummingxbi.com`).
  - Landing page: Archivos en la raíz (`index.html`, etc.).
- **Regla de Privacidad de Pruebas**: No tomar capturas de pantalla ni grabaciones del navegador a menos que el usuario lo solicite expresamente.
