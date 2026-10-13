# Control

Además del estado GSM de sus artefactos, cada caso tiene tres datos de control. No forman parte del dominio: dicen si el sistema puede actuar sobre el caso. Cómo se representan en cada servicio lo dice el adaptador de la Issue.

## Admisión

Un caso entra en el sistema cuando su Issue está admitida. Si no lo está, el motor ignora cualquier evento del caso. Si el humano retira la admisión, el sistema suelta el caso.

## Propiedad

Un caso admitido pertenece a un único sistema. Un sistema solo actúa sobre casos libres o propios. Si el caso está libre, el motor lo reclama antes de abrir ningún stage; si al reclamarlo descubre otro dueño, renuncia y no actúa. La propiedad dura todo el caso, y la libera el humano.

## Turno

Cuando el caso queda en quiescencia sin haber terminado, o cuando un stage falla, el motor cede el turno al humano y le dice qué espera de él y cómo devolverlo. Mientras el humano no lo devuelva, el motor no actúa sobre el caso aunque lleguen eventos. Al devolverlo, el motor reevalúa el caso con todo lo que el humano haya escrito. Si no encuentra nada nuevo, vuelve a cederle el turno. Tras un fallo, devolver el turno es reintentar.

## Peticiones directas

Un humano también puede dirigirse al sistema directamente, sin pasar por el servicio: «quiero hacer la issue #12», «he comentado en la issue X». Una petición directa sobre un caso lo admite si no lo estaba y, si el turno era del humano, se lo devuelve.

## Cuándo actúa el motor

Solo si el caso está admitido, es libre o propio, el turno no es del humano y no hay ningún stage abierto.
