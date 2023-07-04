const Maps = require("../../api/maps");

export default async function handler(req, res){
    console.log(req.query);

    const manager = new Maps();

    let name = (req.query.name !== undefined) ? req.query.name : "";
    let page = (req.query.page !== undefined) ? parseInt(req.query.page) : 1;
    if(page !== page || page < 1) page = 1;
    let perPage = (req.query.perPage !== undefined) ? parseInt(req.query.perPage) : 25;
    if(perPage !== perPage || perPage > 100 || perPage < 5) perPage = 25;

    let order = (req.query.order !== undefined) ? parseInt(req.query.order) : 1; 

    console.log(`page = ${page}`, `perPage = ${perPage}`, name, order);

    const data = await manager.defaultSearch(page, perPage, name, order);

    //onsole.log(data);

    res.status(200).json({"data": data});
    return;


    res.status(200).json({"error": "Unknown command"});
}