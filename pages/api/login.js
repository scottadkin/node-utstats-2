import cookie from 'cookie';
import UserManager from '../../api/user';

export default async (req, res) =>{

    const MAX_COOKIE_AGE = ((60 * 60) * 24) * 365;
    const user = new UserManager();

    async function login(username, password, ip){

        const result = await user.login(username, password, ip);

        if(result.errors.length !== 0 || !result.bPassed){

            res.status(200).json({"errors": result.errors});
            return;
        }

        res.setHeader("Set-Cookie", [

                cookie.serialize("sid", result.hash, {
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
            })]
        );

        res.status(200).json({"errors": [], "sid": result.hash});
    }

    async function register(username, password, password2, ip){
        
        const result = await user.register(username, password, password2, ip);

        if(result.errors.length !== 0 || !result.bPassed){

            res.status(200).json({"errors": result.errors});
            return;
        }

        if(result.bAutoLogin){

            await login(username, password, ip);

        }else{
            return res.status(200).json({"errors": [], "bPassed": true});
        }
    }

    try{


        if(req.method === "POST"){

            // 0 login 1 register
            const mode = parseInt(req.body.mode);
            const username = req.body.username;
            const password = req.body.password;
            const ip = req.socket.remoteAddress;

            if(mode === 0){

                await login(username, password, ip);
                return;     
                
            }else if(mode === 1){

                const password2 = (req.body.password2 !== undefined) ? req.body.password2 : "";

                await register(username, password, password2, ip);
                return;
            }

            res.status(200).json({"errors": ["Unknown login mode"]});
        }        

    }catch(err){
        console.trace(err);
        res.status(200).json({"errors": err});
    }
}