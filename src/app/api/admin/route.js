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

        const AdminManager = new Admin(session);
        await AdminManager.load();

       // const bAdmin = await session.bUserAdmin();

        //if(!bAdmin) return Response.json({"error": "Access Denied"});

        const res = await req.json();

        let mode = (res.mode !== undefined) ? res.mode.toLowerCase() : "";

        if(mode === "clear-tables"){
            await AdminManager.clearDatabases();
            return Response.json({"message": "passed"});
        }

        if(mode === "ftp-list"){

        }

        if(mode === "add-ftp-server"){

            const data = res.data ?? null;
            if(data === null) throw new Error(`FTP add server was passed no data.`);
            await AdminManager.addFTPServer(data);
            return Response.json({"message": "passed"});
        }
        
        //await AdminManager.clearDatabases();


        return Response.json({"error": "Unknown Request"});

    }catch(err){
        return Response.json({"error": err.toString()});
    }
}