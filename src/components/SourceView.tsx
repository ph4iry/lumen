'use client';
import { useContext, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { AnimatePresence, motion } from "motion/react";
import { ActiveSourceContext } from "@/context/active-source";
import Markdown from 'react-markdown'

export default function SourceView() {
  const [activeSource, setActiveSource] = useContext(ActiveSourceContext);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string>('');
  const [citation, setCitation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const convertWikipediaHeadingsToMarkdown = (text: string) => {
    return text.replace(/^(=+)(.*?)=+$/gm, (match, equals, content) => {
      const level = Math.min(equals.length, 6); // Cap at h6
      return `\n${"#".repeat(level)} ${content.trim()}`;
    });
  }

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("https://c7cd-18-29-46-176.ngrok-free.app/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, content: activeSource?.document.content }),
      });
      const data = await response.json();
      setAnswer(data.answer);
      setCitation(data.citation);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setAnswer("Error retrieving response. Please try again.");
    }
    setLoading(false);
  };


  return (
    <AnimatePresence>
      {activeSource && (
        <motion.div key='source-view'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed left-0 top-0 w-screen h-screen flex items-center justify-center z-20 pointer-events-auto"
        >
          <motion.div
            key='source-view-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.5 } }}
            className="z-0 fixed w-screen h-screen bg-white/30 backdrop-blur-md"
            onClick={() => { setActiveSource(null) }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="z-10 w-full max-w-6xl max-h-[70vh] h-full bg-white shadow-xl px-16 py-8 rounded-2xl border-2 relative"
          >
            <button className="absolute top-8 right-16 text-xl" onClick={() => {
              setActiveSource(null)
            }}>
              <FaXmark />
            </button>
            <div className="flex gap-6 h-full">
              <div className="w-1/2 pr-6 h-full overflow-scroll">
                <div>
                  <div className="text-sm text-slate-400 uppercase">document</div>
                  <div className="flex gap-3 justify-between w-full items-center mb-3">
                    <div className="text-lg font-semibold">{activeSource?.document.title} - Wikipedia</div>
                  </div>
                  <div className="prose-sm">
                    <Markdown>{convertWikipediaHeadingsToMarkdown(activeSource?.document.content)}</Markdown>
                  </div>
                </div>
              </div>
              <div className="w-1/2 flex flex-col justify-between">
                <div>
                  <div className="text-lg font-semibold mb-2">Ask AI</div>
                  {answer && (
                    <div className="mt-4 p-3 border rounded-md bg-gray-100">
                      <strong>AI Response:</strong>
                      <p>{answer}</p>
                      <div className="flex gap-2 mt-2">
                        <div className="w-1 bg-indigo-500 min-h-full rounded-full"></div>
                        <div className="text-indigo-500/70">{citation}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    placeholder="Ask a question about this document..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  ></textarea>
                  <button
                    className="mt-2 p-2 bg-blue-500 text-white rounded-md w-full"
                    onClick={askAI}
                    disabled={loading}
                  >
                    {loading ? "Thinking..." : "Ask"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}