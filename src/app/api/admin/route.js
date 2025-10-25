import Session from "../../../../api/session";
import { headers, cookies } from "next/headers";
import Admin from "../../../../api/admin";
import { getAllGametypeNames } from "../../../../api/gametypes";
import { getAllUploadedImages as getAllUploadedMapImages, getImages } from "../../../../api/maps";
import { getAllObjectNames } from "../../../../api/genericServerSide.mjs";
import { cleanMapName, sortByName } from "../../../../api/generic.mjs";
import { getAllFaces, getAllFacesWithFileStatuses, getFacesWithFileStatuses } from "../../../../api/faces";
import { adminMatchesSearch } from "../../../../api/matches";



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


        if(mode === "load-matches"){


            const sortBy = (res.sortBy !== undefined) ? res.sortBy.toLowerCase() : null;
            const order = (res.order !== undefined) ? res.order.toLowerCase() : null;
            const page = (res.page !== undefined) ? parseInt(res.page) : 1;
            const perPage = (res.perPage !== undefined) ? parseInt(res.perPage) : 100;
            const selectedServer = (res.selectedServer !== undefined) ? parseInt(res.selectedServer) : 0;
            const selectedGametype = (res.selectedGametype !== undefined) ? parseInt(res.selectedGametype) : 0;
            const selectedMap = (res.selectedMap !== undefined) ? parseInt(res.selectedMap) : 0;
            
            if(selectedServer !== selectedServer) throw new Error(`Server must be a valid integer`);
            if(selectedGametype !== selectedGametype) throw new Error(`Gametype must be a valid integer`);
            if(selectedMap !== selectedMap) throw new Error(`Map must be a valid integer`);

            //const data = await adminMatchesSearch(sortBy, order, page);
            const {totalMatches, data} = await adminMatchesSearch(sortBy, order, selectedServer, selectedGametype, selectedMap, page, perPage);

            return Response.json({totalMatches, data});
            //console.log(data);
        }

        if(mode === "get-all-match-names"){

            const servers = await getAllObjectNames("servers", true);
            const gametypes = await getAllObjectNames("gametypes", true);
            const maps = await getAllObjectNames("maps", true);

    
            return Response.json({servers, gametypes, maps});
        }


        return Response.json({"error": "Unknown Request"});

    }catch(err){
        return Response.json({"error": err.toString()});
    }
}