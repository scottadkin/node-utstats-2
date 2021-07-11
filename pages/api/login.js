import cookie from 'cookie';
import UserManager from '../../api/user';

export default async (req, res) =>{


    try{

        const MAX_COOKIE_AGE = ((60 * 60) * 24) * 365;

        const user = new UserManager();

        if(req.method === "POST"){

            const mode = parseInt(req.body.mode);
            let username = req.body.username;
            let password = req.body.password;
            let password2 = "";

            let result = "";

            let userCreated = false;
            let loggedIn = false;
            let hash = "";

            let errors = [];

            const login = async (bAutoLogin) =>{

                result = await user.login(username, password, req.socket.remoteAddress);

                errors = (result.errors !== undefined) ? result.errors : [];

                if(result.hash !== ""){

                    loggedIn = true;
                    hash = result.hash;

                    res.setHeader("Set-Cookie", [

                        cookie.serialize("sid", hash, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV !== "development",
                        maxAge: MAX_COOKIE_AGE,
                        sameSite: "strict",
                        path: "/"
                    }),

                    cookie.serialize("displayName", username, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV !== "development",
                        maxAge: MAX_COOKIE_AGE,
                        sameSite: "strict",
                        path: "/"
                    })
                ]);

                    res.statusCode = 200;

                    res.json({
                        "sid": hash,
                        "errors": errors,
                        "bAutoLogin": (bAutoLogin !== undefined) ? true : false
                    });
                }
            }

            const register = async () =>{

                password2 = req.body.password2;

                result = await user.register(username, password, password2, req.socket.remoteAddress);
                errors = (result.errors !== undefined) ? result.errors : [];

                //finish this

                let bAutoLogin = false;

                if(errors.length === 0){

                    if(result.bAutoLogin !== undefined){

                        if(result.bAutoLogin){
                            bAutoLogin = true;
                            console.log("attempt autologin");
                            await login(true);
                           
                        }
                    }

                    if(!bAutoLogin){
                        res.statusCode = 200;
                        res.json({
                            "bPassed": true,
                            "errors": errors,
                            "twat": "yes"
                        });
                    }
                }
            }

            if(mode === 1){

                await register();
              
            }else if(mode === 0){

                await login();
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