import Session from "../../api/session";
import User from "../../api/user";

export default async (req, res) =>{

    try{


        const session = new Session(req);

        await session.load();

        if(await session.bUserAdmin()){

            const body = JSON.parse(req.body);
            console.log(body);

            const user = new User();

            if(body.type === "admin"){

                await user.changeAdminPermission(body.user, body.value);

            }else if(body.type === "images"){
                await user.changeImagesPermission(body.user, body.value);
            }

            res.status(200).json({"message": "passed"});

        }else{
            res.status(200).json({"message": "Only admins can access this!"});
        }

    }catch(err){
        res.status(200).json({"message": `Error: ${err}`});
    }
}