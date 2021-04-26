
import shajs from 'sha.js';
import UserManager from '../../api/user';

export default async (req, res) =>{


    try{

        const user = new UserManager();

        if(req.method === "POST"){

            console.log(req.body);

            const mode = parseInt(req.body.mode);
            let username = req.body.username;
            let password = req.body.password;
            let password2 = "";

            let result = "";

            let userCreated = false;

            if(mode === 1){

                password2 = req.body.password2;

                result = await user.register(username, password, password2);

                userCreated = result.bPassed;
              
            }else if(mode === 0){

                result = await user.login(username, password);
            }
            
            const errors = (result.errors !== undefined) ? result.errors : [];

            res.status(200).json({"userCreated":  userCreated, "errors": errors})
        }

        

    }catch(err){
        console.trace(err);
        res.status(200).json({"error": err});
    }
}