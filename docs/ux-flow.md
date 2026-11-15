# Flujo de experiencia de usuario

## Propósito de este documento

Este documento describe el flujo de navegación y comportamiento de la interfaz de la aplicación Telefunken.

Su objetivo es permitir que cualquier desarrollador pueda comprender:

- qué pantallas existen;
- qué propósito cumple cada pantalla;
- cómo se navega entre ellas;
- qué acciones puede realizar el anfitrión;
- qué acciones puede realizar un jugador normal;
- qué información debe mostrarse;
- qué cambios deben ocurrir automáticamente;
- cómo se comporta la aplicación durante una partida;
- cómo se representa visualmente el estado del juego.

Este documento se enfoca en la experiencia y navegación.

Las reglas del juego se documentan en:

```text
docs/game-rules.md
```

Los requisitos se documentan en:

```text
docs/requirements.md
```

La arquitectura técnica se documenta en:

```text
docs/architecture.md
```

El estado actual del desarrollo se documenta en:

```text
docs/current-status.md
```

---

# Principio general de experiencia

La aplicación está diseñada para utilizarse mientras los jugadores participan físicamente en una partida de Telefunken.

Por esta razón la interfaz debe priorizar:

- rapidez;
- claridad;
- pocos pasos;
- uso desde teléfono;
- tabla visible;
- información estratégica accesible;
- mínima interrupción del juego físico.

La aplicación no pretende convertirse en el juego.

Funciona como:

```text
registro
+
seguimiento
+
control
+
validación
```

---

# Flujo general

El flujo principal esperado es:

```text
Inicio
  ↓
Crear partida
o
Unirse a partida
  ↓
Lobby
  ↓
Inicio de partida
  ↓
Tabla de juego
  ↓
Finalizar mano
  ↓
Registro individual
  ↓
Validación grupal
  ↓
Siguiente mano
  ↓
...
  ↓
Resultados finales
```

También puede existir una salida alternativa:

```text
Partida activa
  ↓
Finalización forzada
  ↓
Partida abortada
```

---

# Pantalla de inicio

La pantalla inicial funciona como punto de entrada a la aplicación.

Debe permitir:

- crear una nueva partida;
- ingresar a una partida existente;
- acceder posteriormente al historial.

---

# Contenido esperado del inicio

Elementos principales:

```text
TELEFUNKEN
```

Frase:

```text
Lleva la cuenta. Tú concéntrate en jugar.
```

Acciones principales:

```text
Crear partida
Unirme a una partida
Historial
```

El historial puede permanecer deshabilitado o pendiente mientras no esté implementado.

---

# Crear partida

Al seleccionar:

```text
Crear partida
```

el usuario accede a la pantalla de creación.

Debe poder:

- ingresar el nombre del anfitrión;
- seleccionar modalidad;
- crear la partida;
- volver al inicio.

---

# Campos de creación

La pantalla debe permitir ingresar:

```text
Nombre del anfitrión
```

y elegir:

```text
Ordenado
Libre
```

---

# Creación exitosa

Cuando la partida se crea correctamente:

```text
se genera código
        ↓
se crea partida
        ↓
se crea jugador host
        ↓
se guarda sesión local
        ↓
se muestra lobby
```

El usuario no debe tener que ingresar nuevamente a su propia partida.

---

# Unirse a partida

Desde el inicio, un jugador puede ingresar los cuatro dígitos del código.

Visualmente puede mostrarse:

```text
TELE- 4821
```

El usuario escribe únicamente:

```text
4821
```

La aplicación reconstruye:

```text
TELE-4821
```

---

# Validación del código

Si el código no existe:

se debe mostrar un mensaje comprensible.

Ejemplo:

```text
No se encontró una partida con ese código.
```

No debe mostrarse únicamente un error técnico.

---

# Pantalla de ingreso de nombre

Si el código es válido:

el jugador debe ingresar su nombre.

La pantalla puede mostrar:

- código;
- modalidad;
- información básica de la partida;
- campo de nombre;
- botón para unirse;
- botón para volver.

---

# Validación del nombre

El sistema debe evitar nombres duplicados dentro de la misma partida.

La comparación debe considerar nombres equivalentes independientemente de mayúsculas y minúsculas.

Ejemplo:

```text
Beto
BETO
beto
```

deben considerarse equivalentes para evitar confusión.

---

# Ingreso exitoso

Después de unirse:

```text
se genera playerId
        ↓
se guarda jugador
        ↓
se guarda sesión
        ↓
se muestra lobby
```

---

# Lobby

El lobby funciona como sala de espera y configuración antes de comenzar.

Debe mostrar al menos:

- código;
- modalidad;
- anfitrión;
- cantidad de jugadores;
- jugadores ordenados.

---

# Lista de jugadores

La lista debe reflejar el orden físico de la mesa.

El primer jugador representa inicialmente al primer repartidor.

El orden debe ser fácil de entender visualmente.

---

# Vista del anfitrión en lobby

El anfitrión puede ver controles adicionales.

Debe poder:

- mover jugadores hacia arriba;
- mover jugadores hacia abajo;
- eliminar jugadores;
- cambiar configuraciones permitidas;
- iniciar la partida.

---

# Vista de jugador normal en lobby

El jugador normal debe poder:

- visualizar el orden;
- identificar al anfitrión;
- visualizar modalidad;
- esperar el inicio;
- abandonar el lobby.

No debe ver controles administrativos innecesarios.

---

# Indicador de anfitrión

El anfitrión debe estar identificado visualmente.

Ejemplo:

```text
Beto
Anfitrión
```

o mediante un badge equivalente.

---

# Reordenamiento

El anfitrión debe poder ajustar el orden antes de iniciar.

Ejemplo:

```text
Beto
Mel
Techi
```

puede pasar a:

```text
Mel
Beto
Techi
```

Todos los dispositivos deben actualizarse automáticamente.

---

# Eliminación de jugador

Si el anfitrión elimina a un jugador:

```text
Firestore cambia
        ↓
todos reciben actualización
```

El dispositivo del jugador eliminado debe detectar que ya no pertenece a la partida.

Debe regresar a una pantalla segura, normalmente inicio.

---

# Salida voluntaria

Mientras la partida esté en lobby, un jugador puede salir.

Si no es host:

```text
se elimina únicamente ese jugador
```

Si es host:

```text
se transfiere el host
```

Si era el último jugador:

```text
la partida puede eliminarse
```

---

# Inicio de partida

Solo el anfitrión puede iniciar.

Cuando inicia:

```text
status = in_progress
```

Todos los dispositivos deben recibir el cambio automáticamente.

No debe ser necesario:

```text
recargar
volver al inicio
ingresar nuevamente
```

---

# Transición automática a la mesa

El flujo debe ser:

```text
Host pulsa Iniciar
        ↓
Firestore cambia
        ↓
todos detectan status = in_progress
        ↓
todos muestran la mesa
```

---

# Pantalla principal de juego

La mesa es la pantalla principal durante la partida.

Debe concentrar la mayor cantidad posible de información relevante sin obligar al usuario a navegar continuamente.

---

# Encabezado de la mesa

Debe mostrar:

```text
Telefunken
Modalidad
Mano actual
Repartidor
```

Ejemplo:

```text
Telefunken
Juego libre · Mano 1

Reparte
Beto
```

---

# Compras restantes

Debe mostrarse el número de compras disponibles por jugador.

Ejemplo:

```text
Beto: 7
Mel: 7
Techi: 7
```

En la primera mano del modo ordenado también debe indicarse que las compras no están permitidas.

---

# Tabla de resultados

La tabla debe incluir una columna fija:

```text
Juego
```

y una columna por jugador.

Ejemplo:

```text
Juego | Beto | Mel | Techi
```

---

# Filas de juegos

Las filas principales son:

```text
1/3
2/3
1/4
2/4
1/5
2/5
ESC
```

---

# Modo ordenado en la tabla

En modo ordenado:

- todos juegan el mismo juego;
- la fila correspondiente a la mano actual debe resaltarse.

Ejemplo:

```text
Mano 3
→ 1/4 resaltado
```

---

# Modo libre en la tabla

En modo libre:

- cada jugador puede completar juegos distintos;
- los juegos pendientes quedan vacíos;
- las penalizaciones aparecen debajo de los siete juegos.

---

# Penalizaciones visuales

Las penalizaciones deben mostrarse como filas independientes.

La columna izquierda debe permanecer vacía.

Ejemplo:

```text
        | 45 |    | 30
        |    | 20 |
```

No deben utilizarse etiquetas como:

```text
Penal 1
Penal 2
```

---

# Representación de puntajes

La tabla debe distinguir:

```text
celda vacía
→ juego pendiente

—
→ juego completado con 0 puntos

25
→ juego completado con 25 puntos
```

---

# Total

Al final debe mostrarse:

```text
TOTAL
```

con el acumulado de cada jugador.

---

# Desplazamiento horizontal

Cuando existan demasiados jugadores para el ancho disponible:

```text
la tabla debe permitir scroll horizontal
```

La columna:

```text
Juego
```

debe permanecer fija cuando sea posible.

---

# Identificación del jugador actual

En una evolución posterior de interfaz, conviene destacar visualmente la columna del jugador correspondiente al dispositivo.

Ejemplo:

```text
Teléfono de Mel
→ columna Mel resaltada
```

Esto facilita identificar rápidamente dónde debe mirar.

---

# Botón Finalizar mano

Durante una partida activa:

solo el anfitrión debe ver la acción:

```text
Finalizar mano
```

---

# Vista de jugador normal durante la mano

Un jugador normal no debe ver un botón que no puede utilizar.

Puede mostrarse un mensaje como:

```text
Esperando a que el anfitrión finalice la mano.
```

Esto comunica claramente qué está ocurriendo.

---

# Botón Finalizar partida

La finalización forzada debe estar reservada al anfitrión.

Como es una operación destructiva o importante:

debe utilizar confirmación.

---

# Modal de cierre de mano

Cuando el anfitrión pulsa:

```text
Finalizar mano
```

debe abrirse un modal.

Debe preguntar:

```text
¿Cómo terminó la mano?
```

Opciones:

```text
Un jugador se quedó sin cartas

Se agotó la pila de robo
```

---

# Confirmación del cierre

Al confirmar:

```text
hand-N
status = collecting_results
```

No debe avanzarse todavía a la siguiente mano.

---

# Error en cierre de mano

Si no se selecciona una causa:

debe mostrarse un mensaje dentro del modal.

Ejemplo:

```text
Selecciona cómo terminó la mano.
```

No debe cerrarse el modal.

---

# Transición a registro de resultados

Cuando la mano entra en:

```text
collecting_results
```

todos los dispositivos deben cambiar automáticamente al flujo de registro.

No debe ser necesario que cada jugador pulse:

```text
Finalizar mano
```

---

# Pantalla de registro individual

Cada dispositivo debe mostrar únicamente el formulario correspondiente a su jugador.

Ejemplo:

```text
Resultado de Beto
```

en el dispositivo de Beto.

Y:

```text
Resultado de Mel
```

en el dispositivo de Mel.

---

# Registro en modo ordenado

En modo ordenado el formulario debe mostrar el juego actual.

Ejemplo:

```text
Juego
1/4
```

El jugador debe ingresar:

- puntos;
- compras utilizadas, cuando estén permitidas.

---

# Primera mano ordenada

Para:

```text
1/3
```

no debe mostrarse un control editable de compras.

La aplicación utiliza:

```text
0 compras
```

automáticamente.

---

# Registro en modo libre

En modo libre el formulario debe preguntar:

```text
¿Completaste un juego?
```

Opciones:

```text
Sí
No
```

---

# Si completó juego

Si selecciona:

```text
Sí
```

se debe habilitar un selector.

Este debe mostrar únicamente juegos pendientes del jugador.

Ejemplo:

```text
1/4
1/5
ESC
```

---

# Si no completó juego

Si selecciona:

```text
No
```

el resultado se interpreta como penalización.

El selector de juego debe:

- deshabilitarse;
- limpiar una selección previa.

---

# Campo de puntos

Debe aceptar únicamente valores válidos entre:

```text
0
999
```

Debe evitar entradas claramente inválidas.

---

# Campo de compras

Debe permitir registrar las compras utilizadas durante la mano.

No debe aceptar:

- valores negativos;
- más compras de las disponibles.

---

# Guardar resultado

Al guardar:

el resultado debe asociarse a:

```text
currentPlayerId
```

No debe crearse un resultado para otro jugador.

---

# Resultado ya registrado

Después de guardar correctamente:

el jugador debe poder reconocer que su resultado fue recibido.

Puede mostrarse un estado como:

```text
Resultado registrado
```

---

# Estado de validación grupal

Todos los jugadores deben poder ver quién ya registró.

Ejemplo:

```text
Beto   ✓ Registrado
Mel    ✓ Registrado
Techi  ⏳ Pendiente
```

---

# Jugador pendiente

Mientras falte al menos uno:

el flujo no puede avanzar.

El anfitrión debe ver claramente que todavía existen pendientes.

---

# Todos registrados

Cuando todos hayan registrado:

```text
todos ✓
```

el anfitrión debe poder continuar.

---

# Vista del anfitrión en validación

El anfitrión debe disponer de una acción equivalente a:

```text
Confirmar resultados y continuar
```

El botón debe permanecer:

```text
deshabilitado
```

mientras falten resultados.

---

# Vista de jugador normal en validación

Un jugador normal debe ver los resultados y el estado del grupo.

No debe tener permiso para avanzar.

Puede mostrarse:

```text
Esperando confirmación del anfitrión.
```

---

# Corrección de resultados

El anfitrión debe poder corregir resultados cuando exista un error.

La interfaz de corrección debe permitir identificar:

- jugador;
- puntaje;
- compras;
- juego;
- penalización.

La corrección debe modificar el resultado existente.

---

# Confirmación del host

Después de revisar:

```text
Confirmar resultados y continuar
```

debe:

- validar el conjunto;
- completar la mano;
- avanzar la partida.

---

# Transición a siguiente mano

El flujo esperado es:

```text
host confirma
      ↓
hand.status = completed
      ↓
currentHand aumenta
      ↓
dealerIndex rota
      ↓
Firestore actualiza
      ↓
todos vuelven automáticamente a la mesa
```

---

# Retorno automático

Los jugadores no deben tener que pulsar:

```text
Volver
```

para regresar a la mesa después de una confirmación normal.

El cambio debe producirse mediante sincronización.

---

# Persistencia visual después de recargar

Si un jugador recarga durante:

```text
lobby
```

debe regresar al lobby.

Si recarga durante:

```text
in_progress
```

debe regresar al flujo correspondiente.

Si existe una mano:

```text
collecting_results
```

deberá volver al flujo de resultados y no simplemente a la tabla.

Esta recuperación completa forma parte del flujo objetivo.

---

# Fin de partida ordenada

Después de la última mano:

la aplicación debe detectar la finalización.

Debe pasar a resultados finales.

---

# Fin de partida libre

Cuando uno o más jugadores completen los siete juegos:

la aplicación debe finalizar después de confirmar esa mano.

---

# Pantalla de resultados finales

Debe mostrar al menos:

- ganador;
- puntajes;
- resultados acumulados;
- posibilidad de revisar la tabla.

---

# Revisar tabla final

Debe existir una acción equivalente a:

```text
Ver partida
```

o:

```text
Volver a la tabla
```

La tabla final debe ser de solo lectura.

---

# Nueva partida

Después de terminar, debe existir una acción equivalente a:

```text
Nueva partida
```

La intención funcional es reutilizar los jugadores y crear una nueva partida.

La integración completa todavía está pendiente.

---

# Partida abortada

Cuando el anfitrión finaliza forzosamente:

debe mostrarse una pantalla diferenciada.

Debe comunicar que:

```text
la partida fue interrumpida
```

y no que terminó normalmente.

---

# Revisar partida abortada

Debe ser posible revisar los resultados existentes hasta el momento de la interrupción.

La información debe permanecer en modo lectura.

---

# Confirmaciones

La aplicación debe minimizar confirmaciones.

No deben utilizarse para acciones frecuentes como:

- guardar un resultado normal;
- cambiar de pantalla;
- ingresar datos comunes.

---

# Acciones que sí pueden requerir confirmación

Ejemplos:

```text
Finalizar partida
Eliminar información importante
Acciones destructivas
```

---

# Mensajes de error

Los errores deben mostrarse cerca del contexto donde ocurren cuando sea posible.

Ejemplo:

```text
modal de cierre
→ error dentro del modal
```

en lugar de utilizar siempre:

```text
alert()
```

---

# Mensajes técnicos

Errores técnicos pueden registrarse mediante:

```javascript
console.error()
```

Esto sirve para desarrollo.

No sustituye el mensaje visible para el usuario.

---

# Estados de espera

Cuando una acción dependa de otro jugador, la interfaz debe explicarlo.

Ejemplos:

```text
Esperando a que el anfitrión finalice la mano.

Esperando resultados de otros jugadores.

Esperando confirmación del anfitrión.
```

Esto evita que el usuario interprete la pantalla como bloqueada o dañada.

---

# Comportamiento responsive

La aplicación se diseña principalmente para teléfono.

Debe funcionar correctamente también en:

- tablet;
- computador.

---

# Uso en teléfono

En móvil se debe priorizar:

- botones suficientemente grandes;
- campos fáciles de completar;
- poco texto innecesario;
- scroll controlado;
- tabla legible;
- formularios cortos.

---

# Tabla en móvil

Con 5 o 6 jugadores es aceptable utilizar:

```text
scroll horizontal
```

No debe intentarse comprimir todas las columnas hasta volverlas ilegibles.

---

# Bootstrap

La interfaz utiliza Bootstrap como base.

Se priorizan componentes como:

- botones;
- formularios;
- modales;
- alerts;
- badges;
- tablas;
- utilidades de espaciado;
- utilidades responsive.

El CSS personalizado debe utilizarse únicamente donde Bootstrap no cubra bien la necesidad.

---

# Flujo de anfitrión

Resumen:

```text
Inicio
  ↓
Crear partida
  ↓
Lobby
  ↓
Ordenar jugadores
  ↓
Iniciar
  ↓
Mesa
  ↓
Finalizar mano
  ↓
Seleccionar causa
  ↓
Registrar su resultado
  ↓
Esperar a todos
  ↓
Confirmar
  ↓
Mesa siguiente
  ↓
...
  ↓
Resultados finales
```

---

# Flujo de jugador invitado

Resumen:

```text
Inicio
  ↓
Ingresar código
  ↓
Ingresar nombre
  ↓
Lobby
  ↓
Esperar inicio
  ↓
Mesa
  ↓
Esperar cierre del host
  ↓
Registrar su resultado
  ↓
Esperar a los demás
  ↓
Esperar confirmación del host
  ↓
Mesa siguiente
  ↓
...
  ↓
Resultados finales
```

---

# Flujo de cierre de mano completo

```text
Todos están en la mesa
        ↓
termina la mano físicamente
        ↓
host pulsa Finalizar mano
        ↓
host selecciona endReason
        ↓
hand-N = collecting_results
        ↓
todos pasan a registro
        ↓
cada uno guarda su resultado
        ↓
todos ven estado de registro
        ↓
todos registrados
        ↓
host confirma
        ↓
hand-N = completed
        ↓
se avanza
        ↓
todos regresan a la mesa
```

---

# Flujo de recuperación esperado

Si el navegador se recarga:

```text
loadSession()
      ↓
recuperar partida
      ↓
consultar estado
      ↓
determinar pantalla
```

Casos:

```text
status = lobby
→ lobby

status = in_progress
sin mano collecting_results
→ mesa

status = in_progress
con hand-N collecting_results
→ registro / validación

status = finished
→ resultados finales

status = aborted
→ partida interrumpida
```

---

# Consistencia entre dispositivos

Dos jugadores en la misma partida deben visualizar el mismo estado general.

Ejemplo:

si Beto está en:

```text
Mano 3
Reparte Mel
```

Mel no debería permanecer en:

```text
Mano 2
Reparte Beto
```

salvo por un retraso breve de sincronización.

---

# Información local específica

Algunas diferencias entre dispositivos son correctas.

Ejemplo:

```text
Teléfono de Beto
→ formulario de Beto

Teléfono de Mel
→ formulario de Mel
```

La partida es compartida, pero la identidad del dispositivo es individual.

---

# Acciones por rol

## Anfitrión

Puede:

```text
administrar lobby
iniciar
finalizar mano
seleccionar causa
registrar su resultado
confirmar mano
corregir resultados
abortar partida
```

## Jugador

Puede:

```text
unirse
abandonar lobby
ver partida
registrar su resultado
ver resultados
esperar avance
```

---

# Principios UX del proyecto

## 1. La tabla es el centro

La tabla debe seguir siendo la principal referencia visual.

---

## 2. Menos navegación

No debe obligarse al usuario a recorrer múltiples pantallas para consultar información básica.

---

## 3. Una acción por responsabilidad

Cada jugador registra su resultado.

El host coordina.

---

## 4. Mostrar el estado actual

El usuario debe comprender siempre:

```text
qué está ocurriendo
qué debe hacer
qué está esperando
```

---

## 5. Evitar ambigüedad

No utilizar una celda vacía y un cero para representar la misma cosa.

---

## 6. Evitar controles sin permiso

Si un jugador no puede realizar una acción, normalmente es mejor no mostrar el botón.

---

## 7. Sincronización automática

Los usuarios no deberían depender de:

```text
F5
```

para continuar el flujo normal.

---

## 8. Confirmaciones mínimas

Las confirmaciones se reservan para acciones significativas.

---

## 9. Responsive antes que compacto

Es preferible permitir desplazamiento antes que hacer ilegible la información.

---

# Estado actual del UX

Actualmente están implementadas o parcialmente implementadas:

```text
Inicio
Crear partida
Unirse
Lobby
Sincronización de jugadores
Inicio sincronizado
Tabla de juego
Compras visibles
Repartidor
Finalizar mano solo para host
Modal de causa de cierre
Creación de hand-N collecting_results
Resultados finales locales
Partida abortada local
```

Todavía falta completar de extremo a extremo:

```text
transición automática a registro individual
formulario por jugador
sincronización de resultados
estado registrados/pendientes
confirmación host
avance sincronizado
finalización sincronizada
aborto persistente
nueva partida persistente
historial
```

El estado exacto debe consultarse en:

```text
docs/current-status.md
```

---

# Próximo flujo UX a implementar

La próxima experiencia que debe construirse es:

```text
Host crea hand-N collecting_results
        ↓
todos los dispositivos detectan
        ↓
cada dispositivo muestra
formulario de su jugador
        ↓
jugador guarda
        ↓
pantalla muestra registrados/pendientes
```

Este es el siguiente punto de continuidad del desarrollo.

---

# Mantenimiento de este documento

Este archivo debe actualizarse cuando cambie de forma importante:

- una pantalla;
- una transición;
- una acción por rol;
- una regla de navegación;
- un comportamiento responsive;
- una interacción relevante;
- una representación visual importante.

Los detalles técnicos de implementación pertenecen a:

```text
docs/architecture.md
```

Los requisitos formales pertenecen a:

```text
docs/requirements.md
```

El estado actual pertenece a:

```text
docs/current-status.md
```

---

# Documentación relacionada

```text
docs/current-status.md
→ estado actual y siguiente paso

docs/requirements.md
→ requisitos del sistema

docs/game-rules.md
→ reglas del juego

docs/architecture.md
→ arquitectura técnica

docs/firestore-model.md
→ persistencia

docs/git-workflow.md
→ estrategia de colaboración
```