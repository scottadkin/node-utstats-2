import mysql from "./database";
import { cleanInt } from "./generic.mjs";

class PlayerSearch{

    constructor(){}


    async defaultSearch(name, page, perPage, country){

        //console.log(`---------------------------`);
        //console.log(cleanInt(1444, 4440, 2111, 999999999, 442422));
        //console.log(cleanInt(-99, 111, 447, 0, 9));
        //console.log(cleanInt(22, 0, null));


        page = cleanInt(page, 1, null);
        console.log("|||||||||||||||||||||||");
        perPage = cleanInt(perPage, 5, 100);

        console.log(`page = ${page}`);
        console.log(`perPage = ${perPage}`);

        page--;


    }
}

export default PlayerSearch;