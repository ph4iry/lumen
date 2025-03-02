'use client';
import { motion } from "motion/react";

export default function Tutorial({ setTutorial }:{ setTutorial: (value: boolean) => void }) {

  return (
    <motion.div
      key='getting-started-cue'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute left-16 bottom-16 pointer-events-auto"
    >
      <div className="bg-white shadow rounded-md w-full max-w-xl p-6 relative">
        <button onClick={() => {
          setTutorial(false);
        }} className="absolute right-6 top-6"><span className="sr-only">close tutorial</span> &times;</button>
        <h1 className="text-4xl text-gray-600">welcome to lumen. </h1>
        <p className="text-lg text-gray-500">start thinking smarter, not harder</p>

        <div>
          Get started by adding a document in the bottom right!
        </div>
      </div>
    </motion.div>
  )
}