import Session from "../../api/session";
import Servers from "../../api/servers"

export default async function handler(req, res){

    const session = new Session(req);

    try{

        await session.load();

        if(!await session.bUserAdmin()){

            res.status(200).json({"error": "Only users with admin can use these commands."});
            return;
        }

        const mode = (req.body.mode !== undefined) ? req.body.mode.toLowerCase() : "";

        if(mode === ""){
            res.status(200).json({"error": "No mode specified."});
            return;
        }

        const serverManager = new Servers();

        if(mode === "server-list"){
            
            const serverList = await serverManager.adminGetServerList();
            res.status(200).json(serverList);
            return;
        }

        if(mode === "edit-server"){

            if(await serverManager.adminUpdateServer(
                req.body.id, 
                req.body.name, 
                req.body.ip, 
                req.body.port, 
                req.body.password, 
                req.body.country
            )){

                res.status(200).json({"message": "passed"});
            }else{
                throw new Error("Failed to update server details.");
            }
        }

        res.status(200).json({"error": "Unknown command"});
        return;

    }catch(err){
        res.status(200).json({"error": err.toString()});
        return;
        
    }   
}