import React, { createContext, useContext, useState } from "react";

interface WoundUpdatePayload {
    specialist_id?: number;
    patient_id?: number;
    wound_length: number;
    wound_width: number;
    exudate_amount: string;
    exudate_type: string;
    tissue_type: string;
    wound_edges: string;
    skin_around: string;
    had_a_fever: boolean;
    pain_level: string;
    dressing_changes_per_day: string;
    guidelines_to_patient: string;
    image_id: number,
    extra_notes: string;
    track_date?: string;
    wound_id: number;
}


interface WoundUpdateContextType {
    woundUpdate: WoundUpdatePayload;
    setWoundUpdate: React.Dispatch<React.SetStateAction<WoundUpdatePayload>>;
}

const WoundUpdateContext = createContext<WoundUpdateContextType | undefined>(undefined);

export const WoundUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [woundUpdate, setWoundUpdate] = useState<WoundUpdatePayload>({
        wound_length: 0,
        wound_width: 0,
        exudate_amount: "",
        exudate_type: "",
        tissue_type: "",
        wound_edges: "",
        skin_around: "",
        had_a_fever: false,
        pain_level: "",
        dressing_changes_per_day: "",
        guidelines_to_patient: "",
        image_id: 0,
        extra_notes: "",
        wound_id: 0,
    });

    return (
        <WoundUpdateContext.Provider value={{ woundUpdate, setWoundUpdate }}>
            {children}
        </WoundUpdateContext.Provider>
    );
};

export const useWoundUpdate = () => {
    const context = useContext(WoundUpdateContext);
    if (!context) throw new Error("useWoundUpdate must be used within WoundUpdateProvider");
    return context;
};
