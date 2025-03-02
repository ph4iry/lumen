'use client';

import {
  NodeProps,
  Node,
  Handle,
  Position,
} from "@xyflow/react";
import { BaseNode } from "@/components/flow/BaseNode";
import { motion } from "motion/react";

export default function NoteNode({ selected, data }: NodeProps<Node<{ label: string, content: string }>>) {
  // const reactFlowInstance = useReactFlow();
  // const [, setActiveSource] = useContext(ActiveSourceContext);
  // const [workspace, setWorkspace] = useContext(WorkspaceContext);
  // const [loading, setLoading] = useState(false);

  // const currentDocument = workspace.find((document) => document.document.title === data.label)!;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
      <BaseNode className="p-6 max-w-md w-screen bg-white" selected={selected}>
        <div>
          <div className="text-sm text-slate-400 uppercase">note</div>
          <div className="flex gap-3 justify-between w-full items-center mb-3">
            <div className="text-lg font-semibold">{data.label}</div>
          </div>
          <div className="line-clamp-3 relative">
            <span>{data.content}</span>
            <span className="w-full h-full z-10">
              <span className="bg-gradient-to-b from-transparent to-white h-2/3 w-full absolute bottom-0 left-0"></span>
            </span>
          </div>
          <div>
          </div>
          <Handle type="source" position={Position.Right} className="opacity-0" />
          <Handle type="target" position={Position.Left} className="opacity-0" />
        </div>
      </BaseNode>
    </motion.div>
  );
}
