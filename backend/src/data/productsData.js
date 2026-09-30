/**
 * Catálogo oficial de muebles artesanales de Hermanos Jota
 * Enriquecido con metadatos técnicos, categorías y especificaciones (Sprints 1, 2, 3 y 4)
 */
export const products = [
  {
    id: 1,
    nombre: "Aparador Uspallata",
    slug: "aparador-uspallata",
    descripcion: "Aparador de seis puertas fabricado en nogal sostenible con tiradores metálicos en acabado latón.",
    medidas: "180 x 45 x 75 cm",
    materiales: "Nogal macizo FSC®, herrajes de latón",
    precio: 850000,
    categoria: "Almacenamiento",
    imagen: "/assets/Aparador Uspallata.png",
    especificaciones: {
      "Medidas": "180 × 45 × 75 cm",
      "Materiales": "Nogal macizo FSC®, herrajes de latón",
      "Acabado": "Aceite natural ecológico",
      "Peso": "68 kg",
      "Capacidad": "6 compartimentos interiores"
    },
    enStock: true,
    tiempoEntrega: "Envío en 3 a 5 días hábiles"
  },
  {
    id: 2,
    nombre: "Biblioteca Recoleta",
    slug: "biblioteca-recoleta",
    descripcion: "Sistema modular de estantes abierto que combina estructura de acero Sage Green y repisas en roble claro.",
    medidas: "100 x 35 x 200 cm",
    materiales: "Estructura de acero, estantes de roble",
    precio: 620000,
    categoria: "Almacenamiento",
    imagen: "/assets/Biblioteca Recoleta.png",
    especificaciones: {
      "Medidas": "100 × 35 × 200 cm",
      "Materiales": "Estructura de acero, estantes de roble",
      "Acabado": "Laca mate ecológica",
      "Capacidad": "45 kg por estante",
      "Modulares": "5 estantes ajustables"
    },
    enStock: true,
    tiempoEntrega: "Envío en 4 a 7 días hábiles"
  },
  {
    id: 3,
    nombre: "Butaca Mendoza",
    slug: "butaca-mendoza",
    descripcion: "Butaca tapizada en bouclé Dusty Rose con base de madera de guatambú.",
    medidas: "80 x 75 x 85 cm",
    materiales: "Guatambú macizo, tela bouclé",
    precio: 480000,
    categoria: "Asientos",
    imagen: "/assets/Butaca Mendoza.png",
    especificaciones: {
      "Medidas": "80 × 75 × 85 cm",
      "Materiales": "Guatambú macizo, tela bouclé",
      "Acabado": "Cera vegetal, tapizado premium",
      "Tapizado": "Repelente al agua y manchas",
      "Confort": "Espuma alta densidad"
    },
    enStock: true,
    tiempoEntrega: "Envío en 2 a 4 días hábiles"
  },
  {
    id: 4,
    nombre: "Sillón Copacabana",
    slug: "sillon-copacabana",
    descripcion: "Sillón lounge en cuero cognac con base giratoria en acero Burnt Sienna.",
    medidas: "90 x 85 x 95 cm",
    materiales: "Cuero curtido vegetal, acero pintado",
    precio: 750000,
    categoria: "Asientos",
    imagen: "/assets/Sillón Copacabana.png",
    especificaciones: {
      "Medidas": "90 × 85 × 95 cm",
      "Materiales": "Cuero curtido vegetal, acero pintado",
      "Acabado": "Cuero anilina premium",
      "Rotación": "360° silenciosa y suave",
      "Garantía": "10 años en estructura"
    },
    enStock: true,
    tiempoEntrega: "Envío en 5 a 8 días hábiles"
  },
  {
    id: 5,
    nombre: "Mesa de Centro Araucaria",
    slug: "mesa-de-centro-araucaria",
    descripcion: "Mesa de centro con sobre circular de mármol Patagonia y base de tres patas en madera de nogal.",
    medidas: "90 x 90 x 45 cm",
    materiales: "Sobre de mármol Patagonia, patas de nogal",
    precio: 390000,
    categoria: "Mesas",
    imagen: "/assets/Mesa de Centro Araucaria.png",
    especificaciones: {
      "Medidas": "90 × 90 × 45 cm",
      "Materiales": "Sobre de mármol Patagonia, patas de nogal",
      "Acabado": "Mármol pulido, aceite natural en madera",
      "Peso": "42 kg",
      "Carga máxima": "25 kg distribuidos"
    },
    enStock: true,
    tiempoEntrega: "Envío en 3 a 5 días hábiles"
  },
  {
    id: 6,
    nombre: "Mesa de Noche Aconcagua",
    slug: "mesa-de-noche-aconcagua",
    descripcion: "Mesa de noche con cajón oculto y repisa inferior en roble certificado FSC®.",
    medidas: "45 x 35 x 60 cm",
    materiales: "Roble macizo FSC®, herrajes soft-close",
    precio: 280000,
    categoria: "Dormitorio",
    imagen: "/assets/Mesa de Noche Aconcagua.png",
    especificaciones: {
      "Medidas": "45 × 35 × 60 cm",
      "Materiales": "Roble macizo FSC®, herrajes soft-close",
      "Acabado": "Barniz mate de poliuretano",
      "Almacenamiento": "1 cajón + repisa inferior"
    },
    enStock: true,
    tiempoEntrega: "Envío en 2 a 3 días hábiles"
  },
  {
    id: 7,
    nombre: "Sofá Patagonia",
    slug: "sofa-patagonia",
    descripcion: "Sofá de tres cuerpos tapizado en lino Warm Alabaster con patas cónicas de madera.",
    medidas: "220 x 90 x 80 cm",
    materiales: "Madera de eucalipto certificada FSC®, Lino natural",
    precio: 1200000,
    categoria: "Asientos",
    imagen: "/assets/Sofá Patagonia.png",
    especificaciones: {
      "Medidas": "220 × 90 × 80 cm",
      "Estructura": "Madera de eucalipto certificada FSC®",
      "Tapizado": "Lino 100% natural premium",
      "Relleno": "Espuma HR + plumón reciclado",
      "Sostenibilidad": "Materiales 100% reciclables"
    },
    enStock: true,
    tiempoEntrega: "Envío en 7 a 10 días hábiles"
  },
  {
    id: 8,
    nombre: "Mesa Comedor Pampa",
    slug: "mesa-comedor-pampa",
    descripcion: "Mesa extensible de roble macizo con tablero biselado y sistema de apertura suave.",
    medidas: "160-240 x 90 x 75 cm",
    materiales: "Roble macizo FSC®, mecanismo alemán",
    precio: 950000,
    categoria: "Mesas",
    imagen: "/assets/Mesa Comedor Pampa.png",
    especificaciones: {
      "Medidas": "160-240 × 90 × 75 cm",
      "Materiales": "Roble macizo FSC®, mecanismo alemán",
      "Acabado": "Aceite-cera natural",
      "Capacidad": "6-10 comensales",
      "Extensión": "Sistema de mariposa central"
    },
    enStock: true,
    tiempoEntrega: "Envío en 5 a 7 días hábiles"
  },
  {
    id: 9,
    nombre: "Sillas Córdoba",
    slug: "sillas-cordoba",
    descripcion: "Set de cuatro sillas apilables en contrachapado moldeado de nogal.",
    medidas: "45 x 52 x 80 cm",
    materiales: "Contrachapado nogal, tubo de acero",
    precio: 340000,
    categoria: "Asientos",
    imagen: "/assets/Sillas Córdoba.png",
    especificaciones: {
      "Medidas": "45 × 52 × 80 cm (cada una)",
      "Materiales": "Contrachapado nogal, tubo de acero",
      "Acabado": "Laca mate, pintura epoxi",
      "Apilables": "Hasta 6 sillas",
      "Incluye": "Set de 4 sillas"
    },
    enStock: true,
    tiempoEntrega: "Envío en 3 a 5 días hábiles"
  },
  {
    id: 10,
    nombre: "Escritorio Costa",
    slug: "escritorio-costa",
    descripcion: "Escritorio compacto con cajón organizado y tapa pasacables integrada en bambú laminado.",
    medidas: "120 x 60 x 75 cm",
    materiales: "Bambú laminado, herrajes ocultos",
    precio: 510000,
    categoria: "Oficina",
    imagen: "/assets/Escritorio Costa.png",
    especificaciones: {
      "Medidas": "120 × 60 × 75 cm",
      "Materiales": "Bambú laminado, herrajes ocultos",
      "Acabado": "Laca mate resistente",
      "Almacenamiento": "1 cajón con organizador",
      "Cables": "Pasacables integrado"
    },
    enStock: true,
    tiempoEntrega: "Envío en 3 a 5 días hábiles"
  },
  {
    id: 11,
    nombre: "Silla de Trabajo Belgrano",
    slug: "silla-de-trabajo-belgrano",
    descripcion: "Silla ergonómica regulable en altura con respaldo de malla transpirable.",
    medidas: "60 x 60 x 90-100 cm",
    materiales: "Malla técnica, tejido reciclado",
    precio: 420000,
    categoria: "Oficina",
    imagen: "/assets/Silla de Trabajo Belgrano.png",
    especificaciones: {
      "Medidas": "60 × 60 × 90-100 cm",
      "Materiales": "Malla técnica, tejido reciclado",
      "Acabado": "Base cromada, tapizado premium",
      "Regulación": "Altura + inclinación respaldo",
      "Certificación": "Ergonomía europea EN 1335"
    },
    enStock: true,
    tiempoEntrega: "Envío en 2 a 4 días hábiles"
  }
];
