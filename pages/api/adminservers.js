import Session from "../../api/session";

export default async function handler(req, res){

    const session = new Session(req);

    await session.load();

    if(await session.bUserAdmin()){


        res.status(200).json({"error": "Unknown command"});
        return;
    }

    res.status(200).json({"error": "Only users with admin can use these commands."});
}