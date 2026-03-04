import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Letter {
  id: string;
  category: string;
  type: string;
  userId?: string;
  customName?: string;
  customEmail?: string;
  title: string;
  date: string;
  description: string;
  status: 'Saved' | 'Sent';
}

export interface LetterTemplate {
  id: string;
  name: string;
  content: string;
}

interface LetterContextType {
  letters: Letter[];
  templates: LetterTemplate[];
  addLetter: (letter: Omit<Letter, 'id'>) => void;
  updateLetterStatus: (id: string, status: 'Saved' | 'Sent') => void;
  deleteLetter: (id: string) => void;
  addTemplate: (template: Omit<LetterTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;
}

const LetterContext = createContext<LetterContextType | undefined>(undefined);

export const useLetters = () => {
  const context = useContext(LetterContext);
  if (!context) {
    throw new Error('useLetters must be used within a LetterProvider');
  }
  return context;
};

export const LetterProvider = ({ children }: { children: ReactNode }) => {
  const [letters, setLetters] = useState<Letter[]>(() => {
    const saved = localStorage.getItem('letters');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [templates, setTemplates] = useState<LetterTemplate[]>(() => {
    const saved = localStorage.getItem('letterTemplates');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: '1',
        name: 'Standard Warning Letter',
        content: 'Dear [Employee Name],\n\nThis letter serves as a formal warning regarding [Reason].\n\nPlease ensure this does not happen again.\n\nSincerely,\nHR Department'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('letters', JSON.stringify(letters));
  }, [letters]);

  useEffect(() => {
    localStorage.setItem('letterTemplates', JSON.stringify(templates));
  }, [templates]);

  const addLetter = (letter: Omit<Letter, 'id'>) => {
    const newLetter: Letter = {
      ...letter,
      id: Math.random().toString(36).substr(2, 9),
    };
    setLetters(prev => [newLetter, ...prev]);
  };

  const updateLetterStatus = (id: string, status: 'Saved' | 'Sent') => {
    setLetters(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const deleteLetter = (id: string) => {
    setLetters(prev => prev.filter(l => l.id !== id));
  };

  const addTemplate = (template: Omit<LetterTemplate, 'id'>) => {
    const newTemplate: LetterTemplate = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return (
    <LetterContext.Provider value={{ letters, templates, addLetter, updateLetterStatus, deleteLetter, addTemplate, deleteTemplate }}>
      {children}
    </LetterContext.Provider>
  );
};
