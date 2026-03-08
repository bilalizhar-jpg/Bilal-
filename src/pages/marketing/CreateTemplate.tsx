import React, { useState, useRef } from 'react';
import { 
  Type, Image as ImageIcon, Link as LinkIcon, Save, Eye, Send, GripVertical, Settings,
  PlaySquare, Code, Hexagon, Share2, Code2, Minus, ShoppingBag, Menu, Square, Trash2, X, Upload,
  Facebook, Twitter, Instagram, Linkedin, Youtube
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Editor from 'react-simple-wysiwyg';

export default function CreateTemplate() {
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState('New Campaign Template');
  const [activeTab, setActiveTab] = useState<'blocks' | 'sections' | 'saved'>('blocks');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  
  const [blocks, setBlocks] = useState([
    { id: 'logo-1', type: 'logo', content: 'Logo' },
    { id: 'headline-1', type: 'title', content: 'This is your headline.' },
    { id: 'main-image-1', type: 'image', content: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800&h=400' },
    { id: 'two-columns-1', type: 'columns', content: [
      { id: 'col1-img', type: 'image', content: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400&h=400' },
      { id: 'col2-img', type: 'image', content: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=400&h=400' }
    ]},
    { id: 'divider-1', type: 'divider' },
    { id: 'sub-title-1', type: 'title', content: 'Your title here' },
    { id: 'text-1', type: 'text', content: 'Start your newsletter with multiple visually striking images.' },
    { id: 'text-2', type: 'text', content: 'Start by replacing the full-width header and main images with your own, or use a solid color background.' },
    { id: 'button-1', type: 'button', content: 'Call to action', url: '#' },
    { id: 'footer-1', type: 'footer', content: {
      company: 'Info Resume Edge',
      address: 'Johar Town, 54500, Lahore',
      email: 'EMAIL'
    }}
  ]);

  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleBlockEdit = (id: string, newContent: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: newContent } : b));
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (activeBlock === id) setActiveBlock(null);
  };

  const [showToast, setShowToast] = useState(false);

  const handleSaveTemplate = () => {
    // In a real app, this would save to a backend
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const blockTypes = [
    { id: 'title', icon: Type, label: 'Title', defaultContent: 'New Title' },
    { id: 'text', icon: Menu, label: 'Text', defaultContent: 'Enter your text here...' },
    { id: 'image', icon: ImageIcon, label: 'Image', defaultContent: '' },
    { id: 'video', icon: PlaySquare, label: 'Video', defaultContent: { url: '' } },
    { id: 'button', icon: Square, label: 'Button', defaultContent: 'Click Me' },
    { id: 'dynamic', icon: Code, label: 'Dynamic content', defaultContent: '{{user.firstName}}' },
    { id: 'logo', icon: Hexagon, label: 'Logo', defaultContent: 'Your Logo' },
    { id: 'social', icon: Share2, label: 'Social', defaultContent: { facebook: '', twitter: '', instagram: '', linkedin: '' } },
    { id: 'html', icon: Code2, label: 'HTML', defaultContent: '<div>Custom HTML</div>' },
    { id: 'divider', icon: Minus, label: 'Divider', defaultContent: '' },
    { id: 'product', icon: ShoppingBag, label: 'Product', defaultContent: { image: '', title: 'Product Name', price: '$99.99', buttonText: 'Buy Now', url: '#' } },
    { id: 'navigation', icon: Menu, label: 'Navigation', defaultContent: [{ label: 'Home', url: '#' }, { label: 'Shop', url: '#' }, { label: 'Contact', url: '#' }] },
    { id: 'spacer', icon: Square, label: 'Spacer', dashed: true, defaultContent: { height: 40 } },
  ];

  const handleDragStart = (e: React.DragEvent, type: string, isNew: boolean, index?: number) => {
    if (isNew) {
      const blockType = blockTypes.find(b => b.id === type);
      setDraggedItem({ isNew: true, type, content: blockType?.defaultContent });
    } else {
      setDraggedItem({ isNew: false, index });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newBlocks = [...blocks];
    
    if (draggedItem.isNew) {
      const newBlock = {
        id: `${draggedItem.type}-${Date.now()}`,
        type: draggedItem.type,
        content: draggedItem.content
      };
      newBlocks.splice(dropIndex, 0, newBlock);
    } else {
      const dragIndex = draggedItem.index;
      if (dragIndex === dropIndex) return;
      
      const [removed] = newBlocks.splice(dragIndex, 1);
      const insertIndex = dropIndex > dragIndex ? dropIndex - 1 : dropIndex;
      newBlocks.splice(insertIndex, 0, removed);
    }
    
    setBlocks(newBlocks);
    setDraggedItem(null);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || !draggedItem.isNew) return;
    
    const newBlock = {
      id: `${draggedItem.type}-${Date.now()}`,
      type: draggedItem.type,
      content: draggedItem.content
    };
    setBlocks([...blocks, newBlock]);
    setDraggedItem(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingBlockId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleBlockEdit(uploadingBlockId, reader.result as string);
        setUploadingBlockId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = (blockId: string) => {
    setUploadingBlockId(blockId);
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/marketing/campaigns')}
              className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Back to Menu
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
          <div>
            <input 
              type="text" 
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-2xl font-bold text-slate-800 dark:text-white bg-transparent border-none focus:ring-0 p-0 outline-none"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Drag and drop blocks to build your email</p>
          </div>
          <div className="flex gap-2">
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button 
            onClick={handleSaveTemplate}
            className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Template
          </button>
          <Link 
            to="/marketing/send-campaign"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Campaign
          </Link>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar Tools */}
        <div className="w-80 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 flex flex-col">
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button 
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'blocks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('blocks')}
            >
              Blocks
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'sections' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('sections')}
            >
              Sections
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'saved' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('saved')}
            >
              Saved
            </button>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'blocks' && (
              <div className="grid grid-cols-3 gap-3">
                {blockTypes.map((block) => {
                  const Icon = block.icon;
                  return (
                    <div 
                      key={block.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, block.id, true)}
                      className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:border-indigo-500 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all group"
                    >
                      <div className={`mb-2 text-emerald-600 dark:text-emerald-500 ${block.dashed ? 'border border-dashed border-emerald-600 p-1 rounded' : ''}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 text-center">
                        {block.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div 
          className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-y-auto custom-scrollbar p-8 flex justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')]"
          onDragOver={handleDragOver}
          onDrop={handleCanvasDrop}
        >
          <div className="w-full max-w-3xl bg-white dark:bg-slate-800 shadow-sm min-h-full pb-20">
            {blocks.map((block, index) => (
              <div 
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, block.type, false, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleDrop(e, index);
                }}
                className={`group relative border-2 border-transparent hover:border-indigo-500 transition-colors ${activeBlock === block.id ? 'border-indigo-500' : ''}`}
                onClick={() => setActiveBlock(block.id)}
              >
                {/* Drag Handle */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing z-10">
                  <div className="p-1 bg-white dark:bg-slate-800 shadow-sm rounded border border-slate-200 dark:border-slate-700">
                    <GripVertical className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Block Content */}
                <div className="p-4">
                  {block.type === 'logo' && (
                    <div className="text-center py-4 relative group/logo">
                      {block.content && (block.content as string).startsWith('data:image') || (block.content as string).startsWith('http') ? (
                        <img src={block.content as string} alt="Logo" className="max-h-16 mx-auto" />
                      ) : (
                        <input 
                          type="text" 
                          value={block.content as string}
                          onChange={(e) => handleBlockEdit(block.id, e.target.value)}
                          className="inline-block bg-slate-600 text-white text-3xl font-bold py-3 px-8 rounded-md text-center border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      )}
                      {activeBlock === block.id && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity bg-black/5">
                          <button 
                            onClick={() => triggerImageUpload(block.id)}
                            className="px-3 py-1.5 bg-white text-slate-900 rounded-md text-xs font-medium shadow-sm border border-slate-200 flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            Upload Logo
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {block.type === 'title' && (
                    <input 
                      type="text" 
                      value={block.content as string}
                      onChange={(e) => handleBlockEdit(block.id, e.target.value)}
                      className="w-full text-2xl font-bold text-center text-slate-800 dark:text-white bg-transparent border-none focus:ring-2 focus:ring-indigo-500 p-2 outline-none rounded"
                    />
                  )}
                  {block.type === 'image' && (
                    <div className="relative bg-slate-100 dark:bg-slate-800 p-8 flex justify-center items-center min-h-[200px]">
                      {block.content ? (
                        <img src={block.content as string} alt="Block" className="max-w-full h-auto rounded" />
                      ) : (
                        <div className="relative">
                          <ImageIcon className="w-24 h-24 text-slate-400" strokeWidth={1} />
                        </div>
                      )}
                      {activeBlock === block.id && (
                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                          <button 
                            onClick={() => triggerImageUpload(block.id)}
                            className="px-4 py-2 bg-white text-slate-900 rounded-md text-sm font-medium shadow-sm border border-slate-200 flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Change Image
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {block.type === 'columns' && (
                    <div className="grid grid-cols-2 gap-4">
                      {(block.content as any[]).map((col: any) => (
                        <div key={col.id} className="relative bg-slate-100 dark:bg-slate-800 p-8 flex justify-center items-center min-h-[200px]">
                          {col.content ? (
                            <img src={col.content} alt="Col" className="max-w-full h-auto rounded" />
                          ) : (
                            <ImageIcon className="w-12 h-12 text-slate-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {block.type === 'divider' && (
                    <div className="py-8">
                      <hr className="border-t border-dashed border-slate-300 dark:border-slate-600" />
                    </div>
                  )}
                  {block.type === 'text' && (
                    <div className="w-full text-slate-600 dark:text-slate-300 bg-transparent border-none focus-within:ring-2 focus-within:ring-indigo-500 p-2 outline-none rounded" onClick={(e) => e.stopPropagation()}>
                      <Editor 
                        value={block.content as string} 
                        onChange={(e) => handleBlockEdit(block.id, e.target.value)}
                        containerProps={{ style: { border: 'none', minHeight: '100px' } }}
                      />
                    </div>
                  )}
                  {block.type === 'button' && (
                    <div className="text-center py-4">
                      <input 
                        type="text" 
                        value={block.content as string}
                        onChange={(e) => handleBlockEdit(block.id, e.target.value)}
                        className="inline-block px-8 py-3 bg-slate-900 text-white rounded-md font-medium text-center border-none focus:ring-2 focus:ring-indigo-500 outline-none min-w-[200px]"
                      />
                    </div>
                  )}
                  {block.type === 'footer' && (
                    <div className="bg-slate-100 dark:bg-slate-800/50 p-8 text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-1">{(block.content as any).company}</p>
                      <p>{(block.content as any).address}</p>
                      <p className="mt-4">
                        This email was sent to <span className="border border-slate-300 px-1 rounded bg-white dark:bg-slate-800">{(block.content as any).email}</span>
                      </p>
                      <p>You've received this email because you've subscribed to our newsletter.</p>
                    </div>
                  )}
                  {block.type === 'video' && (
                    <div className="relative group/video">
                      {!(block.content as any)?.url ? (
                        <div className="bg-slate-100 dark:bg-slate-800 p-8 text-center border border-dashed border-slate-300 dark:border-slate-600 rounded">
                          <PlaySquare className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                          <p className="text-sm text-slate-500">Video Block</p>
                        </div>
                      ) : (
                        <div className="aspect-video bg-slate-900 flex items-center justify-center relative rounded overflow-hidden">
                          <PlaySquare className="w-16 h-16 text-white opacity-80" />
                          <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                            {(block.content as any).url}
                          </div>
                        </div>
                      )}
                      {activeBlock === block.id && (
                        <div className="mt-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm text-left">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Video URL (YouTube, Vimeo, etc.)</label>
                          <input 
                            type="text" 
                            value={(block.content as any)?.url || ''}
                            onChange={(e) => handleBlockEdit(block.id, { ...(block.content as any), url: e.target.value })}
                            placeholder="https://..."
                            className="w-full text-sm border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white p-2"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {block.type === 'social' && (
                    <div className="text-center py-4">
                      <div className="flex justify-center gap-4">
                        {['facebook', 'twitter', 'instagram', 'linkedin'].map(network => {
                          const url = (block.content as any)?.[network] || '';
                          const isActive = !!url;
                          const Icon = network === 'facebook' ? Facebook : network === 'twitter' ? Twitter : network === 'instagram' ? Instagram : Linkedin;
                          return (
                            <a key={network} href={url || '#'} onClick={e => e.preventDefault()} className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                              <Icon className="w-5 h-5" />
                            </a>
                          );
                        })}
                      </div>
                      {activeBlock === block.id && (
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg grid grid-cols-2 gap-3 text-left">
                          {['facebook', 'twitter', 'instagram', 'linkedin'].map(network => (
                            <div key={`input-${network}`}>
                              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 capitalize">{network}</label>
                              <input 
                                type="text" 
                                value={(block.content as any)?.[network] || ''}
                                onChange={(e) => handleBlockEdit(block.id, { ...(block.content as any), [network]: e.target.value })}
                                placeholder="URL..."
                                className="w-full text-xs border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white p-1.5"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {block.type === 'html' && (
                    <div>
                      {activeBlock === block.id ? (
                        <div className="p-2 text-left">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Custom HTML</label>
                          <textarea 
                            value={block.content as string}
                            onChange={(e) => handleBlockEdit(block.id, e.target.value)}
                            className="w-full text-sm font-mono border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white h-32 p-2"
                          />
                        </div>
                      ) : (
                        <div 
                          className="min-h-[50px]"
                          dangerouslySetInnerHTML={{ __html: block.content as string }}
                        />
                      )}
                    </div>
                  )}
                  {block.type === 'navigation' && (
                    <div className="py-4">
                      <div className="flex justify-center gap-6">
                        {((block.content as any[]) || []).map((navItem, i) => (
                          <a key={i} href={navItem.url || '#'} onClick={e => e.preventDefault()} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600">
                            {navItem.label}
                          </a>
                        ))}
                      </div>
                      {activeBlock === block.id && (
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-3">
                          {((block.content as any[]) || []).map((navItem, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input 
                                type="text" 
                                value={navItem.label}
                                onChange={(e) => {
                                  const newNav = [...(block.content as any[])];
                                  newNav[i].label = e.target.value;
                                  handleBlockEdit(block.id, newNav);
                                }}
                                placeholder="Label"
                                className="w-1/3 text-xs border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white p-1.5"
                              />
                              <input 
                                type="text" 
                                value={navItem.url}
                                onChange={(e) => {
                                  const newNav = [...(block.content as any[])];
                                  newNav[i].url = e.target.value;
                                  handleBlockEdit(block.id, newNav);
                                }}
                                placeholder="URL"
                                className="flex-1 text-xs border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white p-1.5"
                              />
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newNav = [...(block.content as any[])];
                                  newNav.splice(i, 1);
                                  handleBlockEdit(block.id, newNav);
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBlockEdit(block.id, [...(block.content as any[]), { label: 'New Link', url: '#' }]);
                            }}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            + Add Link
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {block.type === 'product' && (
                    <div className="p-4 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                      <div className="w-32 h-32 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center relative group/productimg">
                        {(block.content as any)?.image ? (
                          <img src={(block.content as any).image} alt="Product" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-slate-400" />
                        )}
                        {activeBlock === block.id && (
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover/productimg:opacity-100 transition-opacity rounded-lg">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerImageUpload(block.id);
                              }}
                              className="p-2 bg-white rounded-full shadow-sm text-slate-700 hover:text-indigo-600"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left w-full">
                        {activeBlock === block.id ? (
                          <div className="space-y-2">
                            <input 
                              type="text" 
                              value={(block.content as any)?.title || ''}
                              onChange={(e) => handleBlockEdit(block.id, { ...(block.content as any), title: e.target.value })}
                              className="w-full text-lg font-bold border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white p-1.5"
                              placeholder="Product Title"
                            />
                            <input 
                              type="text" 
                              value={(block.content as any)?.price || ''}
                              onChange={(e) => handleBlockEdit(block.id, { ...(block.content as any), price: e.target.value })}
                              className="w-full text-md text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 p-1.5"
                              placeholder="Price"
                            />
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={(block.content as any)?.buttonText || ''}
                                onChange={(e) => handleBlockEdit(block.id, { ...(block.content as any), buttonText: e.target.value })}
                                className="w-1/2 text-sm border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white p-1.5"
                                placeholder="Button Text"
                              />
                              <input 
                                type="text" 
                                value={(block.content as any)?.url || ''}
                                onChange={(e) => handleBlockEdit(block.id, { ...(block.content as any), url: e.target.value })}
                                className="w-1/2 text-sm border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white p-1.5"
                                placeholder="Button URL"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{(block.content as any)?.title}</h3>
                            <p className="text-md text-slate-600 dark:text-slate-300 mb-4">{(block.content as any)?.price}</p>
                            <a href={(block.content as any)?.url || '#'} onClick={e => e.preventDefault()} className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium">
                              {(block.content as any)?.buttonText}
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  {block.type === 'spacer' && (
                    <div className="relative">
                      <div style={{ height: `${(block.content as any)?.height || 40}px` }} className="w-full"></div>
                      {activeBlock === block.id && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-2 rounded shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2 z-20" onClick={e => e.stopPropagation()}>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Height (px):</label>
                          <input 
                            type="number" 
                            value={(block.content as any)?.height || 40}
                            onChange={(e) => handleBlockEdit(block.id, { height: parseInt(e.target.value) || 10 })}
                            className="w-20 text-xs border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white p-1"
                            min="10"
                            max="200"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {block.type === 'dynamic' && (
                    <div className="p-4 text-center">
                      <div className="inline-block px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded font-mono text-sm">
                        {block.content as string}
                      </div>
                      {activeBlock === block.id && (
                        <div className="mt-4 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm max-w-xs mx-auto text-left">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Select Variable</label>
                          <select 
                            value={block.content as string}
                            onChange={(e) => handleBlockEdit(block.id, e.target.value)}
                            className="w-full text-sm border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white p-2"
                          >
                            <option value="{{user.firstName}}">User First Name</option>
                            <option value="{{user.lastName}}">User Last Name</option>
                            <option value="{{user.email}}">User Email</option>
                            <option value="{{company.name}}">Company Name</option>
                            <option value="{{unsubscribeUrl}}">Unsubscribe URL</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Block Actions */}
                {activeBlock === block.id && (
                  <div className="absolute right-0 top-0 -translate-y-full pb-2 flex gap-1 z-10">
                    <button className="p-1.5 bg-white dark:bg-slate-800 shadow-sm rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600">
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlock(block.id);
                      }}
                      className="p-1.5 bg-white dark:bg-slate-800 shadow-sm rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* Dropzone at the bottom */}
            <div 
              className="p-8 border-2 border-dashed border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex justify-center items-center text-slate-400"
              onDragOver={handleDragOver}
              onDrop={(e) => {
                e.stopPropagation();
                handleDrop(e, blocks.length);
              }}
            >
              Drop blocks here
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Preview: {templateName}</h3>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 flex justify-center">
              <div className="w-full max-w-2xl bg-white dark:bg-slate-800 shadow-sm">
                {blocks.map((block) => (
                  <div key={block.id} className="p-4">
                    {block.type === 'logo' && (
                      <div className="text-center py-4">
                        {block.content && (block.content as string).startsWith('data:image') || (block.content as string).startsWith('http') ? (
                          <img src={block.content as string} alt="Logo" className="max-h-16 mx-auto" />
                        ) : (
                          <div className="inline-block bg-slate-600 text-white text-3xl font-bold py-3 px-8 rounded-md">
                            {block.content as string}
                          </div>
                        )}
                      </div>
                    )}
                    {block.type === 'title' && (
                      <h1 className="text-2xl font-bold text-center text-slate-800 dark:text-white">{block.content as string}</h1>
                    )}
                    {block.type === 'image' && (
                      <div className="flex justify-center">
                        {block.content ? (
                          <img src={block.content as string} alt="Block" className="max-w-full h-auto rounded" />
                        ) : (
                          <div className="bg-slate-100 dark:bg-slate-800 w-full h-48 flex items-center justify-center text-slate-400">Image Placeholder</div>
                        )}
                      </div>
                    )}
                    {block.type === 'columns' && (
                      <div className="grid grid-cols-2 gap-4">
                        {(block.content as any[]).map((col: any) => (
                          <div key={col.id} className="flex justify-center">
                            {col.content ? (
                              <img src={col.content} alt="Col" className="max-w-full h-auto rounded" />
                            ) : (
                              <div className="bg-slate-100 dark:bg-slate-800 w-full h-48 flex items-center justify-center text-slate-400">Image</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {block.type === 'divider' && (
                      <div className="py-8">
                        <hr className="border-t border-slate-300 dark:border-slate-600" />
                      </div>
                    )}
                    {block.type === 'text' && (
                      <div 
                        className="text-slate-600 dark:text-slate-300 text-center whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: block.content as string }}
                      />
                    )}
                    {block.type === 'button' && (
                      <div className="text-center py-4">
                        <a href={(block as any).url || '#'} className="inline-block px-8 py-3 bg-slate-900 text-white rounded-md font-medium text-center">
                          {block.content as string}
                        </a>
                      </div>
                    )}
                    {block.type === 'footer' && (
                      <div className="bg-slate-100 dark:bg-slate-800/50 p-8 text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
                        <p className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-1">{(block.content as any).company}</p>
                        <p>{(block.content as any).address}</p>
                        <p className="mt-4">
                          This email was sent to <span className="border border-slate-300 px-1 rounded bg-white dark:bg-slate-800">{(block.content as any).email}</span>
                        </p>
                        <p>You've received this email because you've subscribed to our newsletter.</p>
                      </div>
                    )}
                    {block.type === 'video' && (
                      <div className="flex justify-center">
                        {!(block.content as any)?.url ? (
                          <div className="bg-slate-100 dark:bg-slate-800 w-full h-48 flex items-center justify-center text-slate-400">Video Placeholder</div>
                        ) : (
                          <div className="aspect-video bg-slate-900 flex items-center justify-center relative rounded overflow-hidden w-full max-w-lg">
                            <PlaySquare className="w-16 h-16 text-white opacity-80" />
                            <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                              {(block.content as any).url}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {block.type === 'social' && (
                      <div className="text-center py-4">
                        <div className="flex justify-center gap-4">
                          {['facebook', 'twitter', 'instagram', 'linkedin'].map(network => {
                            const url = (block.content as any)?.[network] || '';
                            if (!url) return null;
                            const Icon = network === 'facebook' ? Facebook : network === 'twitter' ? Twitter : network === 'instagram' ? Instagram : Linkedin;
                            return (
                              <a key={network} href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <Icon className="w-5 h-5" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {block.type === 'html' && (
                      <div 
                        className="min-h-[50px]"
                        dangerouslySetInnerHTML={{ __html: block.content as string }}
                      />
                    )}
                    {block.type === 'navigation' && (
                      <div className="py-4">
                        <div className="flex justify-center gap-6">
                          {((block.content as any[]) || []).map((navItem, i) => (
                            <a key={i} href={navItem.url || '#'} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600">
                              {navItem.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {block.type === 'product' && (
                      <div className="p-4 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                        <div className="w-32 h-32 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                          {(block.content as any)?.image ? (
                            <img src={(block.content as any).image} alt="Product" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <ShoppingBag className="w-8 h-8 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{(block.content as any)?.title}</h3>
                          <p className="text-md text-slate-600 dark:text-slate-300 mb-4">{(block.content as any)?.price}</p>
                          <a href={(block.content as any)?.url || '#'} className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium">
                            {(block.content as any)?.buttonText}
                          </a>
                        </div>
                      </div>
                    )}
                    {block.type === 'spacer' && (
                      <div style={{ height: `${(block.content as any)?.height || 40}px` }} className="w-full"></div>
                    )}
                    {block.type === 'dynamic' && (
                      <div className="p-4 text-center">
                        <div className="inline-block px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded font-mono text-sm">
                          {block.content as string}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-50">
          <Save className="w-5 h-5" />
          <span className="font-medium">Template "{templateName}" saved successfully!</span>
        </div>
      )}
    </div>
  );
}
