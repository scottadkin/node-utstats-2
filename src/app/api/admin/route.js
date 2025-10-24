import Session from "../../../../api/session";
import { headers, cookies } from "next/headers";
import Admin from "../../../../api/admin";
import { getAllGametypeNames } from "../../../../api/gametypes";
import { getAllUploadedImages as getAllUploadedMapImages, getImages } from "../../../../api/maps";
import { getAllObjectNames } from "../../../../api/genericServerSide.mjs";
import { cleanMapName } from "../../../../api/generic.mjs";
import { getAllFaces, getAllFacesWithFileStatuses, getFacesWithFileStatuses } from "../../../../api/faces";


export async function POST(req){

    try{

       // console.log(await req.formData());

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


        if(mode === "load-page-settings"){

            const settings = await adminManager.getAllPageSettings();

            const gametypeNames = await getAllGametypeNames();

            const names = [];

            for(const [key, value] of Object.entries(gametypeNames)){
                names.push({"name": value, "id": parseInt(key)});
            }

            return Response.json({settings, "gametypeNames": names});
        }


        if(mode === "save-page-changes"){

            const changes = res.changes ?? null;

            if(changes === null) throw new Error(`Changes was null`);

            await adminManager.savePageChanges(changes);
            return Response.json({"message": "pass"});
        }

        if(mode === "restore-page-settings"){

            const cat = res.cat ?? null;
            if(cat === null) throw new Error(`Site setting category was not supplied`);

            await adminManager.restorePageSettingsToDefault(cat);
            return Response.json({"message": "pass"});
        }

        if(mode === "get-all-uploaded-map-images"){


            //const images = await getAllUploadedMapImages();
            const mapNames = await getAllObjectNames("maps");

            const names = Object.values(mapNames);


            const currentMatches = getImages(names);

            const images = [];
     
            for(const [key, value] of Object.entries(mapNames)){

                const current = {
                    "name": value,
                    "imageName": cleanMapName(value).toLowerCase(),
                };

                if(currentMatches[current.imageName] !== undefined){

                    current.match = currentMatches[current.imageName];
                    current.bFullMatch = current.match === current.imageName;

                }else{
                    current.match = null;
                }

                images.push(current);
            }


            images.sort((a, b) =>{
                a = a.name;
                b = b.name;

                if(a < b) return -1;
                if(a > b) return 1;
                return 0;
            });
   
            return Response.json({"images": images});

        }

        if(mode === "get-faces"){

            const faces = await getAllFacesWithFileStatuses();

            return Response.json({"data": faces});
        }



        return Response.json({"error": "Unknown Request"});

    }catch(err){
        return Response.json({"error": err.toString()});
    }
}