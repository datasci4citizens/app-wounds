export async function getRequest(url: string) {
    return fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        mode: 'cors'
    }).then(res => {
        const json = res.json()

        return json
    })
}

export async function postRequest(url: string, { arg }: { arg: any }) {  // Change the signature to match SWR's format
    try {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(arg)  // Use arg directly, as SWR wraps the data
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`Request failed with status ${response.status}: ${
                errorData ? JSON.stringify(errorData) : 'No error details'
            }`);
        }

        return response.json();
    } catch (error) {
        console.error('POST request failed:', error);
        throw error;
    }
}

export function getBaseURL(path: string, queryParams?: Record<string, string>): string {
    const baseURL = import.meta.env.VITE_SERVER_URL;
    const url = new URL(path, baseURL);

    if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    return url.toString();
}