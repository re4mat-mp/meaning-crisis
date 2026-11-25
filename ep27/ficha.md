# Ep. 27 · Formulación de problemas

**Video:** https://www.youtube.com/watch?v=9j5O-tnaFzE · 54 min

## La idea en una frase

Si inteligencia es resolver problemas, hay un obstáculo enorme: la **explosión combinatoria** (*combinatorial explosion*). No podés buscar en todo el espacio de posibilidades, así que tu mente tiene que "apuntar" sola a lo relevante: eso es *relevance realization*, el hilo que va a recorrer el resto de la serie. Vervaeke corrige a Newell y Simon: no todos los problemas son iguales, y en los mal definidos la clave es **cómo los formulás**.

## El argumento, paso a paso

1. **Repaso: el problema como espacio** [03:02–05:17]. Inteligencia = ser un *general problem solver*. Un problema tiene *initial state*, *goal state*, *operators* y *path constraints*; resolverlo es hallar una secuencia de operaciones que respete las restricciones. Pero ese diagrama se ve desde el punto de vista de Dios; adentro de un problema no sabés qué camino sirve.
2. **Combinatorial explosion** [05:58–09:37]. Los caminos posibles son F^D (operadores por etapa, elevado al número de etapas). En ajedrez: ~30 jugadas legales y ~60 turnos dan ~4,29 × 10^88 caminos [06:36–07:43]. Más que las conexiones sinápticas y que los átomos del universo: no podés buscar en todo el espacio, ni "revisando y descartando".
3. **La clave: zero in** [09:37–13:03]. Lo que hacés es meterte en una subsección diminuta del espacio y a menudo hallás solución ahí. Eso es ***relevance realization***: "realizás" lo que es relevante. Se vive como *obviousness* y *salience*, y no son estáticas: podés reestructurarlas (los nueve puntos) [12:15–13:03]. Es también el problema central de la IA general [13:03].
4. **Heurísticas vs. algoritmos** [14:40–20:48]. Distinción de Pólya que usan Newell y Simon. Un **algoritmo** garantiza una solución o prueba que no existe (es la norma de la *certeza*) [15:21]; para garantizarlo hay que recorrer todo el espacio, y eso es "suicidio cognitivo" [16:57]. De ahí que el proyecto de Descartes estuviera condenado: no podés volverte Spock [17:46]. Lógica y matemática son algorítmicas, así que ser racional ≠ ser lógico: es saber **cuándo, dónde, cuánto y cómo** ser lógico (y usar otras *psychotechnologies*) para vencer el autoengaño [18:41–19:46].
5. **El precio de las heurísticas** [20:48–24:02]. Una **heurística** no garantiza nada: solo sube tus chances, porque *prejuzga* dónde buscar (de ahí "prejuicio"). Ejemplo: "controlá el centro" en ajedrez, y un rival hábil te mantiene fijo ahí [21:44]. Es el *no free lunch theorem*: tenés que usarlas y caés en sesgos [22:29]; lo adaptativo te hace propenso al autoengaño.
6. **Por qué Newell y Simon son un modelo de buena ciencia** [24:51–32:46]. Analizan (como Tales), formalizan (como Descartes) y mecanizan: si una máquina lo hace, no colaste nada. Así evitan la **explicación circular** (el *homunculus*, regreso infinito) [26:37–28:06]. Es el ***naturalistic imperative***: explicar lo mental con términos no mentales [29:04]. Si funciona, la visión científica deja de excluirnos como generadores de ciencia [31:38].
7. **Su error: el esencialismo** [33:43–39:56]. Asumieron que todos los problemas son esencialmente iguales: bastaba una estrategia y la formulación era trivial. Era el **essentialism**, una heurística psicológica: suponer que lo agrupado comparte una esencia (el triángulo, el oro la tienen) [34:49–35:37]. Pero no todo la tiene: no hay definición de "juego" que incluya a todos los juegos y solo a ellos (Wittgenstein) [35:37–37:24]. El esencialismo es adaptativo, pero no algorítmico [37:24].
8. **Problemas bien y mal definidos** [39:56–44:49]. En un *well-defined problem* tenés buenas representaciones del estado inicial, el final y los operadores (una multiplicación). Tu educación te entrena en eso y por eso no ves la formulación. Pero casi todos tus problemas son *ill-defined*: "tomar buenos apuntes" no te dice qué información importa ni qué operaciones usar [42:20–43:54]. Lo que falta es **problem formulation**: apuntar a la información relevante.
9. **El tablero mutilado** [46:44–52:30]. Un tablero de ajedrez de 64 casillas, con dos esquinas opuestas quitadas (quedan 62): ¿se cubre con 31 dominós sin superponer ni sobrar? Formulado como **covering** (imaginar configuraciones), explota: un participante matemático trabajó 16 a 18 horas, 81 páginas, sin resolverlo [47:34–49:24]. Con **parity**, se vuelve *salient* que las casillas quitadas son del mismo color y cada dominó cubre una blanca y una negra: es imposible [50:14–51:38]. El espacio colapsa.
10. **Insight es reformular** [52:30–53:38]. *Insight* es el proceso que convierte una formulación mala en una buena. Por eso es central a la racionalidad, junto con la lógica; hacen falta otras *psychotechnologies* para el *insight*, quizás la *mindfulness*.

## Conceptos nuevos (están en el glosario)

combinatorial explosion · relevance realization · obviousness · heuristic vs. algorithm · no free lunch theorem · naturalistic imperative · essentialism · well-defined vs. ill-defined problems · problem formulation · mutilated chessboard (covering vs. parity)

## Para pensar (preguntas de estudio)

1. ¿Por qué no sirve "revisar y descartar" contra la explosión combinatoria? ¿Qué hacés en cambio?
2. ¿Por qué ser racional no es ser lógico, y qué tiene que ver eso con el fracaso del proyecto de Descartes?
3. ¿Por qué una heurística te hace adaptativo y a la vez propenso al sesgo?
4. ¿Qué asumieron mal Newell y Simon, y por qué importa la formulación?
5. Pensá en un tema de Ableton o del japonés en que estuviste atascado: ¿cambió algo cuando lo reformulaste, como pasar de *covering* a *parity*?

## Conecta con

- **Ep. 26** (Ciencia cognitiva): retoma la inteligencia como *general problem solver* y el *problem space*, y confirma lo que ahí se anunciaba: sigue con sus propiedades.
- **Ep. 22** (Descartes contra Hobbes): ahí aparece la certeza lógica vs. psicológica; acá explica por qué buscar certeza algorítmica es suicidio cognitivo.
- **Ep. 7** (Aristóteles y Fromm): la *rationality* como capacidad de detectar tu autoengaño, no solo ser lógico; acá se vuelve a eso con el argumento de la explosión combinatoria.
- **Ep. 1** (Introducción) y **Ep. 9** (Insight): los nueve puntos y el *insight* como romper el marco; acá se redefine como reformular el problema.
- **Ep. 13** (budismo y procesamiento parasitario): ahí aparecen las heurísticas de representatividad y disponibilidad; acá las explica como el precio de evitar la explosión combinatoria.
- **Ep. 28** (Convergencia hacia la relevance realization): anuncia que sigue con la relevance realization en inteligencia, categorización, acción y comunicación.
