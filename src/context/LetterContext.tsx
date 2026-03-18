import React, { createContext, useContext, useState, ReactNode, useEffect} from 'react';
import { 
 collection, 
 onSnapshot, 
 doc, 
 setDoc, 
 updateDoc,
 deleteDoc,
 query
} from 'firebase/firestore';
import { db} from '../firebase';
import { handleFirestoreError, OperationType} from '../utils/firestoreErrorHandler';

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
 // Clearance fields
 itClearance?: boolean;
 hrClearance?: boolean;
 financeClearance?: boolean;
 adminClearance?: boolean;
 // Exit interview fields
 reasonForLeaving?: string;
 feedbackOnManagement?: string;
 workEnvironmentReview?: string;
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

import { useAuth} from './AuthContext'; // Import useAuth

// ... imports

export const LetterProvider = ({ children}: { children: ReactNode}) => {
 const { user} = useAuth(); // Get user
 const [letters, setLetters] = useState<Letter[]>([]);
 const [templates, setTemplates] = useState<LetterTemplate[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 if (!user) {
 setLetters([]);
 setTemplates([]);
 setLoading(false);
 return;
}

 const qLetters = query(collection(db, 'letters'));
 const unsubscribeLetters = onSnapshot(qLetters, (snapshot) => {
 const lettersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id} as Letter));
 setLetters(lettersData);
}, (error) => {
 handleFirestoreError(error, OperationType.LIST, 'letters');
});

 const qTemplates = query(collection(db, 'letterTemplates'));
 const unsubscribeTemplates = onSnapshot(qTemplates, (snapshot) => {
 const templatesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id} as LetterTemplate));
 setTemplates(templatesData);
 setLoading(false);
}, (error) => {
 handleFirestoreError(error, OperationType.LIST, 'letterTemplates');
});

 return () => {
 unsubscribeLetters();
 unsubscribeTemplates();
};
}, [user]); // Depend on user

 const addLetter = async (letter: Omit<Letter, 'id'>) => {
 const id = Math.random().toString(36).substr(2, 9);
 const newLetter: Letter = {
 ...letter,
 id,
};
 try {
 // Use JSON stringify/parse to deeply remove all undefined values
 const cleanLetter = JSON.parse(JSON.stringify(newLetter));
 await setDoc(doc(db, 'letters', id), cleanLetter);
} catch (error) {
 console.error("Error adding letter:", error);
}
};

 const updateLetter = async (id: string, letter: Partial<Letter>) => {
 try {
 const cleanLetter = JSON.parse(JSON.stringify(letter));
 await updateDoc(doc(db, 'letters', id), cleanLetter);
} catch (error) {
 console.error("Error updating letter:", error);
}
};

 const updateLetterStatus = async (id: string, status: 'Saved' | 'Sent') => {
 try {
 await updateDoc(doc(db, 'letters', id), { status});
} catch (error) {
 console.error("Error updating letter status:", error);
}
};

 const deleteLetter = async (id: string) => {
 try {
 await deleteDoc(doc(db, 'letters', id));
} catch (error) {
 console.error("Error deleting letter:", error);
}
};

 const addTemplate = async (template: Omit<LetterTemplate, 'id'>) => {
 const id = Math.random().toString(36).substr(2, 9);
 const newTemplate: LetterTemplate = {
 ...template,
 id,
};
 try {
 // Use JSON stringify/parse to deeply remove all undefined values
 const cleanTemplate = JSON.parse(JSON.stringify(newTemplate));
 await setDoc(doc(db, 'letterTemplates', id), cleanTemplate);
} catch (error) {
 console.error("Error adding template:", error);
}
};

 const deleteTemplate = async (id: string) => {
 try {
 await deleteDoc(doc(db, 'letterTemplates', id));
} catch (error) {
 console.error("Error deleting template:", error);
}
};

 return (
 <LetterContext.Provider value={{ letters, templates, addLetter, updateLetter, updateLetterStatus, deleteLetter, addTemplate, deleteTemplate}}>
 {children}
 </LetterContext.Provider>
 );
};
