import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
  MarkerType,
  Connection,
  Edge,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  useReactFlow,
  useOnSelectionChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Save, 
  Printer, 
  Undo, 
  Redo, 
  Trash2, 
  Square, 
  Circle, 
  Diamond, 
  Database, 
  FileText, 
  Layout,
  MousePointer2,
  Move,
  Type,
  ArrowRight,
  Download,
  Upload,
  Bold,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Minus,
  FileJson,
  FolderOpen,
  X
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { Document, Packer, Paragraph, ImageRun } from 'docx';
import jsPDF from 'jspdf';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../context/ThemeContext';
import { useCompanyData } from '../context/CompanyDataContext';
import { RectangleNode, DiamondNode, CircleNode, ParallelogramNode, CylinderNode, DocumentNode, TextNode } from '../components/org-chart/CustomNodes';

const nodeTypes = {
  rectangle: RectangleNode,
  diamond: DiamondNode,
  circle: CircleNode,
  parallelogram: ParallelogramNode,
  cylinder: CylinderNode,
  document: DocumentNode,
  text: TextNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'rectangle',
    data: { label: 'Start Process' },
    position: { x: 250, y: 5 },
  },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

interface SavedTemplate {
  id?: string;
  name: string;
  date: string;
  flow: {
    nodes: Node[];
    edges: Edge[];
    viewport: { x: number; y: number; zoom: number };
  };
}

const OrgChartContent = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { orgChartTemplates, addEntity, deleteEntity } = useCompanyData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Template Management State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNode(nodes.length === 1 ? nodes[0] : null);
    },
  });

  // History for Undo/Redo
  const [history, setHistory] = useState<{ nodes: Node[], edges: Edge[] }[]>([{ nodes: initialNodes, edges: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: newNodes, edges: newEdges });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge({ ...params, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } }, edges);
      setEdges(newEdges);
      addToHistory(nodes, newEdges);
    },
    [edges, nodes, addToHistory, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: type === 'text' ? 'Double click to edit' : `${type} node` },
      };

      const newNodes = nodes.concat(newNode);
      setNodes(newNodes);
      addToHistory(newNodes, edges);
    },
    [reactFlowInstance, nodes, edges, addToHistory, setNodes]
  );

  const onNodesChangeWithHistory = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      // Only add to history on 'add', 'remove', or 'position' change end (simplified)
      // For simplicity, we might not track every drag move, but let's try to track significant changes
      // React Flow handles internal state, so we need to be careful not to flood history
    },
    [onNodesChange]
  );

  // Custom Undo/Redo Logic
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setNodes(history[newIndex].nodes);
      setEdges(history[newIndex].edges);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setNodes(history[newIndex].nodes);
      setEdges(history[newIndex].edges);
    }
  };

  const captureChart = async (): Promise<string | null> => {
    if (!reactFlowWrapper.current) return null;
    
    try {
      // Temporarily hide controls for cleaner capture
      const controls = reactFlowWrapper.current.querySelector('.react-flow__controls') as HTMLElement;
      const minimap = reactFlowWrapper.current.querySelector('.react-flow__minimap') as HTMLElement;
      const panel = reactFlowWrapper.current.querySelector('.react-flow__panel') as HTMLElement;
      
      if (controls) controls.style.display = 'none';
      if (minimap) minimap.style.display = 'none';
      if (panel) panel.style.display = 'none';

      const dataUrl = await toPng(reactFlowWrapper.current, {
        backgroundColor: isDark ? '#020617' : '#f8fafc',
        pixelRatio: 2,
        style: {
          width: '100%',
          height: '100%',
        }
      });
      
      // Restore controls
      if (controls) controls.style.display = '';
      if (minimap) minimap.style.display = '';
      if (panel) panel.style.display = '';

      return dataUrl;
    } catch (error) {
      console.error('Error capturing chart:', error);
      return null;
    }
  };

  const handleSaveProject = async () => {
    const dataUrl = await captureChart();
    if (!dataUrl) {
      alert('Failed to capture chart.');
      return;
    }

    try {
      // Convert base64 to array buffer
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create Word document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: bytes,
                  type: 'png',
                  transformation: {
                    width: 600,
                    height: 600 * (reactFlowWrapper.current!.offsetHeight / reactFlowWrapper.current!.offsetWidth),
                  },
                }),
              ],
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'org-chart.docx';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving Word document:', error);
      alert('Failed to save Word document.');
    }
  };

  const handleExportPDF = async () => {
    const dataUrl = await captureChart();
    if (!dataUrl || !reactFlowWrapper.current) {
      alert('Failed to capture chart.');
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [reactFlowWrapper.current.offsetWidth * 2, reactFlowWrapper.current.offsetHeight * 2]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, reactFlowWrapper.current.offsetWidth * 2, reactFlowWrapper.current.offsetHeight * 2);
      pdf.save('org-chart.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF.');
    }
  };

  const handleLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target?.result as string);
          if (flow) {
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            addToHistory(flow.nodes || [], flow.edges || []);
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePrint = async () => {
    const dataUrl = await captureChart();
    if (!dataUrl) {
      alert('Failed to capture chart.');
      return;
    }

    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Org Chart</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
                img { max-width: 100%; height: auto; }
                @media print {
                  @page { margin: 0; size: landscape; }
                  body { margin: 1cm; }
                }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" onload="window.print();window.close()" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Error printing:', error);
      alert('Failed to generate print image.');
    }
  };

  const handleDelete = () => {
    // Delete selected nodes
    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedEdges = edges.filter((edge) => edge.selected);
    
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      const newNodes = nodes.filter((node) => !node.selected);
      const newEdges = edges.filter((edge) => !edge.selected);
      setNodes(newNodes);
      setEdges(newEdges);
      addToHistory(newNodes, newEdges);
    }
  };

  // Connect selected nodes logic
  const handleConnectSelected = () => {
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.length >= 2) {
      // Connect them in order (or just pair them)
      // For simplicity, connect first to second, second to third, etc.
      const newEdgesToAdd: Edge[] = [];
      for (let i = 0; i < selectedNodes.length - 1; i++) {
        const source = selectedNodes[i];
        const target = selectedNodes[i+1];
        
        // Check if edge already exists
        const exists = edges.some(e => e.source === source.id && e.target === target.id);
        if (!exists) {
          newEdgesToAdd.push({
            id: `e${source.id}-${target.id}`,
            source: source.id,
            target: target.id,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        }
      }
      
      if (newEdgesToAdd.length > 0) {
        const updatedEdges = [...edges, ...newEdgesToAdd];
        setEdges(updatedEdges);
        addToHistory(nodes, updatedEdges);
      }
    } else {
      alert('Select at least 2 nodes to connect them automatically.');
    }
  };

  const updateNodeStyle = (styleUpdate: any) => {
    if (!selectedNode) return;
    const newNodes = nodes.map((node) => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            textStyle: { ...node.data.textStyle, ...styleUpdate },
          },
        };
      }
      return node;
    });
    setNodes(newNodes);
    addToHistory(newNodes, edges);
  };

  // Template Actions
  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const newTemplate = {
        name: newTemplateName,
        date: new Date().toLocaleString(),
        flow
      };
      
      await addEntity('orgChartTemplates', newTemplate);
      setNewTemplateName('');
    }
  };

  const handleLoadTemplate = (template: SavedTemplate) => {
    if (template.flow) {
      setNodes(template.flow.nodes || []);
      setEdges(template.flow.edges || []);
      addToHistory(template.flow.nodes || [], template.flow.edges || []);
      setIsTemplateModalOpen(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteEntity('orgChartTemplates', id);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative">
      {/* Toolbar */}
      <div className={`h-14 border-b flex items-center justify-between px-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <button onClick={handleUndo} disabled={historyIndex === 0} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-50" title="Undo">
            <Undo className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-50" title="Redo">
            <Redo className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
          <button onClick={handleDelete} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600" title="Delete Selected">
            <Trash2 className="w-4 h-4" />
          </button>
          
          {selectedNode && (
            <>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                  onClick={() => updateNodeStyle({ bold: !selectedNode.data.textStyle?.bold })}
                  className={`p-1.5 rounded ${selectedNode.data.textStyle?.bold ? 'bg-white dark:bg-slate-700 shadow-sm' : 'hover:bg-white dark:hover:bg-slate-700'}`}
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                <button 
                  onClick={() => updateNodeStyle({ align: 'left' })}
                  className={`p-1.5 rounded ${selectedNode.data.textStyle?.align === 'left' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'hover:bg-white dark:hover:bg-slate-700'}`}
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => updateNodeStyle({ align: 'center' })}
                  className={`p-1.5 rounded ${(!selectedNode.data.textStyle?.align || selectedNode.data.textStyle?.align === 'center') ? 'bg-white dark:bg-slate-700 shadow-sm' : 'hover:bg-white dark:hover:bg-slate-700'}`}
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => updateNodeStyle({ align: 'right' })}
                  className={`p-1.5 rounded ${selectedNode.data.textStyle?.align === 'right' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'hover:bg-white dark:hover:bg-slate-700'}`}
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                <button 
                  onClick={() => updateNodeStyle({ fontSize: (selectedNode.data.textStyle?.fontSize || 12) - 1 })}
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700"
                  title="Decrease Font Size"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs w-6 text-center">{selectedNode.data.textStyle?.fontSize || 12}</span>
                <button 
                  onClick={() => updateNodeStyle({ fontSize: (selectedNode.data.textStyle?.fontSize || 12) + 1 })}
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700"
                  title="Increase Font Size"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLoadProject} 
            accept=".json" 
            className="hidden" 
          />
          <button onClick={() => setIsTemplateModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" title="Manage Templates">
            <FolderOpen className="w-4 h-4" /> Templates
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" title="Load Project (JSON)">
            <Upload className="w-4 h-4" /> Load
          </button>
          <button onClick={handleSaveProject} className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" title="Save Project (Word)">
            <FileText className="w-4 h-4" /> Save
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700" title="Export as PDF">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Toolbox */}
        <aside className={`w-64 border-r flex flex-col ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Toolbox</h3>
            <p className="text-xs text-slate-500">Drag shapes to canvas</p>
          </div>
          
          <div className="p-4 grid grid-cols-2 gap-4 overflow-y-auto">
            <div 
              className="flex flex-col items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded cursor-grab hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'text')}
              draggable
            >
              <Type className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              <span className="text-xs text-slate-500">Text</span>
            </div>

            <div 
              className="flex flex-col items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={handleConnectSelected}
              title="Select 2+ nodes then click to connect"
            >
              <ArrowRight className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              <span className="text-xs text-slate-500">Connect</span>
            </div>

            <div 
              className="flex flex-col items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded cursor-grab hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'rectangle')}
              draggable
            >
              <Square className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              <span className="text-xs text-slate-500">Process</span>
            </div>

            <div 
              className="flex flex-col items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded cursor-grab hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'diamond')}
              draggable
            >
              <Diamond className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              <span className="text-xs text-slate-500">Decision</span>
            </div>

            <div 
              className="flex flex-col items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded cursor-grab hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'circle')}
              draggable
            >
              <Circle className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              <span className="text-xs text-slate-500">Start / End</span>
            </div>

            <div 
              className="flex flex-col items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded cursor-grab hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'parallelogram')}
              draggable
            >
              <Layout className="w-8 h-8 text-slate-600 dark:text-slate-400 transform -skew-x-12" />
              <span className="text-xs text-slate-500">Input / Output</span>
            </div>

            <div 
              className="flex flex-col items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded cursor-grab hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'cylinder')}
              draggable
            >
              <Database className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              <span className="text-xs text-slate-500">Database</span>
            </div>

            <div 
              className="flex flex-col items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded cursor-grab hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'document')}
              draggable
            >
              <FileText className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              <span className="text-xs text-slate-500">Document</span>
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-400">
              <p className="mb-1 flex items-center gap-2"><MousePointer2 className="w-3 h-3" /> Select & Drag to move</p>
              <p className="mb-1 flex items-center gap-2"><Move className="w-3 h-3" /> Drag handles to connect</p>
              <p className="flex items-center gap-2"><Type className="w-3 h-3" /> Click text to edit</p>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <div className="flex-1 h-full bg-slate-50 dark:bg-slate-950 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeWithHistory}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
            snapToGrid={true}
            snapGrid={[15, 15]}
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
            <Panel position="top-right" className="bg-white dark:bg-slate-800 p-2 rounded shadow-sm border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
              Canvas Size: Infinite
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Template Modal */}
      {isTemplateModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Saved Templates</h2>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Save Current Chart</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button 
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Your Templates</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {orgChartTemplates.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">No saved templates yet.</p>
                ) : (
                  orgChartTemplates.map((template: any) => (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white text-sm">{template.name}</p>
                        <p className="text-xs text-slate-500">{template.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleLoadTemplate(template)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                          title="Load Template"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function OrgChart() {
  return (
    <AdminLayout>
      <ReactFlowProvider>
        <OrgChartContent />
      </ReactFlowProvider>
    </AdminLayout>
  );
}
