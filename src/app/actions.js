"use server"
import { cookies } from "next/headers";
import User from "../../api/user";

const MAX_COOKIE_AGE = ((60 * 60) * 24) * 365;


export async function loginUser(formData){

    const cookieStore = await cookies();
    const userManager = new User();

    console.log(formData);
    //console.log(formData.get("username"));

    const rawFormData = {
        "username": formData.get("username"),
        "password": formData.get("password")
    }

    const result = await userManager.login(rawFormData.username, rawFormData.password, "ip");

    console.log(result);

    if(result.errors.length !== 0 || !result.bPassed){

        return {"errors": result.errors};
    }

    console.log(rawFormData);

    cookieStore.set({
        "name": "sid",
        "value": result.hash,
        "httpOnly": true,
        "path": "/",
        "maxAge": MAX_COOKIE_AGE,
        "sameSite": "strict"
    });

    cookieStore.set({
        "name": "displayName",
        "value": username,
        "httpOnly": true,
        "path": "/",
        "maxAge": MAX_COOKIE_AGE,
        "sameSite": "strict"
    });

    return {"errors": [], "sid": "result.hash"};
}