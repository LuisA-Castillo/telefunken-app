# Estado actual del proyecto

## Propósito de este documento

Este archivo funciona como punto de referencia rápido para conocer el estado real del proyecto Telefunken.

Su objetivo es responder principalmente a estas preguntas:

- ¿Qué partes del sistema ya están implementadas?
- ¿Qué funcionalidades están funcionando actualmente?
- ¿Qué decisiones técnicas importantes ya se tomaron?
- ¿Qué se está desarrollando en este momento?
- ¿Cuál es el siguiente paso?
- ¿Qué tareas quedan pendientes?

Este documento no pretende explicar cada línea de código ni reemplazar la documentación técnica detallada.

Debe utilizarse como una fotografía del estado actual del proyecto.

Cuando se complete una funcionalidad importante o cambie alguna decisión relevante de arquitectura, este archivo debe actualizarse.

---

## Resumen del proyecto

Telefunken es una aplicación web para registrar partidas familiares del juego de cartas Telefunken.

La aplicación busca reemplazar el registro manual en papel, manteniendo visible durante toda la partida la información necesaria para tomar decisiones y validar colectivamente los resultados.

La aplicación está desarrollada con:

- Vite
- Vanilla JavaScript
- Bootstrap 5
- Firebase Cloud Firestore
- GitHub
- GitHub Actions
- Netlify
- Vitest

Actualmente el proyecto ya cuenta con un flujo multijugador real basado en Firestore.

La sincronización del cierre de manos y el registro individual de resultados todavía se encuentra en desarrollo.

---

## Estrategia de desarrollo

El proyecto se desarrolla de forma incremental.

El flujo utilizado hasta el momento es:

1. Implementar una funcionalidad.
2. Probarla manualmente.
3. Corregir errores encontrados.
4. Crear o actualizar pruebas automatizadas cuando corresponda.
5. Realizar commit.
6. Continuar con el siguiente bloque funcional.

No se trabaja directamente sobre las ramas protegidas.

---

## Flujo Git actual

El proyecto utiliza las siguientes ramas:

### `main`

Representa la versión estable del sistema.

Características:

- contiene código probado;
- recibe cambios mediante Pull Request;
- está protegida;
- se utiliza como rama de producción;
- Netlify despliega automáticamente esta rama.

### `develop`

Representa la rama de integración del proyecto.

Características:

- recibe funcionalidades terminadas;
- recibe cambios mediante Pull Request;
- está protegida;
- sirve como punto de partida para nuevas funcionalidades.

### `feature/*`

Son ramas temporales utilizadas para desarrollar funcionalidades específicas.

Ejemplos:

```text
feature/lobby
feature/game-table
feature/hand-results
feature/player-identity
feature/firebase-setup
```

El flujo esperado es:

```text
develop
   ↓
feature/nueva-funcionalidad
   ↓
commit
   ↓
push
   ↓
Pull Request
   ↓
develop
```

Cuando existe una versión suficientemente estable:

```text
develop
   ↓
Pull Request
   ↓
main
   ↓
Netlify
```

---

## Estado actual de la integración Firebase

La integración con Firebase se encuentra todavía dentro de una rama `feature`.

Esta rama contiene múltiples cambios relacionados con:

- persistencia;
- sincronización;
- recuperación de sesión;
- multijugador en tiempo real.

Todavía no debe considerarse terminada.

La intención actual es completar todo el flujo de persistencia y multijugador antes de realizar el Pull Request de esta rama hacia `develop`.

---

## Funcionalidades completadas

### Creación de partida

Actualmente es posible:

- crear una nueva partida;
- seleccionar modalidad;
- generar un código;
- guardar la partida en Firestore;
- registrar al anfitrión.

Las modalidades disponibles son:

```text
ordenado
libre
```

Los códigos utilizan el formato:

```text
TELE-XXXX
```