export interface Patient {
    name: string;
    gender: string;
    birthday: string;
    email: string;
    hospital_registration: string;
    phone_number: string;
    height: number;
    weight: number;
    smoke_frequency: string;
    drink_frequency: string;
    accept_tcle: boolean;
    specialist_id: number;
    patient_id: number;
    created_at?: string;
    updated_at?: string;
    comorbidities: any[];
}

export interface WoundPatient {
    name: string;
    gender: string;
    birthday: string;
    email: string;
    hospital_registration: string;
    phone_number: string;
    height: number;
    weight: number;
    smoke_frequency: string;
    drink_frequency: string;
    accept_tcle: boolean;
    specialist_id: number;
    patient_id: number;
    created_at?: string;
    updated_at?: string;
    comorbidities: any[];
    wounds: Wound[]
}

export interface Wound {
    wound_region: string;
    wound_subregion: string;
    wound_type: string;
    start_date: string;
    end_date: string;
    patient_id: number;
    wound_id: number;
}

function calculateAge(birthday: Date): string{
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    if (month < birthday.getMonth() || (month === birthday.getMonth() && day < birthday.getDate())) {
        age--;
    }

    return `${age} Anos`;
}

function formatBirthDate(birthday: string | undefined): string {
    console.log(birthday)
    if (birthday === undefined) {
        return "";
    }

    const date = new Date(birthday);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const age = calculateAge(date)

    return `${day}/${month}/${year} (${age})`;
}

export function formatPatientBirthday(data: Patient[]): Patient[] {
    return data?.map((patient) =>({
            ...patient,
            birthday: formatBirthDate(patient.birthday),
        })
    ) || [];
}
