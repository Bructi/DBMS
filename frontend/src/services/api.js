const BASE_URL = "http://localhost:5000/api";

export const getFunds = async () => {
    const response = await fetch(`${BASE_URL}/funds`);
    if (!response.ok) {
        throw new Error("Failed to fetch funds");
    }
    return response.json();
};
