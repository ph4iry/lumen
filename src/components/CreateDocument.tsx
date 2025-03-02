'use client';
import wiki from 'wikipedia';
import { AnimatePresence, motion } from 'motion/react';
import { useContext, useState } from 'react';
import { FaPlus, FaXmark } from 'react-icons/fa6';
import { WorkspaceContext } from '@/context/workspace';
import { Source } from '@/types';
import { useReactFlow } from '@xyflow/react';
import slugify from 'slugify';

export default function CreateDocument() {
  const reactFlowInstance = useReactFlow();
  const [ documentUrl, setDocumentUrl ] = useState<string>('');
  const [ showDocumentBuilder, setShowDocumentBuilder ] = useState<boolean>(false);
  const [ workspace, setWorkspace ] = useContext(WorkspaceContext);

  const handleFlow = (document: Source) => {
    const id = document.id;
    const clientX = window.innerWidth / 2;
    const clientY = window.innerHeight / 2;

    const center = reactFlowInstance.screenToFlowPosition({ x: clientX, y: clientY });

    const newNode = {
      id,
      type: 'document',
      position: {
        x: center.x,
        y: center.y,
      },
      data: {
        label: `${document.title}`,
        content: document.content,
      },
    };
    console.log(newNode);
    reactFlowInstance.addNodes(newNode);
  }
  // getting started menu

  const handleDocumentAdd = async () => {
    // check if valid wikipedia link and if so, add it to the workspace
    const url = new URL(documentUrl);
    if (url.hostname.includes('wikipedia.org')) {
      const title = documentUrl.split('/').pop();
      const wikipediaresult = await wiki.page(title!);
      const content = await wikipediaresult.content();
      // const pageTitle = url.pathname.split('/').pop();
      const pageTitle = wikipediaresult.title;
      const id = slugify(pageTitle, {
        lower: true,
        replacement: '_',
      });

      const document = {
        id,
        title: pageTitle,
        url: documentUrl,
        content,
      }
      setWorkspace([...workspace, { document, notes: [] }]);
      setShowDocumentBuilder(false);
      handleFlow(document);
    }
  }

  return (
    <>
      <button onClick={() => {
        setShowDocumentBuilder(true)
      }} className="size-16 rounded-full bg-slate-500 z-10 absolute right-16 bottom-16 flex items-center justify-center hover scale-105 transition pointer-events-auto">
        <span className="sr-only">Add a document</span>
        <FaPlus className="size-8 text-white" />
      </button>
      <AnimatePresence>
        {showDocumentBuilder && (
          <motion.div key='document-upload-modal'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed w-screen h-screen flex items-center justify-center z-20 pointer-events-auto"
          >
            <motion.div
              key='document-upload-backdrop'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { delay: 0.5 } }}
              className="z-0 fixed w-screen h-screen bg-white/30 backdrop-blur-md"
              onClick={() => { setShowDocumentBuilder(false) }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="z-10 w-full max-w-4xl bg-white shadow-xl px-16 py-8 rounded-2xl border-2 relative"
            >
              <button className="absolute top-8 right-16 text-xl" onClick={() => {
                setShowDocumentBuilder(false)
              }}>
                <span className="sr-only">Close document builder</span>
                <FaXmark />
              </button>
              <h1 className="text-4xl text-gray-600">Add a document</h1>
              <div className="text-xl">Paste a link from Wikipedia</div>
              <input type="text" placeholder="https://en.wikipedia.org/wiki/Document" className="border-2 border-gray-300 rounded-md p-2 w-full"
                onChange={(e) => {
                  setDocumentUrl(e.target.value)
                }}
              />
              <button onClick={handleDocumentAdd} className="w-full bg-slate-500 mt-5 rounded-md p-2 text-white">
                Add document
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}