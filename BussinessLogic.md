Este documento está diseñado para ser leído por stakeholders, socios o cualquier persona interesada en entender *qué* es el proyecto, *cómo* funciona a nivel operativo y *para quién* está diseñado, eliminando toda la jerga técnica de desarrollo.

***

# Documento de Propuesta Estratégica y Lógica de Negocio
## Proyecto: Plataforma de Adopción "HogarPeludo"

---

### 1. Propósito y Visión

**HogarPeludo** nace con el objetivo fundamental de centralizar, dignificar y acelerar el proceso de adopción de animales de compañía, inicialmente enfocado en la ciudad de **Pasto, Colombia**.

La plataforma busca resolver la desconexión existente entre las fundaciones locales que están saturadas, los animales invisibles que necesitan un hogar, y las personas dispuestas a adoptar o donar pero que no saben dónde acudir con confianza.

**Nuestra misión es triple:**
1.  **Para los Animales:** Darles visibilidad a través de perfiles dignos y emotivos para reducir sus tiempos de estancia en refugios.
2.  **Para las Fundaciones:** Proveer herramientas digitales gratuitas para gestionar sus rescatados y un canal validado para recibir donaciones.
3.  **Para la Comunidad:** Ser el punto de referencia confiable, tierno y alegre para encontrar un nuevo miembro de la familia o apoyar la causa animalista en Pasto.

---

### 2. Identidad y Experiencia del Usuario

La plataforma se aleja de la estética triste o excesivamente urgente que a veces caracteriza al sector. "HogarPeludo" se enfoca en la **esperanza, la alegría de una nueva vida y la confianza**.

* **Tono de Voz:** Cercano, tierno, optimista pero siempre responsable y transparente.
* **Estética Visual:** Un diseño "blando" y amable, utilizando colores cálidos (amarillos/naranjas suaves) y frescos (azules cielo) que inviten a navegar sin generar ansiedad.
* **Enfoque Geográfico:** Hiper-localizado en Pasto para garantizar que las adopciones y el apoyo sean logísticamente viables y fomenten la comunidad local.

#### 🐾 Narrativa Inversa: "Los Animales Adoptan Humanos"

Un diferenciador clave de HogarPeludo es el **enfoque narrativo inverso**. En lugar de presentar a los animales como seres pasivos esperando ser "elegidos", les damos voz y protagonismo. **Son ellos quienes buscan a su humano ideal**.

**¿Por qué este enfoque?**
- Humaniza la experiencia y crea una conexión emocional más profunda.
- Reduce la percepción de "compra" o "selección de producto".
- Genera curiosidad y engagement con frases inesperadas.
- Refuerza el mensaje de que adoptar es un compromiso mutuo.

**Ejemplos de comunicación:**

| Contexto | Mensaje Tradicional | Mensaje HogarPeludo |
|----------|---------------------|---------------------|
| Ficha del animal | "Luna está en adopción" | "¡Hola! Estoy buscando a mi humano perfecto" |
| CTA principal | "Solicitar adopción" | "Postúlate para que Luna te adopte" |
| Requisitos | "Requisitos de adopción" | "Lo que busco en mi futuro humano" |
| Estado en proceso | "En proceso de adopción" | "Ya estoy conociendo a alguien especial" |
| WhatsApp | "Contactar fundación" | "Háblale a mi cuidador" |
| Favoritos | "Agregar a favoritos" | "¿Te robé el corazón?" |

**Tono en las fichas de animales:**
- Los animales "hablan" en primera persona.
- Cuentan su propia historia con personalidad.
- Expresan qué tipo de familia buscan.
- Usan frases como: "Mi corazón tiene espacio para ti", "¿Serás tú quien complete mi manada?"

---

### 3. Roles de Usuario y Permisos

El ecosistema de HogarPeludo se compone de cuatro actores clave, cada uno con permisos y objetivos distintos:

#### A. Visitante Público (Sin Registro)
Cualquier persona que entra a la web. Queremos que la barrera de entrada sea mínima.
* **Qué puede hacer:** Navegar libremente por todo el catálogo de animales, usar filtros (especie, edad, tamaño), leer las historias de los animales y ver los perfiles públicos de las fundaciones aliadas.
* **Limitación clave:** No puede guardar favoritos ni iniciar procesos formales dentro de la plataforma sin registrarse.

#### B. Adoptante Potencial (Usuario Registrado)
Un visitante que ha creado una cuenta (con email básico) para interactuar más a fondo.
* **Qué puede hacer:** Todo lo del visitante público, más la capacidad de guardar animales en su lista de "Favoritos" y gestionar sus datos de contacto básicos para agilizar futuras solicitudes.

#### C. Fundación / Rescatista Aliado (Rol Verificado)
Organizaciones o rescatistas independientes de Pasto que han pasado un filtro de seguridad. Son los proveedores del "contenido" (animales).
* **Qué puede hacer:** Acceder a un panel privado para crear, editar y actualizar el estado de los perfiles de sus animales (ej. marcar como "Adoptado"). Gestionar su perfil público de fundación y sus enlaces de donación.
* **Requisito:** Deben ser aprobados manualmente antes de poder publicar.

#### D. Administrador de la Plataforma (Superusuario)
El garante de la confianza en HogarPeludo.
* **Qué puede hacer:** Su función principal es auditar. Recibe las solicitudes de nuevas fundaciones, revisa su documentación/credenciales y las aprueba o rechaza. Tiene la capacidad de moderar contenido si es necesario.

---

### 4. Flujos Principales de Funcionamiento (Lógica de Negocio)

#### Flujo 1: El Camino de la Adopción (Customer Journey)

Este es el proceso central y se ha diseñado para equilibrar la velocidad de contacto con la necesidad de formalidad.

1.  **Descubrimiento:** El usuario (público o registrado) navega el catálogo filtrando por sus preferencias (ej. "Perro pequeño en Pasto").
2.  **Conexión Emocional:** El usuario entra al perfil de un animal específico ("Max"), ve sus fotos de alta calidad y lee su historia.
3.  **Punto de Decisión de Contacto (Doble Vía):** En la ficha del animal, ofrecemos dos caminos claros para reducir la fricción:
    * **Vía Rápida (WhatsApp):** Un botón prominente permite contactar directamente al WhatsApp de la fundación encargada del animal. Esto facilita la inmediatez que muchos usuarios buscan.
    * **Vía Formal (Plataforma):** Un segundo botón permite "Iniciar Proceso Formal". Esto requiere registro y ayuda a la fundación a llevar un seguimiento más ordenado dentro del sistema.

#### Flujo 2: Incorporación de Fundaciones (Onboarding)

Para garantizar la seguridad de los adoptantes y donantes, las fundaciones no pueden registrarse y publicar inmediatamente.

1.  **Solicitud:** Una fundación se registra e indica que quiere un perfil de "Organización".
2.  **Verificación:** Deben completar un formulario con datos que validen su labor en Pasto (ej. RUT, redes sociales activas, referencias).
3.  **Aprobación Manual:** El Administrador de la plataforma revisa la solicitud.
4.  **Activación:** Si se aprueba, la fundación recibe el rol verificado, una insignia de confianza en su perfil público, y acceso a su panel de control para empezar a subir animales y recibir donaciones.

#### Flujo 3: Canalización de Donaciones

HogarPeludo no procesa dinero directamente en una primera etapa, sino que actúa como un puente de confianza.

1.  El usuario navega al directorio de "Fundaciones Aliadas".
2.  Solo las fundaciones previamente verificadas por el Administrador aparecen aquí.
3.  En el perfil de la fundación, existen botones claros de donación que redirigen a los canales oficiales y seguros de cada organización (ej. su Nequi, Daviplata, cuenta bancaria o Vaki propio).
    * *Valor:* La plataforma valida que ese canal de donación pertenece legítimamente a una fundación real en Pasto.

---

### 5. Resumen de Valor

HogarPeludo no es solo un catálogo de fotos; es un **ecosistema de confianza** diseñado para eliminar las barreras que impiden que los animales en Pasto encuentren un hogar, facilitando las conexiones correctas de la manera más tierna y eficiente posible.