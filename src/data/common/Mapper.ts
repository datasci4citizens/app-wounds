import type { PatientPayload } from "@/routes/patient/PatientCreate.tsx";


export interface Patient {
    name: string;
    birthday: string;
    lastAppointment: string;
    woundType: string;
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

export function mapPatientPayloadToPatient(data: PatientPayload[]): Patient[] {
    return data?.flatMap((patient) =>({
            name: patient.name,
            birthday: formatBirthDate(patient.birthday),
            lastAppointment: patient.email,
            woundType: patient.email,
        })
    ) || [];
}
