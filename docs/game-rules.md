# Reglas del juego Telefunken

## Propósito de este documento

Este documento define las reglas del Telefunken que utiliza la aplicación.

Su objetivo es establecer una referencia única para:

- nombres de los juegos;
- orden de los juegos;
- compras;
- penalizaciones;
- finalización de una mano;
- finalización de una partida;
- comportamiento del repartidor;
- diferencias entre modo ordenado y modo libre;
- representación de puntajes.

Este documento describe las reglas funcionales que la aplicación debe respetar.

La forma en que estas reglas se implementan técnicamente se documenta en:

```text
docs/architecture.md
```

El modelo persistente se documenta en:

```text
docs/firestore-model.md
```

El estado actual del desarrollo se documenta en:

```text
docs/current-status.md
```

---

# Cantidad de jugadores

Una partida debe tener como mínimo:

```text
2 jugadores
```

y como máximo:

```text
6 jugadores
```

La aplicación no debe permitir iniciar una partida fuera de este rango.

---

# Orden de los jugadores

Los jugadores deben organizarse según su posición física alrededor de la mesa.

El primer jugador de la lista será el primer repartidor.

El orden establecido antes de iniciar la partida representa el orden de juego.

Una vez iniciada la partida, este orden debe mantenerse salvo una corrección explícita del anfitrión.

---

# Rotación del repartidor

Después de cada mano el repartidor rota hacia la derecha.

La rotación ocurre independientemente de:

- quién ganó la mano;
- quién se quedó sin cartas;
- si se agotó la pila;
- si algún jugador completó un juego;
- si la mano produjo una penalización.

Conceptualmente:

```text
dealerIndex
0 → 1 → 2 → 3 → 0
```

según la cantidad de jugadores.

---

# Juegos disponibles

La aplicación utiliza exactamente los siguientes juegos:

```text
1/3
2/3
1/4
2/4
1/5
2/5
ESC
```

Significado:

```text
1/3 → Un trío
2/3 → Dos tríos
1/4 → Un cuarto
2/4 → Dos cuartos
1/5 → Un quinto
2/5 → Dos quintos
ESC → Escalera
```

La aplicación no debe utilizar nombres alternativos como:

```text
cuarteto
quinteto
```

La nomenclatura oficial del proyecto será:

```text
cuarto
quinto
```

---

# Modos de juego

La aplicación soporta dos modalidades:

```text
ordenado
libre
```

Ambas utilizan los mismos siete juegos, pero cambian:

- el orden;
- las compras;
- la condición de finalización;
- la forma de registrar penalizaciones.

---

# Modo ordenado

En modo ordenado los juegos deben completarse exactamente en este orden:

```text
1/3
2/3
1/4
2/4
1/5
2/5
ESC
```

Todos los jugadores realizan el mismo juego en cada mano.

Ejemplo:

```text
Mano 1 → todos juegan 1/3
Mano 2 → todos juegan 2/3
Mano 3 → todos juegan 1/4
...
```

---

# Compras en modo ordenado

Cada jugador dispone de:

```text
12 compras
```

para toda la partida.

Las compras utilizadas no se recuperan.

---

## Primera mano

En la primera mano:

```text
1/3
```

no se permiten compras.

Por tanto:

```text
purchasesUsed = 0
```

para todos los jugadores.

La interfaz no necesita mostrar el campo de compras durante esta mano.

---

# Finalización del modo ordenado

La partida ordenada termina después de completar los siete juegos.

Cada jugador tendrá resultados correspondientes a:

```text
1/3
2/3
1/4
2/4
1/5
2/5
ESC
```

El ganador es el jugador con:

```text
menor puntaje acumulado
```

---

# Modo libre

En modo libre los jugadores pueden completar los siete juegos en cualquier orden.

No existe un juego obligatorio común para todos durante una mano.

Cada jugador puede completar un juego diferente.

Ejemplo:

```text
Beto → 1/3
Mel → ESC
Techi → 1/5
```

durante la misma mano.

---

# Compras en modo libre

Cada jugador dispone de:

```text
7 compras
```

para toda la partida.

Las compras utilizadas no se recuperan.

---

# Juegos pendientes en modo libre

Cada jugador debe completar una sola vez cada uno de los siete juegos.

Después de completar un juego, este deja de estar disponible para ese jugador.

Ejemplo:

```text
Beto completó 1/3
```

Entonces en futuras manos:

```text
1/3
```

ya no puede seleccionarse para Beto.

---

# Penalizaciones en modo libre

Si un jugador no completa ningún juego pendiente durante una mano, los puntos de las cartas que conserva se registran como penalización.

Conceptualmente:

```text
completedGameCode = null
```

La penalización no completa ningún juego.

---

# Penalizaciones independientes

Cada penalización corresponde a una mano específica.

No debe mostrarse únicamente una penalización acumulada.

Ejemplo:

```text
Juego 1/3      20
Juego 2/3
Juego 1/4      10

                45
                30
```

Los valores:

```text
45
30
```

representan dos penalizaciones diferentes ocurridas en manos distintas.

No deben fusionarse en:

```text
75
```

como una sola fila.

---

# Representación visual de juegos pendientes

En modo libre un juego que todavía no ha sido completado debe mostrarse como:

```text
celda vacía
```

No debe mostrarse:

```text
0
—
```

porque esos valores significan que el juego ya fue completado.

---

# Juego completado con cero puntos

Si un jugador completa un juego y termina la mano con:

```text
0 puntos
```

la aplicación debe representar visualmente ese resultado como:

```text
—
```

Esto significa:

```text
juego completado
+
0 puntos
```

No significa juego pendiente.

---

# Juego completado con puntos

Si un jugador completa un juego y conserva cartas con valor:

```text
25
```

el resultado del juego será:

```text
25
```

El juego se considera completado aunque el jugador no haya sido quien terminó la mano.

---

# Diferencia entre completar un juego y cerrar la mano

Completar el juego requerido y quedarse sin cartas no son la misma cosa.

Un jugador puede:

```text
completar su juego
```

pero continuar con cartas en la mano.

Si otro jugador se queda sin cartas primero:

```text
la mano termina
```

y el jugador que ya había completado su juego registra como puntaje el valor de las cartas que todavía conserva.

Ejemplo:

```text
Mel completó 1/4
pero conserva cartas por 35 puntos

resultado:
1/4 = 35
```

El juego se considera completado.

---

# Jugador que se queda sin cartas

Si un jugador se queda sin cartas:

```text
points = 0
```

La representación visual es:

```text
—
```

La mano termina inmediatamente.

---

# Formas de finalizar una mano

Una mano puede finalizar por dos causas.

---

## Jugador sin cartas

Código utilizado por la aplicación:

```text
player_out
```

Ocurre cuando un jugador se queda sin cartas.

La mano termina inmediatamente.

---

## Agotamiento de la pila

Código utilizado por la aplicación:

```text
draw_pile_exhausted
```

Ocurre cuando se agota la pila de robo según las reglas definidas para la partida.

---

# Reutilización del descarte

Cuando se termina la pila de robo, el descarte puede reutilizarse como nueva pila.

Se permite como máximo:

```text
2 reutilizaciones
```

Después de agotar nuevamente la pila tras esas reutilizaciones, la mano termina.

La aplicación no necesita modelar carta por carta este proceso.

Solo necesita conocer al final:

```text
endReason = draw_pile_exhausted
```

---

# La aplicación no modela las cartas

El sistema no controla:

- qué cartas tiene cada jugador;
- qué carta roba;
- qué carta descarta;
- si una combinación es válida carta por carta;
- si una compra física se realizó correctamente;
- cuántas cartas quedan en la pila en cada momento.

La aplicación funciona como:

```text
registro de partida
+
control de resultados
+
control de compras
+
validación grupal
```

La ejecución física del juego continúa ocurriendo en la mesa.

---

# Compras físicas y digitales

Las compras se manejan de forma híbrida.

Durante la partida:

```text
se utilizan fichas físicas
```

Al terminar la mano:

```text
cada jugador informa cuántas compras utilizó
```

La aplicación actualiza las compras restantes.

Las compras registradas digitalmente sirven como control y persistencia.

---

# Resultado por jugador y mano

Cada jugador debe tener exactamente un resultado por mano.

Un resultado contiene conceptualmente:

```text
playerId
completedGameCode
points
purchasesUsed
```

En modo libre:

```text
completedGameCode = null
```

cuando el resultado corresponde a penalización.

---

# Una mano no puede avanzar incompleta

La aplicación no debe permitir avanzar a la siguiente mano si falta el resultado de algún jugador.

Ejemplo:

```text
3 jugadores
2 resultados
→ no puede avanzar
```

Solo cuando exista:

```text
3 jugadores
3 resultados
```

puede continuar el flujo.

---

# Causa de finalización única

El motivo de finalización pertenece a toda la mano.

No debe existir un motivo distinto por jugador.

Ejemplo:

```text
hand-3
endReason = player_out
```

Todos los resultados pertenecen a esa misma mano.

---

# Responsabilidad del anfitrión

El anfitrión tiene responsabilidades especiales durante la partida.

Solo el anfitrión puede:

- finalizar una mano en la aplicación;
- indicar cómo terminó;
- confirmar los resultados cuando todos hayan registrado;
- avanzar a la siguiente mano;
- realizar correcciones cuando sea necesario;
- finalizar forzosamente una partida.

Los demás jugadores registran únicamente su propio resultado.

---

# Registro individual

Cada jugador debe registrar su propio resultado desde su dispositivo.

Ejemplo:

```text
Beto
→ registra resultado de Beto

Mel
→ registra resultado de Mel
```

Un jugador normal no debe registrar resultados de otros jugadores.

---

# Validación colectiva

Después de registrar resultados, todos los jugadores deben poder observar la información registrada.

Esto permite validar colectivamente los datos antes de avanzar.

Ejemplo:

```text
Beto   ✓ Registrado
Mel    ✓ Registrado
Techi  ⏳ Pendiente
```

Una vez registrados todos, el anfitrión puede confirmar.

---

# Correcciones

El anfitrión debe poder corregir errores.

Entre las correcciones previstas se encuentran:

- puntaje;
- compras utilizadas;
- juego completado;
- penalización;
- información registrada después del cierre.

La corrección no debe implicar crear un segundo resultado para el mismo jugador.

Debe actualizarse el resultado existente.

---

# Límites de puntaje

La aplicación acepta resultados entre:

```text
0
```

y:

```text
999
```

El objetivo es limitar la entrada a un máximo de tres dígitos.

Un valor:

```text
1000
```

debe considerarse inválido.

---

# Finalización del modo libre

La partida libre termina cuando al menos un jugador completa los siete juegos.

No termina necesariamente:

- después de siete manos;
- cuando se terminan las compras;
- cuando todos completan siete juegos.

La condición principal es:

```text
al menos un jugador completa los siete juegos
```

---

# Un único jugador completa los siete juegos

Si durante una mano un solo jugador completa su séptimo juego:

```text
ese jugador gana
```

La partida termina al finalizar esa mano.

---

# Varios jugadores completan el séptimo juego en la misma mano

Puede ocurrir que varios jugadores completen sus siete juegos durante la misma mano.

En ese caso:

```text
solo se consideran esos jugadores
```

y gana quien tenga:

```text
menor puntaje acumulado
```

entre ellos.

---

# Jugadores que no completaron siete juegos

Si la partida libre termina porque otro jugador completó sus siete juegos, los jugadores que todavía tengan juegos pendientes:

- conservan sus resultados registrados;
- conservan sus penalizaciones;
- no se consideran ganadores.

---

# Compras agotadas en modo libre

Quedarse sin compras:

```text
no termina la partida
```

El jugador simplemente continúa sin posibilidad de comprar.

La partida sigue hasta que alguien complete los siete juegos.

---

# Representación de la tabla en modo ordenado

La tabla debe mostrar las siete filas de juego:

```text
1/3
2/3
1/4
2/4
1/5
2/5
ESC
```

No necesita filas de penalización independientes.

Cada mano corresponde al juego obligatorio de esa fila.

---

# Representación de la tabla en modo libre

La tabla debe mostrar primero:

```text
1/3
2/3
1/4
2/4
1/5
2/5
ESC
```

Después de estas filas pueden aparecer las penalizaciones.

Las penalizaciones:

- aparecen como filas independientes;
- no llevan nombres como `Penal 1`, `Penal 2`;
- mantienen vacía la columna del juego;
- representan eventos diferentes.

Al final debe mostrarse:

```text
TOTAL
```

---

# Total del jugador

El total corresponde a la suma de:

```text
puntajes de juegos completados
+
penalizaciones
```

El total se utiliza para:

- determinar ganador en modo ordenado;
- desempatar entre jugadores que completen el séptimo juego simultáneamente en modo libre;
- mostrar el estado acumulado de la partida.

---

# Compras restantes visibles

Durante la partida debe ser posible consultar las compras restantes de cada jugador.

Ejemplo:

```text
Beto: 8
Mel: 10
Techi: 7
```

Esto sirve como referencia estratégica durante el juego.

---

# Mano actual visible

La interfaz debe indicar:

```text
Mano N
```

En modo ordenado también debe poder determinarse el juego actual correspondiente.

---

# Repartidor visible

La interfaz debe mostrar quién reparte la mano actual.

Ejemplo:

```text
Reparte
Mel
```

---

# Inicio de partida

Antes de iniciar:

- debe haber entre 2 y 6 jugadores;
- debe estar definido el orden;
- debe existir un anfitrión;
- debe seleccionarse una modalidad.

Cuando comienza:

```text
currentHand = 1
dealerIndex = 0
```

---

# Estado de partida

Los estados generales utilizados por la aplicación son:

```text
lobby
in_progress
finished
aborted
```

---

# Estado `lobby`

Significa que la partida todavía no ha comenzado.

Durante este estado es posible:

- ingresar;
- salir;
- reordenar jugadores;
- cambiar configuraciones permitidas;
- transferir host si este abandona.

---

# Estado `in_progress`

Significa que la partida está activa.

En este estado:

- no se agregan nuevos jugadores normalmente;
- se juegan manos;
- se registran resultados;
- se controlan compras;
- se rota el repartidor.

---

# Estado `finished`

Significa que la partida terminó normalmente según las reglas.

La información debe conservarse.

---

# Estado `aborted`

Significa que el anfitrión interrumpió la partida antes de su finalización normal.

La partida debe conservarse como interrumpida.

No debe tratarse igual que una partida nunca iniciada.

---

# Eliminación de una partida antes de comenzar

Si la partida todavía está en:

```text
lobby
```

y el último jugador abandona:

```text
la partida puede eliminarse
```

porque nunca comenzó.

---

# Partida iniciada

Después de pasar a:

```text
in_progress
```

la partida no debe eliminarse simplemente porque un jugador abandone o exista un error.

Debe conservarse su historial.

---

# Reglas que no están automatizadas

La aplicación no pretende arbitrar completamente la partida.

No verifica:

- combinaciones físicas de cartas;
- secuencia real de descartes;
- comportamiento de otros jugadores;
- validez de una compra física en el momento exacto;
- conteo carta por carta.

La aplicación confía en:

```text
validación colectiva de los jugadores
```

y en el anfitrión para correcciones.

---

# Principios funcionales del proyecto

## 1. La tabla permanece como centro del juego

La información acumulada debe ser visible para ayudar a la estrategia.

---

## 2. Las entradas deben ser simples

Cada jugador debe registrar únicamente lo necesario al final de la mano.

---

## 3. Se minimizan confirmaciones innecesarias

No se deben pedir confirmaciones para operaciones comunes.

Las confirmaciones deben reservarse principalmente para acciones destructivas o importantes.

---

## 4. Los datos son visibles para todos

Después de guardarse, los resultados deben poder ser vistos por todos los jugadores.

---

## 5. El anfitrión coordina, pero no registra por todos

El host administra el flujo.

Cada jugador mantiene la responsabilidad de registrar su propio resultado.

---

# Diferencia entre regla del juego y decisión de aplicación

Este documento contiene reglas que la aplicación debe respetar, pero algunas decisiones pertenecen específicamente al diseño del sistema.

Ejemplo de regla:

```text
En modo ordenado existen 12 compras.
```

Ejemplo de decisión de aplicación:

```text
Cada jugador registra su propio resultado desde su teléfono.
```

La segunda no necesariamente forma parte de las reglas tradicionales del juego, pero sí es una regla funcional del sistema.

Ambas se documentan aquí cuando afectan directamente la experiencia de juego.

Los detalles técnicos de implementación pertenecen a:

```text
docs/architecture.md
```

---

# Reglas que deben mantenerse consistentes en código

Las siguientes reglas son especialmente sensibles y cualquier cambio debe reflejarse en pruebas y documentación:

```text
2–6 jugadores

7 juegos exactos

12 compras en ordenado

7 compras en libre

sin compras en 1/3 ordenado

cada juego se completa una sola vez en libre

penalizaciones independientes

0 puntos = juego completado con guion

celda vacía = juego pendiente

solo el host cierra y avanza la mano

todos los jugadores deben registrar antes de continuar

modo libre termina cuando alguien completa los siete juegos
```

---

# Mantenimiento de este documento

Este documento debe actualizarse cuando cambie:

- una regla del Telefunken utilizada por la app;
- una condición de finalización;
- una cantidad de compras;
- una regla de puntaje;
- una condición de ganador;
- la forma funcional de registrar resultados;
- una restricción importante del flujo de juego.

Los cambios puramente técnicos deben registrarse en:

```text
docs/architecture.md
```

Los cambios del modelo persistente deben registrarse en:

```text
docs/firestore-model.md
```

El progreso del desarrollo debe actualizarse en:

```text
docs/current-status.md
```

---

# Documentación relacionada

```text
docs/current-status.md
→ estado actual del proyecto

docs/architecture.md
→ arquitectura técnica

docs/firestore-model.md
→ modelo de datos

docs/requirements.md
→ requisitos completos

docs/git-workflow.md
→ estrategia Git/GitHub

docs/ux-flow.md
→ flujo de pantallas
```