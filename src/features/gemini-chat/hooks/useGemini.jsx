import { useEffect, useState } from "react";
import GeminiService from "../service/gemini.service";

export default function useGemini() {
  const [messages, updateMessage] = useState(checkForMessages());
  const [loading, setLoading] = useState(false);

  function checkForMessages() {
    const savedMessages = localStorage.getItem("messages");
    return savedMessages
      ? JSON.parse(savedMessages)
      : [
          {
            role: "user",
            parts: [
              {
                text: "",
              },
            ],
          },
          {
            role: "model",
            parts: [
              {
                text: "¡Hola! Soy Amelia, un chatbot. Estoy aquí para ayudarte a crear una cotización para tu chat bot. Por favor, dime más sobre tus necesidades y requerimientos para que pueda ofrecerte una cotización adecuada. ¿Qué tipo de Chatbot te gustaría desarrollar? ¿Tienes alguna idea de las funcionalidades que debería tener?",
              },
            ],
          },
        ];
  }

  useEffect(() => {
    const saveMessages = () =>
      localStorage.setItem("messages", JSON.stringify(messages));
    window.addEventListener("beforeunload", saveMessages);
    return () => window.removeEventListener("beforeunload", saveMessages);
  }, [messages]);

  const sendMessages = async (payload) => {
    updateMessage((prevMessages) => [
      ...prevMessages,
      { role: "model", parts: [{ text: "" }] },
    ]);
    setLoading(true);
    try {
      const stream = await GeminiService.sendMessages(
        payload.message,
        payload.history
      );
      setLoading(false);
      for await (const chunk of stream) {
        const chuckText = chunk.text();
        updateMessage((prevMessages) => {
          const prevMessageClone = structuredClone(prevMessages);
          prevMessageClone[prevMessages.length - 1].parts[0].text += chuckText;
          return prevMessageClone;
        });
      }
    } catch (error) {
      updateMessage([
        ...messages,
        {
          role: "model",
          parts: [
            {
              text: "Parece que tengo problemas para conectarme a los servidores.",
            },
          ],
        },
      ]);
      console.error("An error occurred:", error);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendMessages, updateMessage };
}
