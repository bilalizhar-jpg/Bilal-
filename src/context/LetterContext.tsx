import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

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
  address?: string;
  mobile?: string;
  subject?: string;
  itClearance?: boolean;
  hrClearance?: boolean;
  financeClearance?: boolean;
  adminClearance?: boolean;
  reasonForLeaving?: string;
  feedbackOnManagement?: string;
  workEnvironmentReview?: string;
  companyId?: string;
}

export interface LetterTemplate {
  id: string;
  name: string;
  content: string;
  companyId?: string;
}

interface LetterContextType {
  letters: Letter[];
  templates: LetterTemplate[];
  addLetter: (letter: Omit<Letter, 'id'>) => void;
  updateLetter: (id: string, letter: Partial<Letter>) => void;
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
  const { user, isAuthReady } = useAuth();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const companyId = user?.currentCompanyId || user?.companyId;

  useEffect(() => {
    if (!isAuthReady || !user || !companyId) {
      setLetters([]);
      setTemplates([]);
      return;
    }
    Promise.all([
      api.get<Letter[]>('letters', { companyId }).catch(() => []),
      api.get<LetterTemplate[]>('letterTemplates', { companyId }).catch(() => []),
    ]).then(([lettersData, templatesData]) => {
      setLetters(Array.isArray(lettersData) ? lettersData : []);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
    });
  }, [user?.id, companyId, isAuthReady]);

  const addLetter = async (letter: Omit<Letter, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newLetter: Letter = { ...letter, id, companyId };
    try {
      await api.post('letters', JSON.parse(JSON.stringify(newLetter)));
      setLetters((prev) => [...prev, newLetter]);
    } catch (error) {
      console.error('Error adding letter:', error);
    }
  };

  const updateLetter = async (id: string, letter: Partial<Letter>) => {
    try {
      await api.put('letters', id, JSON.parse(JSON.stringify(letter)));
      setLetters((prev) => prev.map((l) => (l.id === id ? { ...l, ...letter } : l)));
    } catch (error) {
      console.error('Error updating letter:', error);
    }
  };

  const updateLetterStatus = async (id: string, status: 'Saved' | 'Sent') => {
    try {
      await api.put('letters', id, { status });
      setLetters((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch (error) {
      console.error('Error updating letter status:', error);
    }
  };

  const deleteLetter = async (id: string) => {
    try {
      await api.delete('letters', id);
      setLetters((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      console.error('Error deleting letter:', error);
    }
  };

  const addTemplate = async (template: Omit<LetterTemplate, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newTemplate: LetterTemplate = { ...template, id, companyId };
    try {
      await api.post('letterTemplates', JSON.parse(JSON.stringify(newTemplate)));
      setTemplates((prev) => [...prev, newTemplate]);
    } catch (error) {
      console.error('Error adding template:', error);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await api.delete('letterTemplates', id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <LetterContext.Provider value={{ letters, templates, addLetter, updateLetter, updateLetterStatus, deleteLetter, addTemplate, deleteTemplate }}>
      {children}
    </LetterContext.Provider>
  );
};
