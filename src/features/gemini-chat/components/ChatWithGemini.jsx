import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import useGemini from "../hooks/useGemini";
import styles from "./ChatWithGemini.module.css";

const ChatWithGemini = () => {
	const { messages, loading, sendMessages, updateMessage } = useGemini();
	const [input, setInput] = useState("");

	const AlwaysScrollToBottom = () => {
		const elementRef = useRef();
		useEffect(() =>
			elementRef.current.scrollIntoView({
				behavior: "smooth",
				block: "start",
				inline: "nearest",
			}),
		);
		return <div ref={elementRef} />;
	};

	const handleSend = async () => {
		if (!input) return;
		setInput("");
		updateMessage([...messages, { role: "user", parts: [{ text: input }] }]);
		sendMessages({ message: input, history: messages });
	};

	return (
		<>
			<div className={styles.container}>
				<div className={styles.messages}>
					{messages.length > 0 ? (
						messages.map((message, index) => (
							<RenderMessage
								loading={loading}
								key={`chat-message-${index}-${message.role}`}
								messageLength={messages.length}
								message={message}
								msgIndex={index}
							/>
						))
					) : (
						<Introduction />
					)}
					<AlwaysScrollToBottom />
				</div>
			</div>
			<div className={styles.messageInputContainer}>
				<textarea
					placeholder="Type a message"
					value={input || ""}
					rows="3"
					className={styles.textarea}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSend();
						}
					}}
				/>
				<div>
					<button
						type="button"
						className={styles.sendButton}
						onClick={handleSend}
					>
						Send
					</button>
					<button
						type="button"
						className={styles.clearButton}
						onClick={() => updateMessage([])}
					>
						Clear
					</button>
				</div>
			</div>
		</>
	);
};

const Introduction = () => {
	const TextRenderer = ({ value = "", direction = "r", size = "large" }) => (
		<div
			className={styles.textRenderer}
			style={{
				fontSize: size,
				backgroundImage: `linear-gradient(to-${direction}, #63B3ED, #319795)`,
			}}
		>
			{value}
		</div>
	);

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="flex flex-col items-center justify-center">
				<TextRenderer value="Amelia Chat" size="xxx-large" />
			</div>
			<div className="flex flex-col items-center justify-center">
				<TextRenderer value="Soy una gente de venta virtual creado por el equipo de Amelia" />
			</div>
		</div>
	);
};

const RenderMessage = ({ message, msgIndex, loading, messageLength}) => {
	const { parts, role } = message;
	console.log({message})

	const Loader = () =>
		msgIndex === messageLength - 1 &&
		loading && (
			<div className={styles.loader} key={`chat-message-${msgIndex}-loader`}>
				<div className={styles.dot} />
				<div className={styles.dot} />
				<div className={styles.dot} />
			</div>
		);

	return parts.map((part, index) =>
		part.text ? (
			<>
				<motion.div
					className={`${styles.message} ${role === "user" ? styles.userMessage : styles.botMessage}`}
					initial={{
						opacity: 0,
						scale: 0.5,
						y: 20,
						x: role === "user" ? 20 : -20,
					}}
					animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
					key={`motion-message-part-${index}-${role}}`}
				>
					<ReactMarkdown
						key={`motion-message-part-${index}=${encodeURIComponent(part.text)}`}
						components={{
							p: ({ node, ...props }) => <div {...props} className="text-sm" />,
							code: ({ node, ...props }) => (
								<pre
									{...props}
									className="text-sm font-mono text-white bg-slate-800 rounded-md p-2 overflow-auto m-2"
								/>
							),
						}}
					>
						{part.text}
					</ReactMarkdown>
				</motion.div>
				<Loader
					key={`chat-message-${index}-${encodeURIComponent(part.text)}-loader`}
				/>
			</>
		) : (
			<Loader
				key={`chat-message-${index}-${encodeURIComponent(part.text)}-loader`}
			/>
		),
	);
};

export default ChatWithGemini;
