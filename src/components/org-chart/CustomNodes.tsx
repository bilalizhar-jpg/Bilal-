import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

const nodeStyle = {
  padding: '10px',
  borderRadius: '3px',
  width: '150px',
  fontSize: '12px',
  color: '#222',
  textAlign: 'center' as const,
  border: '1px solid #777',
  backgroundColor: '#fff',
};

const EditableLabel = ({ id, data, selected }: { id: string, data: any, selected: boolean }) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(data.label);
  }, [data.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setText(evt.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, label: text } };
        }
        return n;
      })
    );
  };

  const handleKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter') {
      handleBlur();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const textStyle = {
    fontWeight: data.textStyle?.bold ? 'bold' : 'normal',
    fontSize: data.textStyle?.fontSize ? `${data.textStyle.fontSize}px` : '12px',
    textAlign: data.textStyle?.align || 'center',
    color: 'inherit',
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full outline-none bg-transparent border-b border-indigo-500"
        style={textStyle}
      />
    );
  }

  return (
    <div 
      onClick={handleClick} 
      className="cursor-text min-h-[1.2em] w-full"
      title="Click to edit"
      style={textStyle}
    >
      {text || <span className="text-slate-400 italic">Click to edit</span>}
    </div>
  );
};

export const RectangleNode = memo(({ id, data, selected }: any) => {
  return (
    <div style={{ ...nodeStyle, border: selected ? '1px solid #555' : '1px solid #777', boxShadow: selected ? '0 0 0 2px #ddd' : 'none' }}>
      <Handle type="target" position={Position.Top} />
      <EditableLabel id={id} data={data} selected={selected} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

export const DiamondNode = memo(({ id, data, selected }: any) => {
  return (
    <div style={{ position: 'relative', width: '100px', height: '100px' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: 'rotate(45deg)',
          backgroundColor: '#fff',
          border: selected ? '1px solid #555' : '1px solid #777',
          boxShadow: selected ? '0 0 0 2px #ddd' : 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
          fontSize: '10px',
          textAlign: 'center',
          padding: '15px',
        }}
      >
        <EditableLabel id={id} data={data} selected={selected} />
      </div>
      <Handle type="target" position={Position.Top} style={{ top: -5, zIndex: 2 }} />
      <Handle type="source" position={Position.Bottom} style={{ bottom: -5, zIndex: 2 }} />
      <Handle type="source" position={Position.Left} style={{ left: -5, zIndex: 2 }} />
      <Handle type="source" position={Position.Right} style={{ right: -5, zIndex: 2 }} />
    </div>
  );
});

export const CircleNode = memo(({ id, data, selected }: any) => {
  return (
    <div
      style={{
        ...nodeStyle,
        borderRadius: '50%',
        width: '80px',
        height: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: selected ? '1px solid #555' : '1px solid #777',
        boxShadow: selected ? '0 0 0 2px #ddd' : 'none',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <EditableLabel id={id} data={data} selected={selected} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

export const ParallelogramNode = memo(({ id, data, selected }: any) => {
  return (
    <div
      style={{
        ...nodeStyle,
        transform: 'skew(-20deg)',
        border: selected ? '1px solid #555' : '1px solid #777',
        boxShadow: selected ? '0 0 0 2px #ddd' : 'none',
      }}
    >
      <div style={{ transform: 'skew(20deg)' }}>
        <Handle type="target" position={Position.Top} />
        <EditableLabel id={id} data={data} selected={selected} />
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
});

export const CylinderNode = memo(({ id, data, selected }: any) => {
  return (
    <div style={{ position: 'relative', width: '100px', height: '80px' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '20px',
          borderRadius: '50%',
          border: '1px solid #777',
          backgroundColor: '#fff',
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: 0,
          width: '100%',
          height: '70px',
          borderLeft: '1px solid #777',
          borderRight: '1px solid #777',
          borderBottom: '1px solid #777',
          backgroundColor: '#fff',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <EditableLabel id={id} data={data} selected={selected} />
      </div>
      <Handle type="target" position={Position.Top} style={{ top: 0, zIndex: 3 }} />
      <Handle type="source" position={Position.Bottom} style={{ bottom: 0, zIndex: 3 }} />
    </div>
  );
});

export const DocumentNode = memo(({ id, data, selected }: any) => {
  return (
    <div
      style={{
        ...nodeStyle,
        borderBottomLeftRadius: '20px 10px',
        borderBottomRightRadius: '20px 10px',
        border: selected ? '1px solid #555' : '1px solid #777',
        boxShadow: selected ? '0 0 0 2px #ddd' : 'none',
        position: 'relative',
        paddingBottom: '20px',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <EditableLabel id={id} data={data} selected={selected} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

export const TextNode = memo(({ id, data, selected }: any) => {
  return (
    <div
      style={{
        padding: '5px',
        minWidth: '100px',
        textAlign: 'center',
        border: selected ? '1px dashed #555' : '1px dashed transparent',
        backgroundColor: 'transparent',
      }}
    >
      <EditableLabel id={id} data={data} selected={selected} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
});

