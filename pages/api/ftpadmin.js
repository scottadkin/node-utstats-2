import Session from '../../api/session';
import Admin from '../../api/admin';

export default async (req, res) =>{


    const session = new Session(req);

    await session.load();

    if(await session.bUserAdmin()){

        const body = req.body;
        const mode = (body.mode !== undefined) ? body.mode.toLowerCase() : "";
        const admin = new Admin();

        const errors = [];

        if(mode === "load"){

            const data = await admin.getAllFTPServers();

            res.status(200).json({"data": data});
            return;

        }else if(mode === "create"){

            console.log(body);

            if(body.server !== undefined){
                if(body.server.length === 0) errors.push("Server name must be at least 1 character long");
            }else{
                errors.push("Server name is undefined");
            }

            if(body.ip !== undefined){
                if(body.ip.length === 0) errors.push("You have not specified an ip");
            }else{
                errors.push("Ip is undefined");
            }

            if(body.port !== undefined){

                body.port = parseInt(body.port);

                if(body.port !== body.port){
                    errors.push("Port is NaN");
                }else{

                    if(body.port < 1 || body.port > 65535){
                        errors.push("Port must be between 1 and 65535");
                    }
                }

            }else{
                errors.push("Port is undefined");
            }

            if(errors.length === 0){

                const result = await admin.addFTPServer(
                        body.server, 
                        body.ip, 
                        body.port, 
                        body.user, 
                        body.password, 
                        body.folder, 
                        body.deleteLogs, 
                        body.deleteTmp, 
                        body.ignoreBots, 
                        body.ignoreDuplicates, 
                        body.minPlayers, 
                        body.minPlaytime
                    );

                res.status(200).json({"message": "Passed", "id": result});
                return;
            }

        }else if(mode === "delete"){

            const serverId = body.id;

            const result = await admin.deleteFTPServer(serverId);

            if(result === 0){
                res.status(200).json({"error": "There was a problem deleting the server settings."});
                return;
            }

            res.status(200).json({"message": "passed"});
            return;

        }else if(mode === "edit"){


            const result = await admin.updateFTPServer(body.id, body.server, body.ip, body.port, body.user, body.password, body.folder, body.deleteLogs, 
                body.deleteTmp, body.ignoreBots, body.ignoreDuplicates, body.minPlayers, body.minPlaytime);
            
            if(result > 0){

                res.status(200).json({"message": "passed"});
                return;

            }else{
                res.status(200).json({"error": "Failed to update any servers."});
                return;
            }
        }


        res.status(200).json({"error": ["Unknown command", ...errors]});
        return;
    }

    res.status(200).json({"message": "Only admins can perform this action."});

}