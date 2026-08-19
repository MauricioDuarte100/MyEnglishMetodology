export interface ScenarioChoice {
    text: string;
    englishDraft: string;
    isOptimal: boolean;
    feedback: string;
    vocabularyUsed: string[];
    score: number;
}

export interface ScenarioStep {
    id: number;
    speaker: string;
    context: string;
    dialogue: string;
    question: string;
    choices: ScenarioChoice[];
}

export interface Scenario {
    id: string;
    title: string;
    difficulty: string;
    category: string;
    briefing: string;
    targetSkills: string[];
    steps: ScenarioStep[];
}

export const PROFESSIONAL_SCENARIOS: Scenario[] = [
    {
        id: "incident-response",
        title: "Respuesta a Incidente Crítico de Ciberseguridad",
        difficulty: "Intermedio - Avanzado (B2-C1)",
        category: "Tech & Cybersecurity",
        briefing: "Son las 3:15 AM. La infraestructura de base de datos de producción registra picos de exfiltración no autorizada de credenciales. El VP de Ingeniería te convoca al canal de emergencia.",
        targetSkills: ["Asertividad técnica", "Mitigación de riesgos", "Precisión bajo presión"],
        steps: [
            {
                id: 1,
                speaker: "Alex (VP of Engineering)",
                context: "Canal #war-room-incident en Slack / Teams",
                dialogue: "We are seeing anomalous outbound traffic on the primary database cluster. Is this a confirmed breach or a misconfigured batch job? What is our immediate containment strategy?",
                question: "¿Cómo comunicas la situación con claridad técnica y calma profesional?",
                choices: [
                    {
                        text: "Confirmar contención inmediata con aislamiento de red y recopilación de evidencias forenses.",
                        englishDraft: "We have isolated the affected database instances from the public subnet to contain potential exfiltration. We are currently analyzing the audit logs to determine the blast radius.",
                        isOptimal: true,
                        feedback: "Excelente uso de terminología precisa (blast radius, isolate, contain, audit logs) y tono asertivo sin pánico.",
                        vocabularyUsed: ["blast radius", "isolate", "contain", "audit logs"],
                        score: 100
                    },
                    {
                        text: "Decir que no estás seguro y pedir que todos apaguen sus computadoras.",
                        englishDraft: "I am not sure, maybe someone hacked us. We should turn off all company computers right now.",
                        isOptimal: false,
                        feedback: "Genera pánico, carece de vocabulario técnico estructurado y propone una medida desproporcionada sin análisis.",
                        vocabularyUsed: ["hacked", "turn off"],
                        score: 20
                    },
                    {
                        text: "Decir que lo revisarás mañana por la mañana.",
                        englishDraft: "I will look into the logs tomorrow morning when the rest of the team is awake.",
                        isOptimal: false,
                        feedback: "Inaceptable para un incidente de severidad 1. Demuestra falta de sentido de urgencia.",
                        vocabularyUsed: ["look into"],
                        score: 0
                    }
                ]
            },
            {
                id: 2,
                speaker: "Sarah (Head of Legal & Compliance)",
                context: "Llamada de coordinación de crisis",
                dialogue: "If customer PII (Personally Identifiable Information) was compromised, we have a strict 72-hour window for regulatory disclosure under GDPR. Can we definitively state what data was accessed?",
                question: "¿Cómo respondes sin especular y manteniendo el rigor legal y técnico?",
                choices: [
                    {
                        text: "Aclarar que los datos de pago estaban cifrados en reposo y que se emitirá un reporte preliminar en 2 horas.",
                        englishDraft: "All sensitive fields are encrypted at rest with AES-256. We cannot definitively confirm the extent of exfiltration yet, but our forensic triage report will be finalized within two hours.",
                        isOptimal: true,
                        feedback: "Respuesta impecable: destaca controles de seguridad existentes (encrypted at rest), evita promesas infundadas y fija un plazo concreto para el triage.",
                        vocabularyUsed: ["encrypted at rest", "forensic triage", "definitively confirm"],
                        score: 100
                    },
                    {
                        text: "Garantizar que nadie robó nada porque tienes un antivirus instalado.",
                        englishDraft: "Do not worry, we have antivirus so definitely no customer data was stolen.",
                        isOptimal: false,
                        feedback: "Respuesta ingenua y técnicamente incorrecta que expondría a la empresa a graves sanciones regulatorias.",
                        vocabularyUsed: ["antivirus", "stolen"],
                        score: 10
                    },
                    {
                        text: "Decir que el equipo de DevOps tuvo la culpa por una mala configuración.",
                        englishDraft: "This is DevOps fault because they changed the firewall rules yesterday without testing.",
                        isOptimal: false,
                        feedback: "Cultura de culpa improductiva (*finger-pointing*) en medio de una respuesta a incidentes.",
                        vocabularyUsed: ["fault", "firewall rules"],
                        score: 30
                    }
                ]
            }
        ]
    },
    {
        id: "high-stakes-standup",
        title: "Daily Standup de Alta Presión & Bloqueos",
        difficulty: "Intermedio (B1-B2)",
        category: "Agile & Product Delivery",
        briefing: "El sprint cierra en 48 horas. Una dependencia externa de API de pagos no funciona y pone en riesgo el release hacia producción. El Product Manager y el Scrum Master exigen un plan.",
        targetSkills: ["Explicación de blockers", "Compromiso de entrega", "Propuesta de mitigación alternativa"],
        steps: [
            {
                id: 1,
                speaker: "Marcus (Product Manager)",
                context: "Daily Standup en Zoom",
                dialogue: "Team, the checkout redesign is our top deliverable for Q3. We cannot push this release back. Are we still on track to ship by Thursday afternoon?",
                question: "¿Cómo planteas el bloqueo técnico y ofreces una alternativa inmediata?",
                choices: [
                    {
                        text: "Explicar el bloqueo con la API de terceros y proponer un feature flag o fallback temporal.",
                        englishDraft: "We are currently blocked by the third-party payment gateway latency. To stay on track for Thursday, I propose shipping behind a feature flag with the existing fallback mechanism enabled.",
                        isOptimal: true,
                        feedback: "Demuestra mentalidad de solución (*solution-oriented*), vocabulario ágil preciso (feature flag, fallback mechanism, blocked by) y protege la fecha de release.",
                        vocabularyUsed: ["feature flag", "fallback mechanism", "blocked by", "latency"],
                        score: 100
                    },
                    {
                        text: "Decir que sí está todo listo aunque sabes que no funciona.",
                        englishDraft: "Yes, totally on track! No problem at all, everything will be perfect on Thursday.",
                        isOptimal: false,
                        feedback: "Falta de transparencia (*dishonesty*) que causará una caída en producción el día del lanzamiento.",
                        vocabularyUsed: ["on track", "perfect"],
                        score: 0
                    },
                    {
                        text: "Decir que es imposible y que cancelen el sprint.",
                        englishDraft: "It is completely impossible. We should just cancel the release and do nothing until next month.",
                        isOptimal: false,
                        feedback: "Tono derrotista y no colaborativo sin alternativas técnicas.",
                        vocabularyUsed: ["impossible", "cancel"],
                        score: 25
                    }
                ]
            }
        ]
    },
    {
        id: "salary-negotiation",
        title: "Negociación de Oferta Salarial y Beneficios Remotos",
        difficulty: "Intermedio - Avanzado (B2)",
        category: "Career & Negotiation",
        briefing: "Has superado 4 rondas de entrevistas técnicas para una empresa de software de San Francisco. El reclutador te ofrece 95k USD, pero tu objetivo de mercado es 115k USD más presupuesto para setup remoto.",
        targetSkills: ["Negociación diplomática", "Justificación basada en valor", "Manejo de contraofertas"],
        steps: [
            {
                id: 1,
                speaker: "Elena (Talent Acquisition Lead)",
                context: "Llamada de oferta de trabajo",
                dialogue: "We were extremely impressed by your system design interview. We would love to extend an offer at $95,000 base salary. How does that align with your expectations?",
                question: "¿Cómo expresas entusiasmo mientras abres espacio para negociar con datos de mercado?",
                choices: [
                    {
                        text: "Agradecer la oferta, resaltar el entusiasmo y presentar la contraoferta respaldada por el impacto y el rango de mercado.",
                        englishDraft: "Thank you for the offer; I am genuinely excited about the team vision. Based on my experience in distributed systems and current market benchmarks for this role, I was targeting a base salary closer to $115,000. Is there flexibility on the base or equity package?",
                        isOptimal: true,
                        feedback: "Tono diplomático perfecto: valida el interés, fundamenta la cifra en valor y benchmarks de mercado, y deja la puerta abierta para negociar acciones o bonos.",
                        vocabularyUsed: ["market benchmarks", "genuinely excited", "flexibility", "equity package"],
                        score: 100
                    },
                    {
                        text: "Aceptar inmediatamente la primera oferta sin negociar.",
                        englishDraft: "Yes, $95,000 is fine, I will sign whatever you send right now.",
                        isOptimal: false,
                        feedback: "Pierdes la oportunidad de negociar un 20% más que el mercado y la empresa suelen tener presupuestado.",
                        vocabularyUsed: ["fine", "sign"],
                        score: 40
                    },
                    {
                        text: "Ofenderte y decir que esa oferta es un insulto.",
                        englishDraft: "That is way too low and insulting for someone with my skillset. Give me 130k or I walk.",
                        isOptimal: false,
                        feedback: "Agresivo y poco profesional; puede resultar en que la empresa rescinda la oferta.",
                        vocabularyUsed: ["insulting", "walk"],
                        score: 10
                    }
                ]
            }
        ]
    }
];
