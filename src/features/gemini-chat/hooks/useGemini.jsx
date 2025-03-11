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
					text: "Hello! I'm Amelia, a chatbot. I'm here to help you create a quote for your chatbot. Please tell me more about your needs and requirements so I can offer you an appropriate quote. What kind of chatbot would you like to develop? Do you have any ideas about the functionalities it should have?",
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
					text: "It seems I am having trouble connecting to the servers.",
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
