import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditContextProps {
    editingNodeId: string | null;
    setEditingNodeId: (id: string | null) => void;
}

const EditContext = createContext<EditContextProps | undefined>(undefined);

export const EditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

    return (
        <EditContext.Provider value={{ editingNodeId, setEditingNodeId }}>
            {children}
        </EditContext.Provider>
    );
};

export const useEdit = (): EditContextProps => {
    const context = useContext(EditContext);
    if (context === undefined) {
        throw new Error('useEdit must be used within an EditProvider');
    }
    return context;
};
