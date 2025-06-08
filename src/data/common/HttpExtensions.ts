export async function getRequest(url: string) {
    return fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "authorization" : "Bearer " + localStorage.getItem("access_token") 
        },
        mode: 'cors'
    }).then(res => {
        const json = res.json()

        return json
    })
}

export async function postRequest<T>(url: string, { arg }: { arg: T }) {  // Change the signature to match SWR's format
    try {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                "authorization" : "Bearer " + localStorage.getItem("access_token") 

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

export async function patchRequest(url: string, { arg }: { arg: any }) {
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                "authorization" : "Bearer " + localStorage.getItem("access_token") 
            },
            body: JSON.stringify(arg)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`Request failed with status ${response.status}: ${
                errorData ? JSON.stringify(errorData) : 'No error details'
            }`);
        }

        return response.json();
    } catch (error) {
        console.error('PATCH request failed:', error);
        throw error;
    }
}

export function getBaseURL(path: string, queryParams?: Record<string, string>): string {
    // Create a URL that combines the base path with the specific API path
    const url = new URL(path, import.meta.env.VITE_SERVER_URL);

    if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    return url.toString();
}