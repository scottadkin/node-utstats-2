
import cookie from "cookie";
import User from '../../api/user';

export default async (req, res) =>{

    let bPassed = false;
    let cookies = req.headers.cookie;

    console.log(cookies);

    //cookies = cookie.parse(cookies);

    if(cookies !== undefined){
        const parsedCookies = cookie.parse(cookies);

        console.log(cookies);

        console.log("USER TRIED TO LOGOUT");

        const userManager = new User();

        const bLoggedIn = await userManager.bLoggedIn(cookies);

        console.log(`Logged in = ${bLoggedIn}`);

        if(bLoggedIn){

            res.setHeader("Set-Cookie", cookie.serialize("sid", parsedCookies.sid, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                sameSite: "strict",
                path: "/",
                maxAge: new Date(0)
            }));

            await userManager.deleteSession(parsedCookies.sid);

            bPassed = true;
        }
    }

    res.statusCode = 200;
    res.json({"passed": bPassed});
}