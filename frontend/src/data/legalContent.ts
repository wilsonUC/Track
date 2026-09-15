export interface LegalSection {
  id: string
  title: string
  content: string[]
  highlight?: string
}

export interface LegalDocument {
  title: string
  subtitle: string
  lastUpdated: string
  version: string
  summary: string
  sections: LegalSection[]
}

export const TERMINOS_CONDICIONES: LegalDocument = {
  title: 'Términos y Condiciones de Uso',
  subtitle: 'Condiciones generales de acceso y uso de la plataforma FinanzasTrack',
  lastUpdated: '15 de Septiembre de 2026',
  version: '1.2',
  summary:
    'Al registrarte y utilizar FinanzasTrack, aceptas cumplir con los presentes Términos de Servicio. Te recomendamos leerlos con atención para entender tus derechos, obligaciones y el alcance de las herramientas de inteligencia artificial.',
  sections: [
    {
      id: 'objeto',
      title: '1. Objeto y Alcance de la Plataforma',
      content: [
        'FinanzasTrack es una plataforma digital de gestión, planificación y seguimiento financiero personal y empresarial.',
        'La plataforma permite registrar transacciones (ingresos, gastos, ahorros), formular presupuestos, monitorear deudas y compromisos recurrentes, fijar metas de ahorro y consultar análisis automáticos mediante modelos de inteligencia artificial.',
      ],
    },
    {
      id: 'responsabilidad-ia',
      title: '2. Descargo de Responsabilidad del Asistente de IA',
      highlight:
        'Importante: El Asistente de IA y las recomendaciones financieras son herramientas exclusivamente informativas y de orientación orientativa.',
      content: [
        'FinanzasTrack integra modelos avanzados de procesamiento de lenguaje natural e inteligencia artificial para brindar diagnósticos, cálculos y sugerencias basados en la información proporcionada por el usuario.',
        'Dichos diagnósticos no constituyen asesoramiento financiero, tributario, contable ni legal profesional certificado.',
        'El usuario es el único responsable de las decisiones económicas, contratos de crédito o inversiones que decida ejecutar basadas directa o indirectamente en los reportes de la plataforma.',
      ],
    },
    {
      id: 'cuentas-planes',
      title: '3. Cuentas de Usuario, Planes y Vigencias',
      content: [
        'Para acceder a los servicios, el usuario debe crear una cuenta proporcionando datos verídicos y actualizados.',
        'FinanzasTrack ofrece distintos tipos de cuenta (Básico y Avanzado). Cada plan tiene asignadas cuotas de uso (por ejemplo, límites en mensajes diarios con la IA, acceso a metas vinculadas o recurrentes).',
        'Las cuentas pueden estar sujetas a fechas de vigencia o periodos de suscripción autorizados por el administrador. Al expirar dicho periodo, el acceso a las funciones interactivas se suspenderá hasta su renovación.',
      ],
    },
    {
      id: 'obligaciones-usuario',
      title: '4. Obligaciones y Seguridad del Usuario',
      content: [
        'El usuario se compromete a resguardar la confidencialidad de sus credenciales de acceso (contraseña, tokens o cuenta de Google vinculada).',
        'Queda estrictamente prohibido intentar vulnerar la seguridad de la plataforma, realizar ingeniería inversa, extraer datos de forma masiva no autorizada o utilizar el servicio para fines fraudulentos.',
      ],
    },
    {
      id: 'suspension',
      title: '5. Modificaciones y Suspensión del Servicio',
      content: [
        'Nos reservamos el derecho de actualizar o modificar estas condiciones en cualquier momento para adaptarlas a novedades legislativas o mejoras técnicas.',
        'FinanzasTrack podrá bloquear o cancelar temporal o definitivamente el acceso a aquellos usuarios que incumplan estos términos o utilicen la plataforma de manera indebida.',
      ],
    },
  ],
}

export const POLITICA_PRIVACIDAD: LegalDocument = {
  title: 'Política de Privacidad y Tratamiento de Datos',
  subtitle: 'Cómo protegemos, tratamos y salvaguardamos tu información financiera y personal',
  lastUpdated: '15 de Septiembre de 2026',
  version: '1.2',
  summary:
    'En FinanzasTrack la confidencialidad y protección de tus datos financieros es nuestra máxima prioridad. En este documento detallamos qué información recopilamos, con qué fin la utilizamos y cómo protegemos tu privacidad.',
  sections: [
    {
      id: 'datos-recopilados',
      title: '1. Datos que Recopilamos',
      content: [
        'Datos de Identificación y Contacto: Nombre, apellido, nombre de usuario, dirección de correo electrónico, número de teléfono y fotografía de perfil.',
        'Datos Financieros del Usuario: Registros de transacciones (ingresos, gastos, categorías, descripciones), metas de ahorro, presupuestos mensuales y compromisos recurrentes.',
        'Datos de Interacción con la IA: Historial de mensajes y consultas remitidas al asistente de inteligencia artificial dentro de la sesión activa.',
      ],
    },
    {
      id: 'finalidad',
      title: '2. Finalidad del Tratamiento de Datos',
      content: [
        'Gestionar la autenticación segura y el perfil personalizado del usuario.',
        'Calcular métricas en tiempo real, balances, gráficos de reportes, alertas de sobregasto y salud financiera.',
        'Permitir que el motor de IA analice tus patrones financieros para responder preguntas específicas sobre tu estado económico.',
      ],
    },
    {
      id: 'servicios-terceros',
      title: '3. Servicios y Procesadores Terceros',
      highlight:
        'Nunca vendemos ni comercializamos tus datos personales o financieros con terceros anunciantes.',
      content: [
        'Google OAuth: Si eliges registrarte o iniciar sesión con Google, recibimos tu identificador, nombre y correo electrónico bajo los protocolos seguros de Google.',
        'Procesamiento de IA (Groq / Modelos LLM): Las consultas dirigidas al asistente son procesadas mediante conexiones seguras cifradas exclusivamente para formular la respuesta solicitada.',
      ],
    },
    {
      id: 'seguridad-cifrado',
      title: '4. Seguridad y Almacenamiento',
      content: [
        'Implementamos cifrado en tránsito (HTTPS/TLS) y algoritmos criptográficos robustos para el almacenamiento de contraseñas.',
        'La autenticación se gestiona mediante tokens JWT de corta duración con rotación segura de refresh tokens.',
        'El usuario puede solicitar el reseteo completo de sus datos financieros o la eliminación de su cuenta desde el panel de perfil en cualquier momento.',
      ],
    },
    {
      id: 'derechos-usuario',
      title: '5. Derechos del Usuario (Acceso, Rectificación y Supresión)',
      content: [
        'Tienes derecho a acceder en cualquier momento a toda la información que mantienes registrada en tu cuenta.',
        'Puedes modificar tus datos de perfil, preferencias de tema, y eliminar transacciones de forma individual o masiva.',
        'Para dudas o solicitudes sobre tus datos personales, puedes contactar al equipo de administración a través de los canales oficiales de soporte.',
      ],
    },
  ],
}
