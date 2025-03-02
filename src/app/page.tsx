'use client';
import React, { useEffect, useState } from 'react';
import { Background, BackgroundVariant, Edge, ReactFlow, ReactFlowProvider, useEdgesState } from '@xyflow/react'; 
import '@xyflow/react/dist/style.css';
import { WorkspaceContext, WorkspaceContextData } from '@/context/workspace';
import CreateDocument from '@/components/CreateDocument';
import Tutorial from '@/components/Tutorial';
import SourceManager from '@/components/SourceManager';
import DocumentNode from '@/components/flow/DocumentNode';
import { ActiveSourceContext, ActiveSourceData } from '@/context/active-source';
import SourceView from '@/components/SourceView';
import NoteNode from '@/components/flow/NoteNode';
import FloatingEdge from '@/components/flow/edges/FloatingEdge';
import FloatingConnectionLine from '@/components/flow/edges/FloatingConnectionLine';
import JointEdge from '@/components/flow/edges/JointEdge';
import { SelectionContext, SelectionContextData } from '@/context/selection';

export default function App() {
  const [workspace, setWorkspace] = useState<WorkspaceContextData>([]);
  const [activeSource, setActiveSource] = useState<ActiveSourceData | null>(null!);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [selection, setSelection] = useState<SelectionContextData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    console.log('Selection changed:', selection);

    if (selection.length === 2) {
      const [source, target] = selection;

      const newEdge: Edge = {
        id: `edge-${source.document.id}-${target.document.id}`,
        source: source.document.id,
        target: target.document.id,
        type: 'joint',
        animated: true,
        style: { stroke: '#000', strokeWidth: 2 },
      };

      setEdges((prevEdges: any) => [...prevEdges, newEdge]);
    }
  }, [selection]); 


  // create a joint edge between selections

  console.log(workspace)
  
  // const [nodes, , onNodesChange] = useNodesState(initialNodes);
  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // const handleNewDocument = useCallback(, [reactFlowInstance]);

  return (
    <main className="w-screen h-screen">
      <WorkspaceContext.Provider value={[workspace, setWorkspace]}>
        <ActiveSourceContext.Provider value={[activeSource, setActiveSource]}>
          <SelectionContext.Provider value={[selection, setSelection]}>
            <ReactFlowProvider>
              <div key='dom-ui' className="fixed w-screen h-screen z-10 top-0 left-0 pointer-events-none">
                {(workspace.length === 0 || showTutorial) && <Tutorial setTutorial={setShowTutorial} />}
                <CreateDocument/>
                <SourceManager />
                <SourceView />
              </div>
              <div key='react-flow-instance' className="fixed w-screen h-screen z-0 top-0 left-0">
                <ReactFlow defaultNodes={[]} edges={edges}
                  onEdgesChange={onEdgesChange} nodeTypes={{ 
                  document: DocumentNode,
                  note: NoteNode,
                }} edgeTypes={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  floating: FloatingEdge as any,
                  joint: JointEdge,
                }}
                connectionLineComponent={FloatingConnectionLine}
                >
                  <Background color="#CED4DD" variant={BackgroundVariant.Dots} size={3} gap={32} />
                </ReactFlow>
              </div>
            </ReactFlowProvider>
          </SelectionContext.Provider>
        </ActiveSourceContext.Provider>
      </WorkspaceContext.Provider>
    </main>
  );
}