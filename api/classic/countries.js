import mysql from './database';
import mainCountries from '../countries';

class Countries{

    constructor(){

    }

    async getMostPopular(max){

        const query = "SELECT country,COUNT(*) as total_uses FROM uts_pinfo GROUP BY(country) ORDER BY total_uses DESC LIMIT ?";
        const result = await mysql.simpleQuery(query, [max]);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            const currentCountry = mainCountries(r.country)

            r.name = currentCountry.country;
            r.code = currentCountry.code;
        }


        return result;
    }
}


export default Countries;