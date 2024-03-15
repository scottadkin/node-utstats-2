"use server"
import { sha256 } from 'js-sha256';
import salt from "../../../salt";
import mysql from "../../../api/database";
import { cookies } from 'next/headers';


async function bAccountActive(id){

    const query = `SELECT activated FROM nstats_users WHERE id=?`;

    const result = await mysql.simpleQuery(query, [id]);

    if(result.length === 0) throw new Error(`There is no user with the account id of ${id}`);

    if(result[0].activated === 1) return true;

    return false;
}

async function bAccountBanned(id){

    const query = `SELECT banned FROM nstats_users WHERE id=?`;

    const result = await mysql.simpleQuery(query, [id]);

    if(result.length === 0) throw new Error(`There is no user with the account id of ${id}`);

    if(result[0].banned === 1) return true;

    return false;
}

async function bAccountAdmin(id){

    const query = `SELECT admin FROM nstats_users WHERE id=?`;

    const result = await mysql.simpleQuery(query, [id]);

    if(result.length === 0) throw new Error(`There is no user with the account id of ${id}`);

    if(result[0].admin === 1) return true;

    return false;
}


async function getAccountPermissions(id){

    const query = `SELECT activated,admin,banned,upload_images FROM nstats_users WHERE id=?`;

    const result = await mysql.simpleQuery(query, [id]);

    if(result.length > 0) return result[0];

    throw new Error(`There is no user with the account id of ${id}`);
}

export async function register(currentState, formData){

    try{

        console.log("register");
        console.log(formData);

    }catch(err){
        console.trace(err);
    }
}


export async function login(currentState, formData){

    try{

        console.log("test");
        console.log(formData);

        //console.log(sha256("test"));
        //console.log(salt());

        const username = formData.get("username");
        let password = formData.get("password");

        if(username === null || username === "") throw new Error("No username entered");
        if(password === null || password === "") throw new Error("No password entered");

        password = sha256(`${salt()}${password}`);
        const query = `SELECT id FROM nstats_users WHERE name=? AND password=?`;

        const result = await mysql.simpleQuery(query, [username, password]);
    
        if(result.length === 0) throw new Error("Incorrect username or password");

        const cookieStore = cookies();

        const permissions = await getAccountPermissions(result[0].id);

        if(permissions.banned === 1) throw new Error("User account has been banned.");
        if(permissions.activated === 0) throw new Error("User account has not been activated.");

        const expires = new Date(Date.now() + 60 * 1000);

        console.log(username, password);

        cookies().set("name",Math.random(),{expires, "httpOnly": true, "path": "/"});
        return {"message": "ok", "error": null};
    }catch(err){
        //console.trace(err);
        return {"error": err.toString(), "message": null};
    }
}