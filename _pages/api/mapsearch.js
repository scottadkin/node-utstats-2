import Maps from "../../api/maps";
import {cleanMapName} from "../../api/generic.mjs";

export default async function handler(req, res){

    const manager = new Maps();

    let name = (req.query.name !== undefined) ? req.query.name : "";
    let page = (req.query.page !== undefined) ? parseInt(req.query.page) : 1;
    if(page !== page || page < 1) page = 1;
    let perPage = (req.query.perPage !== undefined) ? parseInt(req.query.perPage) : 25;
    if(perPage !== perPage || perPage > 100 || perPage < 5) perPage = 25;

    let order = (req.query.order !== undefined) ? parseInt(req.query.order) : 1; 

    let sortBy = (req.query.sortBy !== undefined) ? req.query.sortBy.toLowerCase() : "name";

    const data = await manager.defaultSearch(page, perPage, name, order, sortBy);


    const uniqueMapNames = [...new Set(data.map((d) =>{
        
        return d.name;

    }))];

    const mapImages = await manager.getImages(uniqueMapNames);
 
    for(let i = 0; i < data.length; i++){

        const currentName = cleanMapName(data[i].name).toLowerCase();

        if(mapImages[currentName] === undefined){
            data[i].image = "default";
        }else{
            data[i].image = mapImages[currentName];
        }
    }

    let totalResults = 0;

    if(data.length > 0){
        totalResults = await manager.getTotalResults(name);
    }

    res.status(200).json({"data": data, "totalResults": totalResults});
    return;


    res.status(200).json({"error": "Unknown command"});
}