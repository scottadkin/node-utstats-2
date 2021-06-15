import Session from '../../api/session';
import Admin from '../../api/admin';

export default async (req, res) =>{


    const session = new Session(req);

    await session.load();

    if(await session.bUserAdmin()){

        const body = JSON.parse(req.body);

        const data = body.data;
        const admin = new Admin();

        console.log(data);

        if(data !== undefined){

            if(data.mode === "edit"){

                if(data.id > 0){

                    await admin.updateFTPServer(

                        data.id,
                        data.name,
                        data.host,
                        data.port,
                        data.user,
                        data.password,
                        data.target_folder,
                        data.delete_after_import

                    );

                    res.status(200).json({"message": "passed"});
                    return;

                }else{

                    res.status(200).json({"message": "You have not selected a server to edit"});
                    return;
                }

            }else if(data.mode === "create"){

                await admin.addFTPServer(
                    data.name,
                    data.host,
                    data.port,
                    data.user,
                    data.password,
                    data.target_folder,
                    data.delete_after_import,
                );

                res.status(200).json({"message": "passed"});
                    return;

            }else{
                res.status(200).json({"message": "Unknown request"});
                return;
            }
        }


        res.status(200).json({"message": "Data is undefined"});
        return;
    }

    res.status(200).json({"message": "Only admins can perform this action."});

}