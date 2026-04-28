import { AIAssistant } from "@/components/AIAssistant";

const InvestorAgent = () => (
  <AIAssistant
    title="Agente Financiero Core"
    subtitle="Pregunta sobre tu portafolio, distribuciones, proyectos y documentos."
    suggestions={[
      "¿Cuál es mi ROI actual y cuánto he recibido en distribuciones?",
      "Resume el avance de obra de mis proyectos",
      "Busca en mis documentos las cláusulas sobre retornos preferentes",
      "¿Cuándo es mi próxima distribución estimada?",
    ]}
  />
);

export default InvestorAgent;
