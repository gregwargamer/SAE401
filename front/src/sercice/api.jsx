function api() {
    //tout dabord la base de l'url api parce que vasy

    //ici metait vos trucs la dedans parce que ca sera surement differnet suivant vois machines 
    const baseUrl = 'http://localhost:8000/api';

    const endpoints = {
        //je précise que les endpooints supportent les paramètres genre departement=75&annee=2023 et ca ca marhce pour tous les endpoints
        demographie: `${baseUrl}/statistiques/demographie`,
        economie: `${baseUrl}/statistiques/economie`,
        logement: `${baseUrl}/statistiques/logement`,
        parcSocial: `${baseUrl}/statistiques/parc-social`,
        global: `${baseUrl}/statistiques/global`,
    };

    return endpoints;
}
