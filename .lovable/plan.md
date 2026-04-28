Validé SQL: la cuenta `mosherosenstocks@gmail.com` sí tiene `role = admin` en `public.user_roles` para el usuario correcto. El problema no es que falte el rol; el problema está en dos puntos:

1. La app marca `loading=false` antes de terminar de leer roles, así que `/onboarding` puede renderizar “Cuenta pendiente” aunque el rol exista.
2. La función interna `has_role` quedó sin permiso de ejecución para usuarios autenticados. Eso puede romper políticas de acceso admin y algunas validaciones backend.

Plan de corrección:

1. Ajustar permisos SQL de roles
   - Crear una migración pequeña para devolver `EXECUTE` de `public.has_role(uuid, app_role)` a `authenticated`.
   - Mantener revocado para `anon` y `public`, para no exponer validación de roles a usuarios no autenticados.
   - Confirmar después con SQL que la función puede evaluar admin correctamente desde el contexto adecuado.

2. Corregir `useAuth`
   - Separar “auth loading” de “roles loading”, o mantener `loading=true` hasta que `fetchRoles()` termine.
   - Manejar errores de lectura de `user_roles` explícitamente, sin convertirlos silenciosamente en `roles=[]`.
   - Exponer una función `refreshRoles()` real en el hook, en vez de depender de `window.location.reload()`.

3. Corregir `/onboarding`
   - Mostrar “Cargando rol…” mientras los roles se están consultando.
   - Redirigir automáticamente a `/admin` cuando detecte `admin`.
   - Cambiar el botón “Refrescar” para llamar `refreshRoles()` y, si encuentra admin, navegar al panel Core sin recargar toda la app.
   - Si hay error de backend temporal, mostrar un mensaje de error claro y permitir reintentar.

4. Reforzar `ProtectedRoute`
   - No enviar al usuario a onboarding mientras los roles aún se están cargando.
   - Solo mostrar “Cuenta pendiente” cuando la consulta terminó correctamente y realmente no hay roles.

5. Validación final
   - Verificar con SQL que `user_roles` contiene el rol admin para el usuario master.
   - Verificar que la función `has_role` tiene permisos correctos para `authenticated`.
   - Revisar que el flujo esperado sea:

```text
login correcto -> carga sesión -> carga roles -> detecta admin -> redirige a /admin
```

Resultado esperado: al iniciar sesión con `mosherosenstocks@gmail.com`, la cuenta master deja de quedar atrapada en onboarding y entra al panel Core/Admin, con capacidad de cambiar entre portales.