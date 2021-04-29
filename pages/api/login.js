import cookie from 'cookie';
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
            let loggedIn = false;
            let hash = "";

            let errors = [];

            if(mode === 1){

                password2 = req.body.password2;

                result = await user.register(username, password, password2);
                errors = (result.errors !== undefined) ? result.errors : [];

                //finish this
              
            }else if(mode === 0){

                result = await user.login(username, password);

                errors = (result.errors !== undefined) ? result.errors : [];

                if(result.hash !== ""){

                    loggedIn = true;
                    hash = result.hash;

                    res.setHeader("Set-Cookie", cookie.serialize("sid", hash, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV !== "development",
                        maxAge: (60 * 60) * 24,
                        sameSite: "strict",
                        path: "/"
                    }));

                    console.log(errors);

                    res.statusCode = 200;
                    res.json({
                        "sid": hash,
                        "errors": errors
                    });
                }
            }
            
            if(errors.length > 0){
                res.status(200).json({"errors": errors})
            }
        }        

    }catch(err){
        console.trace(err);
        //res.status(200).json({"error": err});
    }
}