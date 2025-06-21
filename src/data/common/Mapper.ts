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

export interface Specialist {
    email: string;
    name: string;
    birthday?: string;
    state?: string;
    city?: string;
    specialist_id: number;
    created_at?: string;
    updated_at?: string;
    patients?: Patient[];
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

export interface WoundRegion {
    description: string;
    subregions: Record<string, string>;
}

export interface Wound {
    region: string;
    subregion: string;
    type: string;
    start_date: string;
    end_date: string;
    patient_id: number;
    wound_id: number;
    image_id: number | null;
    tracking_records?: WoundRecord[];
}

export interface WoundRecord {
    width: string;
    length: string;
    wound_width: string;
    wound_length: string;
    exudate_amount: string;
    exudate_type: string;
    tissue_type: string;
    wound_edges: string;
    skin_around_the_wound: string;
    had_a_fever: boolean;
    pain_level: string;
    dressing_changes_per_day: string;
    guidelines_to_patient: string;
    extra_notes: string;
    image_id: number;
    created_at: string;
    updated_at: string;
    track_date: string;
    wound_id: number;
    specialist_id: number;
    tracking_record_id: number;
}

export function calculateAge(birthday: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    if (month < birthday.getMonth() || (month === birthday.getMonth() && day < birthday.getDate())) {
        age--;
    }

    return age;
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

    return `${day}/${month}/${year} (${age}) Anos`;
}

export function formatPatientBirthday(data: Patient[]): Patient[] {
    return data?.map((patient) => ({
            ...patient,
            birthday: formatBirthDate(patient.birthday),
        })
    ) || [];
}

export function formatDate(dateString: string): string {
    const [year, month, day] = dateString.split("-");

    return `${day}/${month}/${year}`;
}

