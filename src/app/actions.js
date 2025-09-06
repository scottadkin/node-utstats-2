"use server"
import { cookies } from "next/headers";
import User from "../../api/user";
import { redirect } from "next/navigation";

const MAX_COOKIE_AGE = ((60 * 60) * 24) * 365;


export async function loginUser(previousState, formData){

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

        return {"errors": result.errors, "username": rawFormData.username};
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

    redirect("/#loggedin");
    //return {"errors": [], "sid": "result.hash"};
}


export async function registerUser(previousState, formData){

    const userManager = new User();

    const rawFormData = {
        "username": formData.get("username"),
        "password": formData.get("password"),
        "password2": formData.get("password2")
    }

    let ip = "";
        
    const result = await userManager.register(rawFormData.username, rawFormData.password, rawFormData.password2, ip);

    if(result.errors.length !== 0 || !result.bPassed){

        return {"errors": result.errors};

    }

    if(result.bAutoLogin){

        await login(username, password, ip);

    }else{
        return {"errors": [], "bPassed": true};
    }
}