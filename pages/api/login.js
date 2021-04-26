
import shajs from 'sha.js';
import UserManager from '../../api/user';

export default async (req, res) =>{


    try{

        const user = new UserManager();

        if(req.method === "POST"){

            console.log("method is post");
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
                console.log(result);
            }
            
            

           

           // console.log(shajs('sha256').update('yhg3894vgh934h834').digest('hex'))
            // => 73475cb40a568e8da8a045ced110137e159f890ac4da883b6b17dc651b3a8049

            const userExists = await user.bUserExists(username);
            const passwordsMatch = user.bPasswordsMatch(password, password2);

            const errors = (result.errors !== undefined) ? result.errors : [];


            res.status(200).json({"userExists": userExists, "userCreated":  userCreated,"passwordsMatch": passwordsMatch, "errors": errors})
        }

        

    }catch(err){
        console.trace(err);
        res.status(200).json({"error": err});
    }
}