import { AIAssistant } from "@/components/AIAssistant";

const CustomerAgent = () => (
  <AIAssistant
    title="Asistente del Cliente Core"
    subtitle="Pregunta sobre tu unidad, plan de pagos y avance de obra."
    suggestions={[
      "¿Cuándo es mi próximo pago y cuánto debo?",
      "¿Cuál es el avance de obra de mi proyecto?",
      "Busca el contrato de promesa de mi unidad",
      "Resume mi plan de pagos hasta la entrega",
    ]}
  />
);

export default CustomerAgent;
