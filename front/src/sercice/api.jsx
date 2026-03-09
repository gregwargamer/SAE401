import axios from "axios";

//ptn pas mal comme dependance axios
const apiClient = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: { "Content-Type": "application/json" },
});

//call a /all
export const getAll = async () => {
    const response = await apiClient.get("/all");
    return response.data;
};

// export const endpoints = {
//     demographie: "/statistiques/demographie",
//     economie: "/statistiques/economie",
//     logement: "/statistiques/logement",
//     parcSocial: "/statistiques/parc-social",
//     global: "/statistiques/global",
// };

export default apiClient;
