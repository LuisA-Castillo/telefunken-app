# Flujo de trabajo con Git y GitHub

## Propósito de este documento

Este documento describe la estrategia de control de versiones y colaboración utilizada en el proyecto Telefunken.

Su objetivo es explicar:

- qué representa cada rama;
- cuándo se trabaja localmente;
- cuándo interviene GitHub;
- cómo se crean funcionalidades;
- cuándo realizar commits;
- cuándo hacer push;
- cómo utilizar Pull Requests;
- cómo integrar cambios;
- cómo actualizar el repositorio local;
- cómo evitar trabajar directamente sobre ramas protegidas;
- cómo colaborar entre varios desarrolladores;
- cómo se relacionan GitHub Actions y Netlify con el flujo de trabajo.

Este documento describe la forma oficial de trabajo del proyecto.

No pretende enseñar Git desde cero.

Para aprender Git se recomienda primero realizar un laboratorio independiente y posteriormente aplicar este flujo dentro de Telefunken.

---

# Conceptos fundamentales

Antes de trabajar en el proyecto es importante distinguir:

```text
Repositorio local
```

de:

```text
Repositorio remoto
```

---

# Repositorio local

Es la copia del proyecto almacenada en la computadora del desarrollador.

Ejemplo:

```text
Computadora de Beto
└── telefunken-app
```

o:

```text
Computadora de Mel
└── telefunken-app
```

Cada desarrollador tiene su propia copia local.

---

# Repositorio remoto

Es el repositorio almacenado en GitHub.

Actúa como punto compartido entre los desarrolladores.

Conceptualmente:

```text
Computadora de Beto
        ↕
      GitHub
        ↕
Computadora de Mel
```

Los cambios no aparecen automáticamente en GitHub simplemente por modificar archivos localmente.

---

# Git y GitHub no son lo mismo

Git es el sistema de control de versiones utilizado localmente.

GitHub es la plataforma donde se almacena y comparte el repositorio remoto.

Ejemplos de operaciones Git:

```text
git status
git add
git commit
git branch
git checkout
git merge
```

Ejemplos de operaciones relacionadas con el remoto:

```text
git clone
git push
git pull
git fetch
```

GitHub también permite:

```text
Pull Requests
revisión de código
GitHub Actions
protección de ramas
```

---

# Estructura de ramas

El proyecto utiliza principalmente:

```text
main
develop
feature/*
```

Cada tipo de rama tiene una responsabilidad distinta.

---

# Rama `main`

`main` representa la versión estable de producción.

Debe contener:

- código probado;
- funcionalidades integradas;
- una versión suficientemente estable para desplegar.

Netlify utiliza:

```text
main
```

como rama de producción.

---

# Regla para `main`

No se trabaja directamente sobre `main`.

Los cambios deben llegar mediante:

```text
Pull Request
```

normalmente desde:

```text
develop
```

---

# Rama `develop`

`develop` representa la rama de integración.

Contiene funcionalidades que ya fueron desarrolladas y revisadas, pero que todavía no necesariamente han sido liberadas a producción.

Las nuevas funcionalidades normalmente parten de:

```text
develop
```

---

# Regla para `develop`

Tampoco se trabaja directamente sobre `develop`.

Los cambios deben llegar mediante ramas:

```text
feature/*
```

y Pull Requests.

---

# Ramas `feature/*`

Cada funcionalidad o cambio independiente debe desarrollarse en su propia rama.

Formato recomendado:

```text
feature/nombre-funcionalidad
```

Ejemplos:

```text
feature/lobby
feature/game-table
feature/firebase-setup
feature/player-result-ui
feature/realtime-hand-flow
```

---

# Objetivo de una rama feature

Una rama feature permite desarrollar un cambio sin afectar inmediatamente:

```text
develop
```

ni:

```text
main
```

Conceptualmente:

```text
develop
   |
   └── feature/nueva-funcionalidad
```

El desarrollador puede trabajar, probar y hacer commits dentro de esa rama.

---

# Flujo normal para crear una nueva feature

Antes de crear una rama nueva:

```bash
git checkout develop
```

Actualizar la copia local:

```bash
git pull
```

Crear la rama:

```bash
git checkout -b feature/nombre-funcionalidad
```

A partir de ese momento el trabajo se realiza sobre esa rama.

---

# Verificar rama actual

Antes de modificar código conviene comprobar:

```bash
git branch
```

La rama activa aparece marcada con:

```text
*
```

Ejemplo:

```text
  develop
* feature/player-result-ui
  main
```

---

# Trabajo local

Modificar archivos no envía nada a GitHub.

Ejemplo:

```text
Editar main.js
Guardar archivo
```

sigue siendo únicamente un cambio local.

Git puede detectar el cambio mediante:

```bash
git status
```

---

# `git status`

Debe utilizarse frecuentemente.

Permite conocer:

- rama actual;
- archivos modificados;
- archivos nuevos;
- archivos preparados para commit;
- estado respecto al remoto.

Ejemplo:

```bash
git status
```

---

# Área de preparación

Antes de un commit se seleccionan los archivos que formarán parte de él.

Ejemplo:

```bash
git add .
```

Esto agrega todos los cambios actuales al área de preparación.

También puede agregarse un archivo específico:

```bash
git add src/main.js
```

---

# Commit

Un commit registra un punto del historial local.

Ejemplo:

```bash
git commit -m "feat: add player result form"
```

Después del commit:

```text
el cambio existe en el repositorio local
```

pero todavía no necesariamente en GitHub.

---

# Un commit no es un push

Esto es especialmente importante.

```text
commit
→ guarda historial local
```

Mientras:

```text
push
→ envía commits al repositorio remoto
```

Por tanto:

```bash
git commit
```

no significa que otro desarrollador ya pueda ver ese cambio desde GitHub.

---

# Cuándo hacer commit

Se recomienda hacer commit cuando existe un cambio lógico y comprobable.

Ejemplos:

```text
una funcionalidad pequeña terminada
una corrección específica
una actualización de documentación
una prueba añadida
un refactor concreto
```

Se deben evitar commits enormes que mezclen demasiadas responsabilidades.

---

# Mensajes de commit

El proyecto utiliza mensajes breves y descriptivos.

Ejemplos:

```text
feat: add realtime multiplayer lobby
feat: add synchronized hand closing flow
fix: preserve purchases after player update
docs: add project technical documentation
test: validate maximum player score
```

Prefijos comunes:

```text
feat:
→ nueva funcionalidad

fix:
→ corrección

docs:
→ documentación

test:
→ pruebas

refactor:
→ reorganización sin cambio funcional

chore:
→ mantenimiento
```

---

# Push

Después de realizar commits, estos pueden enviarse a GitHub.

Primera vez que se publica una rama:

```bash
git push -u origin feature/nombre-funcionalidad
```

Después puede utilizarse simplemente:

```bash
git push
```

---

# Qué significa `origin`

`origin` es normalmente el nombre asignado al repositorio remoto principal.

Puede comprobarse con:

```bash
git remote -v
```

Conceptualmente:

```text
origin
→ repositorio GitHub de Telefunken
```

---

# Rama local y rama remota

Después de hacer push pueden existir:

```text
feature/player-result-ui
```

localmente y:

```text
origin/feature/player-result-ui
```

en GitHub.

Son referencias relacionadas, pero no son exactamente lo mismo.

---

# Pull Request

Después de terminar una funcionalidad y subir la rama:

se crea un Pull Request.

Ejemplo:

```text
feature/player-result-ui
        ↓
       PR
        ↓
develop
```

El PR permite:

- revisar cambios;
- comentar código;
- comprobar pruebas;
- detectar problemas;
- aprobar o solicitar correcciones;
- integrar de forma controlada.

---

# Pull Request no significa Pull

Un Pull Request pertenece a GitHub y propone integrar ramas.

El comando:

```bash
git pull
```

es diferente.

`git pull` actualiza una rama local utilizando cambios del remoto.

---

# Revisión de Pull Request

Cuando otro desarrollador crea un PR:

el compañero debe revisar:

- qué archivos cambiaron;
- si el cambio corresponde al objetivo;
- si existen errores evidentes;
- si las pruebas pasan;
- si se respetan las reglas del proyecto.

No se debe aprobar únicamente porque el código compila.

---

# GitHub Actions

Los Pull Requests hacia ramas protegidas ejecutan automáticamente CI.

Actualmente se valida:

```text
npm ci
npm test -- --run
npm run build
```

Esto permite comprobar:

- instalación de dependencias;
- pruebas automatizadas;
- construcción de producción.

---

# Estado del CI

Un Pull Request no debería fusionarse si el pipeline obligatorio falla.

Ejemplo:

```text
test-and-build
✓
```

indica que la validación automática pasó.

Si aparece:

```text
test-and-build
✗
```

se debe revisar el error antes del merge.

---

# Merge

Cuando el PR es aprobado y las validaciones pasan:

puede integrarse a la rama destino.

Ejemplo:

```text
feature/player-result-ui
        ↓
      merge
        ↓
develop
```

Después del merge, `develop` remoto contiene el cambio.

---

# El merge remoto no actualiza automáticamente la computadora

Después de fusionar un PR en GitHub:

la rama `develop` local puede seguir desactualizada.

Para actualizarla:

```bash
git checkout develop
git pull
```

Ahora la copia local incluye el merge realizado en GitHub.

---

# Eliminación de rama feature

Después de integrar una feature ya no suele ser necesaria.

En GitHub puede eliminarse la rama remota.

Después, localmente:

```bash
git branch -d feature/nombre-funcionalidad
```

Esto mantiene limpio el repositorio.

---

# Flujo completo de una feature

```text
develop actualizado
      ↓
crear feature
      ↓
trabajar localmente
      ↓
probar
      ↓
git add
      ↓
git commit
      ↓
git push
      ↓
Pull Request
      ↓
CI
      ↓
revisión
      ↓
merge a develop
      ↓
eliminar rama remota
      ↓
git checkout develop
      ↓
git pull
      ↓
eliminar rama local
```

---

# Flujo hacia producción

Cuando `develop` contiene una versión estable:

se crea:

```text
Pull Request

develop
   ↓
main
```

Después de aprobar y fusionar:

```text
main
```

contiene la nueva versión estable.

---

# Despliegue con Netlify

Netlify escucha:

```text
main
```

Después de un merge:

```text
develop
→ main
```

Netlify ejecuta el despliegue automáticamente.

Flujo:

```text
feature
   ↓
develop
   ↓
main
   ↓
Netlify
   ↓
producción
```

---

# Reglas de protección

Actualmente:

```text
main
develop
```

son ramas protegidas.

Entre las reglas utilizadas se encuentran:

- Pull Request obligatorio;
- validación de CI;
- bloqueo de force push;
- protección frente a eliminación.

Esto reduce el riesgo de modificar accidentalmente ramas importantes.

---

# No utilizar force push en ramas compartidas

No se debe utilizar:

```bash
git push --force
```

sobre ramas protegidas o compartidas.

Puede sobrescribir historial y afectar a otros desarrolladores.

---

# Trabajo colaborativo

Cuando existen varios desarrolladores:

cada persona debe trabajar normalmente en una rama diferente.

Ejemplo:

```text
Beto
→ feature/realtime-hand-flow

Mel
→ feature/player-result-ui
```

Ambos parten de:

```text
develop
```

---

# Evitar trabajar sobre la misma feature

Salvo que exista una razón clara, no es recomendable que dos personas trabajen simultáneamente sobre la misma rama feature.

Es preferible:

```text
feature/A
feature/B
```

y posteriormente integrar mediante PR.

---

# Evitar modificar los mismos archivos simultáneamente

Aunque Git puede resolver muchos cambios automáticamente, conviene distribuir tareas para reducir conflictos.

Ejemplo:

```text
Beto
→ lógica Firestore

Mel
→ interfaz
```

cuando sea posible.

Esto no siempre evitará tocar archivos compartidos como:

```text
main.js
```

pero reduce la probabilidad de conflictos.

---

# Actualizarse antes de comenzar una feature

Antes de crear una nueva rama:

```bash
git checkout develop
git pull
```

Esto asegura que la feature parta de la versión integrada más reciente.

Después:

```bash
git checkout -b feature/nombre
```

---

# Actualizar una feature existente

Si `develop` cambia mientras se trabaja durante varios días:

puede ser necesario incorporar esos cambios.

El procedimiento exacto debe realizarse con cuidado.

Una estrategia sencilla para el proyecto es:

```bash
git checkout develop
git pull

git checkout feature/mi-feature
git merge develop
```

Después:

- resolver conflictos si existen;
- ejecutar pruebas;
- continuar.

---

# Conflictos

Un conflicto ocurre cuando Git no puede decidir automáticamente cómo combinar dos cambios.

Ejemplo:

```text
Beto modifica una línea de main.js

Mel modifica la misma línea de main.js
```

Git puede marcar:

```text
<<<<<<<
=======
>>>>>>>
```

El desarrollador debe decidir cuál debe ser el resultado correcto.

---

# Un conflicto no es un error de Git

Los conflictos son una situación normal del trabajo colaborativo.

Significan que Git necesita ayuda humana para decidir cómo combinar cambios.

Después de resolver:

```bash
git add .
git commit
```

según corresponda al flujo utilizado.

---

# `git pull`

`git pull` se utiliza para traer cambios remotos e integrarlos en la rama local actual.

Por eso antes de ejecutarlo se debe verificar:

```bash
git branch
```

No conviene ejecutar comandos sin conocer la rama actual.

---

# `git fetch`

`git fetch` descarga información del remoto sin integrar inmediatamente los cambios en la rama actual.

Puede utilizarse para inspeccionar cambios antes de mezclarlos.

Para el flujo cotidiano inicial del proyecto:

```bash
git pull
```

será suficiente en la mayoría de los casos.

---

# Clonar el proyecto

Un nuevo desarrollador comienza normalmente mediante:

```bash
git clone URL_DEL_REPOSITORIO
```

Después:

```bash
cd telefunken-app
```

Instala dependencias:

```bash
npm install
```

---

# Configuración del nuevo colaborador

Antes de comenzar a trabajar debe comprobar:

```bash
git status
git branch
git remote -v
```

y ejecutar:

```bash
npm test -- --run
npm run build
```

para verificar que su entorno funciona correctamente.

También debe probar:

```bash
npm run dev
```

---

# Incorporación de un nuevo colaborador

El proceso recomendado es:

```text
1. Aprender flujo Git en laboratorio independiente.

2. Obtener acceso al repositorio Telefunken.

3. Clonar repositorio.

4. Instalar dependencias.

5. Revisar documentación.

6. Ejecutar aplicación.

7. Ejecutar pruebas.

8. Comprender main/develop/feature.

9. Crear una feature pequeña.

10. Hacer commit.

11. Push.

12. Crear PR hacia develop.

13. Recibir revisión.

14. Integrar.

15. Actualizar develop local.
```

---

# Documentación que debe revisar un nuevo desarrollador

Antes de modificar el proyecto:

```text
docs/current-status.md
```

para saber dónde está el desarrollo.

Después:

```text
docs/architecture.md
```

para entender la estructura.

Luego:

```text
docs/game-rules.md
docs/requirements.md
docs/ux-flow.md
```

según la funcionalidad asignada.

Si trabajará con Firebase:

```text
docs/firestore-model.md
```

---

# Asignación de una tarea

Antes de empezar una feature debe definirse:

```text
Objetivo
Responsable
Rama
Alcance
Archivos probables
Criterio de terminado
```

Ejemplo:

```text
Objetivo:
mejorar mensaje de espera del jugador

Responsable:
Mel

Rama:
feature/ui-waiting-message

Criterio de terminado:
- mensaje actualizado;
- responsive;
- aplicación funciona;
- pruebas pasan;
- PR creado.
```

---

# Qué significa "terminado"

Una feature no se considera terminada únicamente porque:

```text
el código fue escrito
```

Debe cumplir:

```text
implementado
probado manualmente
errores corregidos
pruebas revisadas
build correcto
commit realizado
push realizado
PR creado
CI aprobado
revisión completada
merge
```

---

# Flujo de desarrollo utilizado en Telefunken

Actualmente el proyecto sigue:

```text
Implementación
      ↓
Prueba manual
      ↓
Corrección
      ↓
Agregar o ajustar pruebas
      ↓
Commit
```

No se utiliza TDD estricto.

---

# Cuándo no hacer commit

No es obligatorio hacer commit después de cada línea o cambio mínimo.

Puede ser conveniente continuar trabajando si:

- la funcionalidad todavía está rota;
- existe un cambio incompleto difícil de comprender;
- todavía se está ajustando el mismo bloque lógico.

Sin embargo, tampoco se deben acumular demasiados cambios no relacionados.

---

# Commits locales intermedios

Una rama feature puede contener varios commits antes del Pull Request.

Ejemplo:

```text
feat: create hand listener
fix: prevent duplicate listener
test: add hand listener validation
```

Esto es válido.

---

# Push de trabajo en progreso

También puede hacerse push antes de terminar una feature.

Esto permite:

- respaldar el trabajo;
- compartirlo;
- cambiar de computadora;
- permitir revisión temprana.

Hacer push no significa que la rama deba fusionarse.

---

# Pull Request en borrador

Si se desea compartir una feature aún no terminada, GitHub permite utilizar un Pull Request en borrador.

Esto puede ser útil en trabajo colaborativo.

Sin embargo, no es obligatorio para cada cambio.

---

# Revisión entre compañeros

En un proyecto colaborativo es recomendable que:

```text
Beto revise PR de Mel
Mel revise PR de Beto
```

cuando resulte razonable.

Esto ayuda a que ambos conozcan el código y reduce dependencia de una sola persona.

---

# Propiedad del código

Aunque una persona implemente una feature:

el código pertenece al proyecto.

Después del merge:

ambos desarrolladores deben poder comprenderlo y mantenerlo.

Por eso:

- comentarios claros;
- documentación;
- nombres comprensibles;
- PRs pequeños;

son importantes.

---

# Primera etapa colaborativa

Al incorporar un nuevo desarrollador no conviene comenzar directamente con la funcionalidad más compleja.

La progresión recomendada es:

```text
1. cambio visual pequeño
2. evento JavaScript sencillo
3. lógica del proyecto
4. estado
5. Firestore
6. tiempo real
```

Esto permite comprender progresivamente la arquitectura.

---

# Laboratorio previo de Git

Antes del onboarding en Telefunken se realizará un laboratorio independiente.

Debe utilizar tecnologías similares:

```text
Vite
Vanilla JavaScript
Bootstrap
Git
GitHub
```

El laboratorio debe practicar:

```text
crear repositorio
clonar
main
develop
feature
cambios locales
git status
git add
git commit
git push
Pull Request
revisión
merge
git pull
eliminar ramas
```

Después se repetirá el mismo patrón en Telefunken.

---

# Relación entre laboratorio y proyecto

El laboratorio debe enseñar:

```text
conceptos
```

Telefunken permitirá aplicar:

```text
los mismos conceptos en un proyecto real
```

Ejemplo:

```text
Laboratorio
feature/add-task

Telefunken
feature/player-result-ui
```

La herramienta es la misma.

Solo cambia la complejidad del sistema.

---

# Estado actual de la rama Firebase

La integración de Firebase se está desarrollando en una rama feature.

Esta rama contiene múltiples cambios relacionados con:

- persistencia;
- multijugador;
- listeners;
- recuperación de sesión;
- cierre de manos.

La decisión actual es:

```text
completar el flujo Firebase/multijugador
antes de crear el PR final hacia develop
```

Se permiten commits intermedios.

---

# Incorporación de otro desarrollador durante una feature grande

Si otra persona se incorpora mientras existe una feature grande en desarrollo:

no debe asumirse automáticamente que debe comenzar desde `develop`.

Primero debe decidirse qué base necesita su trabajo.

Puede ocurrir que:

```text
su nueva tarea dependa de cambios
que todavía existen únicamente
en la feature Firebase
```

En ese caso la estrategia debe acordarse explícitamente antes de crear la rama.

No se debe crear una rama desde una base incorrecta únicamente por seguir mecánicamente el flujo normal.

---

# Regla general para nuevas features

En condiciones normales:

```text
feature
```

parte de:

```text
develop
```

Excepciones temporales deben documentarse y utilizarse solo cuando una dependencia real lo justifique.

---

# Estado antes de colaborar

Antes de incorporar cambios colaborativos importantes:

- el trabajo actual debe estar respaldado con commits;
- la documentación debe estar actualizada;
- la rama utilizada debe estar en GitHub;
- debe conocerse cuál es la base correcta de nuevas ramas.

Esto evita que otro desarrollador trabaje sobre una versión desactualizada.

---

# `git status` antes y después

Una buena práctica es utilizar:

```bash
git status
```

antes de:

- cambiar de rama;
- hacer pull;
- hacer commit;
- hacer merge.

Y nuevamente después de operaciones importantes.

Esto permite comprender qué está ocurriendo.

---

# No copiar carpetas como estrategia de colaboración

No se debe colaborar enviando:

```text
ZIP
carpetas por WhatsApp
archivos sueltos
```

como mecanismo principal.

El repositorio Git debe ser la fuente de colaboración.

---

# No reemplazar archivos completos sin revisar

Cuando dos desarrolladores cambian un archivo, no debe solucionarse un conflicto simplemente copiando una versión completa encima de la otra sin analizar los cambios.

Debe comprenderse qué aporta cada rama.

---

# Pull antes de iniciar el día

Cuando se trabaje sobre una rama compartida de integración:

es recomendable actualizarla antes de crear trabajo nuevo.

Ejemplo:

```bash
git checkout develop
git pull
```

---

# Push antes de cambiar de equipo

Si un desarrollador dejará de trabajar en una computadora y continuará en otra:

los commits necesarios deben enviarse al remoto.

Ejemplo:

```bash
git push
```

Después en la segunda computadora:

```bash
git pull
```

o se recupera la rama correspondiente.

---

# Resumen mental del flujo

Para recordar:

```text
MODIFICO
→ local

COMMIT
→ historial local

PUSH
→ envío al remoto

PR
→ propongo integrar

MERGE
→ integro ramas

PULL
→ actualizo mi copia local
```

Este resumen es especialmente importante para desarrolladores que comienzan a utilizar Git colaborativamente.

---

# Flujo visual completo

```text
COMPUTADORA LOCAL
      |
      | modificar
      ↓
Working Directory
      |
      | git add
      ↓
Staging Area
      |
      | git commit
      ↓
Repositorio local
      |
      | git push
      ↓
GitHub
      |
      | Pull Request
      ↓
Revisión + CI
      |
      | Merge
      ↓
develop remoto
      |
      | git pull
      ↓
develop local actualizado
```

---

# Relación con documentación

Antes de comenzar una tarea:

```text
current-status.md
```

permite saber dónde continuar.

Durante desarrollo:

```text
architecture.md
requirements.md
game-rules.md
firestore-model.md
ux-flow.md
```

permiten conocer las reglas que deben respetarse.

Después de completar cambios relevantes:

la documentación afectada también debe actualizarse.

---

# Mantenimiento de este documento

Este archivo debe actualizarse cuando cambie:

- estrategia de ramas;
- política de Pull Requests;
- CI;
- reglas de protección;
- proceso de releases;
- metodología de colaboración;
- procedimiento de onboarding.

No debe actualizarse por cada feature individual.

---

# Documentación relacionada

```text
docs/current-status.md
→ estado actual del proyecto

docs/architecture.md
→ estructura técnica

docs/firestore-model.md
→ persistencia

docs/game-rules.md
→ reglas del juego

docs/requirements.md
→ requisitos

docs/ux-flow.md
→ experiencia de usuario
```