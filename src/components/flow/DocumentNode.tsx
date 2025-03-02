'use client';

import {
  NodeProps,
  Node,
  useReactFlow,
  Edge,
  MarkerType,
  Handle,
  Position,
} from "@xyflow/react";
import { BaseNode } from "@/components/flow/BaseNode";
import { motion } from "motion/react";
import { MouseEventHandler, useContext, useEffect, useState } from "react";
import { ActiveSourceContext } from "@/context/active-source";
import { FaEye } from "react-icons/fa6";
import { WorkspaceContext } from "@/context/workspace";
import slugify from "slugify";
import { Note } from "@/types";
import { SelectionContext } from "@/context/selection";

export default function DocumentNode({ selected, data }: NodeProps<Node<{ label: string, content: string }>>) {
  const reactFlowInstance = useReactFlow();
  const [, setActiveSource] = useContext(ActiveSourceContext);
  const [workspace, setWorkspace] = useContext(WorkspaceContext);
  const [selection, setSelection] = useContext(SelectionContext);
  const [loading, setLoading] = useState(false);

  const currentDocument = workspace.find((document) => document.document.title === data.label)!;

  const getRadiusEndpoint = (centerX: number, centerY: number, theta: number, radius: number) => {
    return {
      x: centerX + (radius * Math.cos(theta)),
      y: centerY + (radius * Math.sin(theta)),
    };
  }

  const handleFlow = (notes: Note[]) => {
    const nodes = notes.map((note, i) => {
      const center = reactFlowInstance.getNode(currentDocument.document.id)!.position;
  
      // Calculate angle and radius for circular placement
      const angle = (2 * Math.PI / notes.length) * i;  // Spread notes evenly along the circle
      const radius = 575;  // Fixed radius for all nodes (you can adjust this)
  
      // Get the endpoint for this node based on angle and radius
      const endpoint = getRadiusEndpoint(center.x, center.y, angle, radius);
  
      // Create node at calculated position
      return {
        id: note.id,
        type: 'note',
        position: {
          x: endpoint.x,
          y: endpoint.y,
        },
        data: {
          label: `${note.title}`,
          content: `${note.content}`
        },
      };
    });

    const edges = notes.map((note) => ({
      id: note.edge.id,
      source: note.edge.source,
      target: note.id,
      type: 'floating',
      markerEnd: { type: MarkerType.Arrow }
    })) as Edge[];
  
    // Add nodes to the React Flow instance
    reactFlowInstance.addNodes(nodes);
    reactFlowInstance.addEdges(edges);

  };

  const handleCreateMindmap = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch("https://c7cd-18-29-46-176.ngrok-free.app/api/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data.label }),
      });

      if (!response.ok) throw new Error("Failed to generate mind map.");

      const result = await response.json();
      // console.log("Mindmap Response:", result);

      const newNotes = workspace.find((document) => document.document.title === data.label)!.notes
      // console.log(result)

      newNotes.push(
        ...Object.entries(result.map).map(([key, value]) => ({
        content: `${(value as string[])[0]}`, // a note (eg. characteristics, other smaller notes) that build up a mindmap
        title: key,
        id: slugify((value as string[])[0].substring(0, 15), { lower: true, replacement: "_" }),
        edge: {
          source: currentDocument.document.id, // the id of the source node
          id: `${currentDocument.document.id}-${slugify(key)}`, // the id of the edge connecting the note to the document
        },
        citation: '' // as in, the explicit quote used to justify the summary from the target document
      })));

      setWorkspace([...workspace.filter(d => d.document.id !== currentDocument.document.id), {
        document: currentDocument.document, notes: newNotes
      }]);

      handleFlow(newNotes);

      alert("Mindmap created! Check the console for details."); // Replace this with actual UI updates

    } catch (error) {
      console.error("Mindmap Error:", error);
      alert("Error creating mindmap.");
    } finally {
      setLoading(false);
    }
  };

  const handleClick: MouseEventHandler = (event) => {
    if (event.altKey) {
      console.log(selection)
      // if shift, toggle whether its in selection or not; if its not shift, set it as the only selected node
      // manually check if the shift key is currently pressed at the time of event
      const documentIsInSelection = selection.find((src) => src.document.title === data.label);
      console.log(`is the selection more than zero? ${selection.length > 0}`);
  
      const newSelection = (() => {
        console.log()
        if (documentIsInSelection) {
          return selection.filter((src) => src.document.title !== data.label);
        } else {
          return [...selection, currentDocument];
        }
      })();
  
      setSelection(documentIsInSelection ? newSelection : [currentDocument]);
    }
  }
  
  return (
    <motion.div onClick={handleClick} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
      <BaseNode className="p-6 max-w-md w-screen bg-white" selected={selected}>
        <div>
          <div className="text-sm text-slate-400 uppercase">document</div>
          <div className="flex gap-3 justify-between w-full items-center mb-3">
            <div className="text-lg font-semibold">{data.label} - Wikipedia</div>
          </div>
          <div className="line-clamp-3 relative">
            <span>{data.content}</span>
            <span className="w-full h-full z-10">
              <span className="bg-gradient-to-b from-transparent to-white h-2/3 w-full absolute bottom-0 left-0"></span>
            </span>
          </div>
          <div>
            {currentDocument?.notes.length === 0 && <button 
              className="bg-indigo-400 text-white rounded-md p-2 w-full mt-4 disabled:bg-indigo-300" 
              onClick={handleCreateMindmap} 
              disabled={loading}
            >
              {loading ? "Creating mindmap..." : "Create mindmap"}
            </button>}
            <button className="mt-3 flex justify-center items-center text-white gap-4 h-8 w-full bg-indigo-400 rounded-sm p-2" onClick={() => {
              const doc = workspace.find((document) => document.document.title === data.label)!;
              setActiveSource(doc);
            }}>
              <FaEye className="size-4 text-white" />
              <span className="text-sm">Go to source</span>
            </button>
          </div>
          <Handle type="source" position={Position.Right} className="opacity-0" />
          <Handle type="target" position={Position.Left} className="opacity-0" />
        </div>
      </BaseNode>
    </motion.div>
  );
}
