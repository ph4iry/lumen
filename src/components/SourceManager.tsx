'use client';

import { WorkspaceContext } from "@/context/workspace";
import { motion } from "motion/react";
import { useContext } from "react";

export default function SourceManager() {
  const [ workspace ] = useContext(WorkspaceContext);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md absolute top-16 left-16 max-w-sm w-full border-2 pointer-events-auto">
      <h1 className="text-2xl font-bold">Source Manager</h1>
      {workspace.length === 0 && (
        <div className="w-full text-center p-6 rounded-lg border-2 border-dashed mt-4">
          Add a document to get started
        </div>
      )}
      {workspace.length > 0 && (
        <div className="flex flex-col w-full gap-4 mt-4">
          {workspace.map((document) => (
            <motion.div key={document.document.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }} className="w-full p-6 rounded-lg border-2 border-dashed">
              <div className="uppercase text-slate-500 text-sm">Wikipedia</div>
              <h2 className="text-xl font-bold">{document.document.title}</h2>
              <a className="text-slate-400 truncate block hover:underline transition" href={document.document.url}>{document.document.url}</a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}