# Requisitos del sistema

## Propósito de este documento

Este documento define los requisitos funcionales y no funcionales de la aplicación Telefunken.

Su objetivo es establecer una referencia clara de:

- qué debe permitir hacer el sistema;
- qué restricciones debe respetar;
- qué comportamiento se espera en cada etapa de una partida;
- qué responsabilidades tiene el anfitrión;
- qué responsabilidades tienen los jugadores;
- qué información debe mantenerse sincronizada;
- qué condiciones deben cumplirse para iniciar, continuar y finalizar una partida;
- qué características de calidad debe mantener la aplicación.

Este documento describe lo que el sistema debe cumplir.

Las reglas específicas del juego se documentan en:

```text
docs/game-rules.md
```

La arquitectura técnica se documenta en:

```text
docs/architecture.md
```

El modelo de Firestore se documenta en:

```text
docs/firestore-model.md
```

El estado actual del desarrollo se documenta en:

```text
docs/current-status.md
```

---

# Alcance del sistema

Telefunken es una aplicación web orientada al registro y seguimiento de partidas familiares del juego Telefunken.

El sistema no sustituye el juego físico.

Su función principal es facilitar:

- creación de partidas;
- organización de jugadores;
- registro de resultados;
- control de compras;
- visualización de puntajes;
- sincronización entre dispositivos;
- validación grupal;
- seguimiento de manos;
- finalización de partidas;
- consulta posterior de resultados e historial.

La aplicación no necesita controlar individualmente las cartas físicas.

---

# Actores del sistema

La aplicación reconoce principalmente dos roles funcionales:

```text
Anfitrión
Jugador
```

Todos los participantes son jugadores.

Uno de ellos actúa adicionalmente como anfitrión.

---

# Anfitrión

El anfitrión es el jugador responsable de coordinar ciertas acciones administrativas de la partida.

Debe poder:

- crear la partida;
- definir inicialmente la modalidad;
- organizar jugadores;
- reordenar jugadores antes de comenzar;
- eliminar jugadores durante el lobby;
- iniciar la partida;
- finalizar una mano;
- indicar cómo terminó la mano;
- validar el avance cuando todos hayan registrado;
- corregir resultados cuando sea necesario;
- finalizar forzosamente una partida.

El anfitrión también registra su propio resultado como cualquier otro jugador.

---

# Jugador

Un jugador debe poder:

- ingresar a una partida;
- identificarse mediante un nombre;
- visualizar los demás jugadores;
- consultar la tabla;
- consultar sus compras restantes;
- consultar el repartidor;
- registrar su propio resultado;
- visualizar los resultados de otros jugadores;
- participar en la validación grupal;
- abandonar el lobby antes de comenzar.

Un jugador normal no debe poder ejecutar acciones administrativas reservadas al anfitrión.

---

# RF-001 Crear una partida

El sistema debe permitir crear una nueva partida.

Durante la creación se debe:

- ingresar el nombre del anfitrión;
- seleccionar una modalidad;
- generar un código de partida;
- crear la partida;
- crear al anfitrión como primer jugador;
- identificar al dispositivo actual como perteneciente al anfitrión.

Las modalidades disponibles son:

```text
ordenado
libre
```

---

# RF-002 Generar código de partida

Cada partida debe disponer de un código visible.

Formato:

```text
TELE-XXXX
```

donde:

```text
XXXX
```

representa cuatro dígitos.

El sistema debe evitar utilizar simultáneamente un código ya asignado a otra partida activa o existente según la estrategia definida.

---

# RF-003 Unirse mediante código

El sistema debe permitir que un jugador se una utilizando el código de partida.

El usuario debe poder introducir únicamente:

```text
XXXX
```

y la aplicación debe interpretar internamente:

```text
TELE-XXXX
```

El sistema debe validar que:

- el código exista;
- la partida permita nuevos jugadores;
- no se haya alcanzado el máximo permitido.

---

# RF-004 Identificar al jugador

Cada jugador debe disponer de un identificador interno independiente de su nombre.

Ejemplo:

```text
player-k3m9x2
```

El sistema debe utilizar este identificador para:

- relaciones;
- resultados;
- permisos;
- búsquedas;
- persistencia.

El nombre debe utilizarse principalmente para presentación.

---

# RF-005 Mantener identidad del dispositivo

El sistema debe recordar qué jugador corresponde al navegador utilizado.

Después de recargar la aplicación, el sistema debe intentar recuperar:

```text
currentGameId
currentPlayerId
```

y reconstruir la partida correspondiente.

---

# RF-006 Controlar cantidad de jugadores

Una partida debe admitir:

```text
mínimo 2 jugadores
máximo 6 jugadores
```

No debe poder iniciarse fuera de ese rango.

---

# RF-007 Mostrar lobby

Antes de iniciar la partida, todos los jugadores deben visualizar un lobby común.

El lobby debe mostrar al menos:

- código de partida;
- modalidad;
- anfitrión;
- jugadores;
- cantidad actual;
- orden de jugadores.

---

# RF-008 Sincronizar jugadores del lobby

Cuando un jugador:

- ingrese;
- salga;
- sea eliminado;
- cambie de posición;

los demás dispositivos deben recibir el cambio sin necesidad de recargar manualmente.

---

# RF-009 Reordenar jugadores

El anfitrión debe poder cambiar el orden de los jugadores antes de iniciar.

El orden debe representar la ubicación física alrededor de la mesa.

El primer jugador del orden será el primer repartidor.

---

# RF-010 Eliminar jugadores del lobby

El anfitrión debe poder eliminar jugadores mientras la partida se encuentre en estado:

```text
lobby
```

El jugador eliminado debe dejar de pertenecer a la partida.

Si su dispositivo continúa abierto, debe detectar que ya no pertenece al juego.

---

# RF-011 Abandonar el lobby

Un jugador debe poder abandonar voluntariamente una partida antes de comenzar.

Si el jugador que abandona no es el anfitrión:

```text
se elimina únicamente ese jugador
```

---

# RF-012 Transferir anfitrión

Si el anfitrión abandona el lobby y todavía existen jugadores:

- se debe seleccionar un nuevo anfitrión;
- debe actualizarse el identificador del host;
- los demás dispositivos deben recibir el cambio.

---

# RF-013 Eliminar partida vacía

Si el último jugador abandona una partida todavía no iniciada:

```text
status = lobby
```

la partida puede eliminarse completamente.

---

# RF-014 Iniciar partida

Solo el anfitrión debe poder iniciar la partida.

Antes de iniciar deben cumplirse las condiciones mínimas de jugadores.

Al iniciar:

```text
status = in_progress
currentHand = 1
dealerIndex = 0
```

También deben inicializarse las condiciones correspondientes a la modalidad.

---

# RF-015 Sincronizar inicio

Cuando el anfitrión inicia:

- todos los dispositivos deben detectar el cambio;
- todos deben abandonar automáticamente el lobby;
- todos deben mostrar la tabla de juego.

No debe requerirse recargar manualmente.

---

# RF-016 Mostrar información de partida

Durante una partida activa se debe mostrar al menos:

- modalidad;
- número de mano;
- repartidor;
- compras restantes;
- tabla de resultados.

---

# RF-017 Mostrar tabla permanente

La tabla de resultados debe ser el elemento central de la interfaz durante el juego.

Debe permitir consultar la información acumulada sin abandonar el flujo principal.

---

# RF-018 Mostrar juegos

La tabla debe utilizar exactamente:

```text
1/3
2/3
1/4
2/4
1/5
2/5
ESC
```

con el significado definido en:

```text
docs/game-rules.md
```

---

# RF-019 Resaltar juego actual en modo ordenado

En modo ordenado, la tabla debe identificar visualmente qué juego corresponde a la mano actual.

Ejemplo:

```text
Mano 3
→ 1/4
```

---

# RF-020 Mostrar compras restantes

El sistema debe mostrar las compras restantes de cada jugador durante la partida.

Las compras deben actualizarse a partir de los resultados registrados.

---

# RF-021 Respetar compras por modalidad

El sistema debe utilizar:

```text
12 compras
```

en modo ordenado.

Y:

```text
7 compras
```

en modo libre.

---

# RF-022 Deshabilitar compras en la primera mano ordenada

Durante:

```text
1/3
```

del modo ordenado, no deben permitirse compras.

El resultado debe asumir:

```text
purchasesUsed = 0
```

---

# RF-023 Mostrar repartidor

La aplicación debe indicar quién reparte la mano actual.

El repartidor debe rotar después de cada mano.

---

# RF-024 Finalizar una mano

Solo el anfitrión debe poder iniciar el cierre de una mano.

La acción debe estar disponible durante una partida activa.

---

# RF-025 Registrar causa de cierre

Al finalizar una mano, el anfitrión debe indicar una única causa.

Valores:

```text
player_out
draw_pile_exhausted
```

La causa pertenece a toda la mano.

---

# RF-026 Crear mano en recopilación

Cuando el anfitrión confirma el cierre:

se debe crear una mano equivalente a:

```text
hand-N
```

con estado:

```text
collecting_results
```

La creación de la mano no debe avanzar todavía a la siguiente.

---

# RF-027 Sincronizar cierre de mano

Cuando una mano pasa a:

```text
collecting_results
```

todos los dispositivos deben detectarlo automáticamente.

Todos deben cambiar al flujo correspondiente de registro de resultados.

---

# RF-028 Registrar resultado individual

Cada jugador debe registrar únicamente su propio resultado.

El sistema debe identificar al jugador utilizando:

```text
currentPlayerId
```

No debe mostrarse un formulario para editar inicialmente los resultados de todos los jugadores desde un dispositivo normal.

---

# RF-029 Registrar resultado en modo ordenado

En modo ordenado, el sistema ya conoce el juego correspondiente a la mano.

El jugador debe registrar al menos:

- puntos;
- compras utilizadas cuando correspondan.

El código de juego debe derivarse de la mano actual.

---

# RF-030 Registrar resultado en modo libre

En modo libre el jugador debe indicar:

- si completó un juego;
- cuál juego completó, si corresponde;
- puntos;
- compras utilizadas.

Solo deben ofrecerse juegos todavía pendientes para ese jugador.

---

# RF-031 Registrar penalización

En modo libre, si el jugador no completa un juego:

```text
completedGameCode = null
```

Los puntos deben registrarse como penalización.

---

# RF-032 Validar puntaje

El sistema debe aceptar valores de:

```text
0 a 999
```

inclusive.

No debe aceptar valores mayores a:

```text
999
```

---

# RF-033 Validar compras

El sistema debe impedir registrar más compras de las que el jugador tenga disponibles.

Las compras utilizadas deben ser números válidos y no negativos.

---

# RF-034 Mantener un resultado por jugador y mano

Cada jugador debe disponer de un único resultado por mano.

Conceptualmente:

```text
una mano
+
un jugador
=
un resultado
```

Si el resultado se corrige, debe actualizarse en lugar de generar otro independiente.

---

# RF-035 Mostrar estado de registro

Durante la recopilación de resultados, todos los jugadores deben poder visualizar quién ya registró.

Ejemplo:

```text
Beto   ✓ Registrado
Mel    ✓ Registrado
Techi  ⏳ Pendiente
```

---

# RF-036 Impedir avance con resultados incompletos

La aplicación no debe permitir avanzar mientras falte al menos un jugador.

Ejemplo:

```text
3 jugadores
2 resultados
→ no puede continuar
```

---

# RF-037 Validar resultados completos

Una vez que todos hayan registrado, el sistema debe validar el conjunto de resultados antes de avanzar.

Las validaciones deben respetar las reglas definidas para la causa de cierre.

---

# RF-038 Confirmar resultados

Solo el anfitrión debe poder confirmar definitivamente una mano cuando todos los resultados estén presentes.

---

# RF-039 Completar mano

Después de la confirmación:

```text
hand.status = completed
```

La mano pasa a formar parte del historial válido de la partida.

---

# RF-040 Avanzar mano

Después de completar una mano, el sistema debe:

- incrementar `currentHand`;
- rotar `dealerIndex`;
- actualizar la partida;
- mostrar nuevamente la tabla.

---

# RF-041 Sincronizar avance

Cuando el host avance a la siguiente mano:

- todos los dispositivos deben recibir el cambio;
- todos deben regresar automáticamente a la tabla;
- todos deben visualizar el nuevo repartidor y nueva mano.

---

# RF-042 Registrar resultado cero

El sistema debe permitir:

```text
points = 0
```

como resultado válido.

Si corresponde a un juego completado, visualmente debe mostrarse:

```text
—
```

---

# RF-043 Diferenciar pendiente y cero

La aplicación debe distinguir entre:

```text
juego pendiente
```

y:

```text
juego completado con 0
```

Representación:

```text
pendiente
→ celda vacía

completado con 0
→ —
```

---

# RF-044 Mostrar penalizaciones independientes

En modo libre, cada penalización debe mostrarse en una fila separada.

No debe existir únicamente una fila acumulada de penalización.

---

# RF-045 Calcular total

El sistema debe calcular el total de cada jugador utilizando:

- resultados de juegos;
- penalizaciones.

El total debe mantenerse visible en la tabla.

---

# RF-046 Detectar finalización ordenada

El modo ordenado debe terminar cuando se completen los siete juegos correspondientes.

El sistema debe determinar al ganador según:

```text
menor puntaje acumulado
```

---

# RF-047 Detectar finalización libre

El modo libre debe terminar cuando al menos un jugador complete los siete juegos.

No debe finalizar únicamente porque:

- hayan transcurrido siete manos;
- se hayan agotado las compras.

---

# RF-048 Resolver finalización simultánea en modo libre

Si varios jugadores completan su séptimo juego durante la misma mano:

solo esos jugadores deben considerarse para determinar al ganador.

Entre ellos gana:

```text
menor puntaje acumulado
```

---

# RF-049 Mostrar resultados finales

Cuando una partida termine normalmente, el sistema debe mostrar:

- ganador o ganadores según corresponda;
- puntajes finales;
- información suficiente para revisar la partida.

---

# RF-050 Mantener partida finalizada en modo lectura

Una partida finalizada debe conservar sus resultados.

No debe continuar admitiendo nuevas manos como si estuviera activa.

---

# RF-051 Finalizar partida forzosamente

El anfitrión debe poder interrumpir una partida activa.

Esta operación debe utilizar una confirmación explícita por tratarse de una acción importante.

---

# RF-052 Marcar partida abortada

Cuando el anfitrión finaliza forzosamente:

```text
status = aborted
```

La partida debe conservar su historial existente.

No debe eliminarse.

---

# RF-053 Distinguir partida abortada de terminada

Una partida abortada no debe considerarse equivalente a una partida finalizada normalmente.

Debe ser posible diferenciar:

```text
finished
```

de:

```text
aborted
```

---

# RF-054 Permitir correcciones del anfitrión

El anfitrión debe poder corregir información registrada incorrectamente.

Las correcciones previstas incluyen:

- puntaje;
- compras;
- juego completado;
- penalización;
- resultados posteriores al cierre.

La corrección debe actualizar la información existente.

---

# RF-055 Crear nueva partida posterior

Después de finalizar una partida, debe existir la posibilidad de crear una nueva partida utilizando los mismos jugadores.

El flujo deberá:

- crear una nueva partida;
- asignar un nuevo código;
- establecer estado `lobby`;
- conservar o recalcular el orden según las reglas definidas;
- permitir iniciar nuevamente.

La integración completa de este flujo con Firestore todavía está pendiente.

---

# RF-056 Historial de partidas

El sistema deberá permitir consultar partidas anteriores.

El historial deberá distinguir al menos:

```text
finished
aborted
```

La implementación completa pertenece a una etapa posterior del proyecto.

---

# RF-057 Múltiples partidas simultáneas

El sistema debe permitir que existan varias partidas diferentes simultáneamente.

Cada partida debe mantenerse aislada mediante su:

```text
gameId
```

y su código correspondiente.

---

# RF-058 Mantener datos independientes entre partidas

Los jugadores, manos y resultados de una partida no deben mezclarse con otra.

Toda información debe estar asociada explícitamente al juego correspondiente.

---

# RF-059 Recuperar partida después de recargar

Si existe una sesión local válida:

el sistema debe intentar reconstruir automáticamente:

- partida;
- jugadores;
- manos;
- compras;
- pantalla correspondiente.

---

# RF-060 Invalidar sesión inexistente

Si la partida almacenada localmente ya no existe:

la aplicación debe limpiar la sesión local y regresar al inicio.

---

# RF-061 Invalidar jugador eliminado

Si el jugador almacenado localmente ya no pertenece a la partida:

- debe limpiarse su sesión;
- debe regresar al inicio;
- no debe continuar operando sobre la partida.

---

# RF-062 Mantener sincronización entre dispositivos

Los cambios relevantes deben reflejarse en otros dispositivos sin depender de recargas manuales.

Esto incluye al menos:

- jugadores;
- host;
- inicio de partida;
- mano actual;
- repartidor;
- cierre de mano;
- resultados;
- avance;
- finalización.

---

# RF-063 Evitar duplicación de manos

Una mano debe tener un identificador determinístico:

```text
hand-N
```

La repetición accidental de la misma operación no debe crear dos manos con el mismo número.

---

# RF-064 Evitar duplicación de resultados

Un jugador debe tener un único documento de resultado dentro de una mano.

El identificador debe basarse en:

```text
playerId
```

---

# RF-065 Mostrar interfaz responsive

La aplicación debe ser utilizable en:

- teléfonos;
- tablets;
- computadores.

La prioridad principal es el uso desde teléfono durante una partida física.

---

# RF-066 Permitir desplazamiento de la tabla

Cuando existan varios jugadores y la tabla no quepa completamente en pantalla:

debe permitirse desplazamiento horizontal.

---

# RF-067 Mantener columna de juegos visible

La columna izquierda que identifica:

```text
1/3
2/3
...
```

debe permanecer visible durante desplazamiento horizontal cuando sea posible.

---

# RF-068 Destacar contexto actual

La interfaz debe ayudar a identificar rápidamente:

- mano actual;
- juego actual en ordenado;
- repartidor;
- compras restantes.

---

# RF-069 Minimizar confirmaciones

Las operaciones frecuentes no deben requerir confirmaciones innecesarias.

Las confirmaciones deben reservarse para acciones como:

- abortar partida;
- eliminar información importante;
- otras operaciones destructivas.

---

# RF-070 Mostrar mensajes comprensibles

Los errores destinados al usuario deben presentarse mediante mensajes comprensibles.

Los detalles técnicos pueden registrarse en:

```javascript
console.error()
```

pero no deben utilizarse como única comunicación hacia el jugador.

---

# RF-071 Utilizar Bootstrap como base visual

La interfaz debe apoyarse principalmente en Bootstrap.

El CSS personalizado debe mantenerse limitado a necesidades específicas.

---

# RF-072 Mantener consistencia visual

Los elementos equivalentes deben utilizar comportamientos y estilos consistentes.

Ejemplos:

- botones primarios;
- mensajes de error;
- modales;
- formularios;
- estados de espera.

---

# RF-073 Mantener tabla visible para estrategia

El sistema debe facilitar que los jugadores revisen resultados anteriores durante la partida.

La tabla no debe quedar sustituida permanentemente por pantallas secundarias.

---

# RF-074 Mostrar código de partida

Durante las etapas donde resulte útil, el código:

```text
TELE-XXXX
```

debe mantenerse disponible para identificar la partida.

---

# RF-075 Proteger acciones según rol

Ocultar un botón no debe considerarse suficiente como única protección.

Las acciones sensibles deben validar también que el jugador correspondiente tenga permiso.

---

# Requisitos no funcionales

---

# RNF-001 Usabilidad

La aplicación debe poder ser utilizada por personas que están jugando físicamente y necesitan registrar información rápidamente.

La interacción debe minimizar:

- pasos innecesarios;
- navegación compleja;
- formularios excesivos.

---

# RNF-002 Responsividad

La interfaz debe adaptarse a diferentes tamaños de pantalla.

Debe funcionar correctamente al menos en:

```text
teléfono
tablet
escritorio
```

---

# RNF-003 Compatibilidad web

La aplicación debe ejecutarse desde un navegador moderno sin requerir instalación obligatoria de software adicional.

---

# RNF-004 Sincronización en tiempo real

Los cambios compartidos deben propagarse mediante Firestore en un tiempo razonable para permitir una experiencia multijugador natural.

---

# RNF-005 Persistencia

La pérdida de una recarga de página no debe implicar perder la partida.

La información compartida debe mantenerse en Firestore.

---

# RNF-006 Recuperación

La aplicación debe poder reconstruir el estado necesario de una partida a partir de información persistida.

---

# RNF-007 Consistencia

La aplicación debe evitar múltiples fuentes de verdad para la misma información cuando sea posible.

Ejemplos:

```text
host
→ hostPlayerId

jugador
→ playerId
```

---

# RNF-008 Mantenibilidad

El código debe mantener separación razonable entre:

```text
presentación
lógica
persistencia
estado
```

para facilitar modificaciones posteriores.

---

# RNF-009 Testabilidad

La lógica independiente de interfaz y Firestore debe poder verificarse mediante pruebas automatizadas.

---

# RNF-010 Integración continua

Los cambios integrados deben poder verificarse automáticamente mediante GitHub Actions.

El pipeline actual ejecuta:

```text
npm ci
npm test -- --run
npm run build
```

---

# RNF-011 Control de versiones

Todo cambio significativo debe quedar registrado mediante Git.

Las ramas protegidas no deben modificarse directamente.

---

# RNF-012 Despliegue reproducible

La versión de producción debe poder construirse mediante:

```text
npm run build
```

y desplegarse automáticamente desde:

```text
main
```

mediante Netlify.

---

# RNF-013 Identificadores estables

Las relaciones internas no deben depender de nombres visibles.

Se deben utilizar identificadores estables para:

- partidas;
- jugadores;
- manos;
- resultados.

---

# RNF-014 Tolerancia a recargas

Una recarga del navegador no debe provocar:

- duplicación de manos;
- duplicación de resultados;
- pérdida de identidad;
- reinicio accidental de la partida.

---

# RNF-015 Evitar duplicados por reintento

Las operaciones sensibles deben diseñarse de forma que los reintentos no generen entidades duplicadas.

Ejemplo:

```text
hand-1
```

debe seguir representando la primera mano aunque una operación se ejecute nuevamente.

---

# RNF-016 Seguridad

Antes de considerar la aplicación lista para una exposición pública amplia, deben revisarse las reglas de seguridad de Firestore.

La aplicación actualmente no utiliza autenticación tradicional.

Por tanto debe prestarse especial atención a:

- escritura de partidas;
- escritura de jugadores;
- modificación de host;
- resultados;
- cierre de manos;
- finalización de partidas.

---

# RNF-017 Privacidad mínima

La aplicación no debe requerir información personal innecesaria.

Para participar en una partida basta principalmente con:

```text
nombre visible
```

y un identificador técnico generado por la aplicación.

---

# RNF-018 Simplicidad tecnológica

Mientras no exista una necesidad clara, el proyecto debe evitar incorporar dependencias o capas adicionales innecesarias.

La tecnología actual se basa en:

```text
Vite
Vanilla JavaScript
Bootstrap
Firebase
```

---

# RNF-019 CSS mínimo personalizado

Debe priorizarse Bootstrap antes de agregar reglas CSS propias.

El CSS adicional debe responder a necesidades reales de interfaz.

---

# RNF-020 Rendimiento

La aplicación debe mantener tiempos de interacción adecuados para una partida familiar.

El tamaño del bundle deberá revisarse si comienza a afectar perceptiblemente:

- carga inicial;
- rendimiento;
- uso desde conexiones móviles.

Actualmente existe una advertencia de tamaño relacionada con Firebase que no bloquea el funcionamiento, pero deberá revisarse posteriormente.

---

# Restricciones del sistema

---

# RST-001 No existe autenticación tradicional

Actualmente no se utilizan:

```text
correo
contraseña
cuenta de usuario
```

La identidad se maneja mediante jugador, partida y dispositivo.

---

# RST-002 La aplicación no controla cartas

El sistema no mantiene un modelo digital completo del mazo.

No registra individualmente:

- cartas;
- robos;
- descartes;
- combinaciones físicas.

---

# RST-003 Validación colectiva

Parte de la exactitud depende de los jugadores.

La aplicación registra y valida estructura, pero no sustituye completamente el acuerdo físico entre participantes.

---

# RST-004 Host único

En cada momento debe existir como máximo un anfitrión activo por partida.

Su identidad se obtiene mediante:

```text
hostPlayerId
```

---

# RST-005 Firestore como backend actual

La persistencia y sincronización multijugador actuales dependen de Firebase Cloud Firestore.

Un cambio futuro de backend requeriría adaptar principalmente la capa de servicios y persistencia.

---

# RST-006 Netlify como despliegue actual

La versión web actual se despliega mediante Netlify.

La rama de producción es:

```text
main
```

---

# Requisitos actualmente implementados parcialmente

Algunos requisitos ya tienen soporte técnico parcial pero todavía no están completos de extremo a extremo.

Entre ellos:

```text
RF-027 Sincronizar cierre de mano
RF-028 Registrar resultado individual
RF-035 Mostrar estado de registro
RF-036 Impedir avance incompleto
RF-038 Confirmar resultados
RF-039 Completar mano
RF-041 Sincronizar avance
RF-049 Mostrar resultados finales sincronizados
RF-052 Persistir partida abortada
RF-054 Correcciones del anfitrión
RF-055 Nueva partida posterior
RF-056 Historial
```

El estado concreto debe consultarse en:

```text
docs/current-status.md
```

---

# Requisitos previstos para etapas posteriores

Existen funcionalidades contempladas pero no prioritarias para el flujo multijugador actual.

Entre ellas:

- historial completo;
- estadísticas;
- mejoras visuales;
- centralización avanzada de errores;
- optimización del bundle;
- endurecimiento de seguridad de Firestore;
- mejoras adicionales de accesibilidad;
- posibles componentes reutilizables.

Estas funcionalidades no deben desplazar la prioridad actual:

```text
completar el flujo multijugador de una mano
```

---

# Trazabilidad con reglas del juego

Los requisitos funcionales relacionados con:

- cantidad de jugadores;
- juegos;
- compras;
- puntajes;
- penalizaciones;
- finalización;
- ganador;

deben mantenerse consistentes con:

```text
docs/game-rules.md
```

Si cambia una regla del juego, deben revisarse:

```text
game-rules.md
requirements.md
pruebas
código
```

---

# Trazabilidad con Firestore

Los requisitos relacionados con:

- persistencia;
- sincronización;
- IDs;
- manos;
- resultados;
- jugadores;

deben mantenerse consistentes con:

```text
docs/firestore-model.md
```

---

# Trazabilidad con arquitectura

Los requisitos no determinan obligatoriamente cómo debe implementarse cada funcionalidad.

La organización técnica actual se describe en:

```text
docs/architecture.md
```

Por ejemplo:

```text
Requisito:
Cada jugador registra su propio resultado.

Implementación actual prevista:
results/{playerId} en Firestore.
```

El requisito puede permanecer incluso si en el futuro cambia la tecnología de persistencia.

---

# Prioridad actual

La prioridad inmediata del proyecto es completar el flujo:

```text
Host finaliza mano
        ↓
hand-N = collecting_results
        ↓
todos los jugadores reciben el cambio
        ↓
cada jugador registra su propio resultado
        ↓
todos observan registrados/pendientes
        ↓
host confirma
        ↓
hand-N = completed
        ↓
avanza la partida
```

Este flujo debe considerarse prioritario antes de continuar con funcionalidades secundarias.

---

# Mantenimiento de este documento

Este archivo debe actualizarse cuando:

- se agregue un nuevo requisito;
- se elimine un requisito;
- cambie una regla funcional;
- cambie una restricción importante;
- se modifique un comportamiento esperado;
- se agregue una funcionalidad relevante al alcance.

Los avances diarios no deben registrarse aquí.

Para el estado actual se utiliza:

```text
docs/current-status.md
```

---

# Documentación relacionada

```text
docs/current-status.md
→ estado actual y siguiente paso

docs/game-rules.md
→ reglas del juego

docs/architecture.md
→ organización técnica

docs/firestore-model.md
→ modelo de persistencia

docs/git-workflow.md
→ estrategia de colaboración

docs/ux-flow.md
→ navegación y experiencia de usuario
```