import Servers from "../../api/servers";
import Maps from "../../api/maps";
import Gametypes from "../../api/gametypes";

export default async function handler(req, res){

    try{

        let mode = req.body.mode ?? "";
        mode = mode.toLowerCase();

        const serverManager = new Servers();
        const mapManager = new Maps();
        const gametypeManager = new Gametypes();

        if(mode === "full-list"){
            
            const serverNames = await serverManager.getAllNames();
            const mapNames = await mapManager.getAllNameAndIds();
            const gametypeNames = await gametypeManager.getAllNames();
            
            mapNames[0] = "All Maps";
            serverNames[0] = "All Servers";
            gametypeNames[0] = "All Gametypes";

            res.status(200).json({"serverNames": serverNames, "mapNames": mapNames, "gametypeNames": gametypeNames});
            return;

        }

        res.status(200).json({"error": "Unknown command"});

    }catch(err){
        res.status(200).json({"error": err.toString()});
    }
}