import Session from "../../../../api/session";
import { headers, cookies } from "next/headers";
import Admin from "../../../../api/admin";


export async function POST(req){

    try{

        const cookieStore = await cookies();
        const header = await headers();
        const cookiesData = cookieStore.getAll();
    
        const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
        
        const session = new Session(ip, cookiesData);
    
        await session.load();

        const adminManager = new Admin(session);
        await adminManager.load();

       // const bAdmin = await session.bUserAdmin();

        //if(!bAdmin) return Response.json({"error": "Access Denied"});

        const res = await req.json();

        let mode = (res.mode !== undefined) ? res.mode.toLowerCase() : "";

        if(mode === "clear-tables"){
            await adminManager.clearDatabases();
            return Response.json({"message": "passed"});
        }

        if(mode === "ftp-list"){

            const data = await adminManager.getFTPList();

            return Response.json({data});
        }

        if(mode === "add-ftp-server"){

            const data = res.data ?? null;
            if(data === null) throw new Error(`FTP add server was passed no data.`);
            await adminManager.addFTPServer(data);
            return Response.json({"message": "passed"});
        }

        if(mode === "update-ftp-server"){

            const data = res.data ?? null;
            if(data === null) throw new Error(`FTP add edit server was passed no data.`);
            await adminManager.updateFTPServer(data);
            return Response.json({"message": "passed"});
        }

        if(mode === "delete-ftp-server"){

            let id = res.id ?? 0;
            id = parseInt(id);
            if(id !== id) id = 0;
            if(id === 0) throw new Error("No server selected");

            await adminManager.deleteFTPServer(id);

            return Response.json({"message": "passed"});
        }
        

        if(mode === "load-logs-folder-settings"){

            const data = await adminManager.getLogsFolderSettings();

            return Response.json({"data": data});
        }

        if(mode === "save-logs-folder-settings"){

            const settings = res.settings ?? null;

            if(settings === null) throw new Error(`Logs folder settings is null`);

            await adminManager.updateLogsFolderSettings(settings);
            return Response.json({"message": "pass"});
        }

        //await adminManager.clearDatabases();


        return Response.json({"error": "Unknown Request"});

    }catch(err){
        return Response.json({"error": err.toString()});
    }
}