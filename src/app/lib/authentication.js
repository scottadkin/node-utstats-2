"use server"
import { sha256 } from 'js-sha256';
import salt from "../../../salt";
import mysql from "../../../api/database";
import { cookies } from 'next/headers';
import { createRandomString } from "./generic";
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server';


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



async function createSession(userId, hash, expires){

    const query = `INSERT INTO nstats_sessions VALUES(NULL,?,?,?,?,?,?)`;

    expires = Math.floor(expires * 0.001);
    const now = Math.floor(Date.now() * 0.001);
    await mysql.simpleQuery(query, [now, userId, hash, now, expires, "0.0.0.0"]);
}

async function bUserLoggedIn(userId){

}

async function updateSessionExpires(hash, expires){

}

async function deleteSession(){

}

async function getAccountPermissions(id){

    const query = `SELECT name,activated,admin,banned,upload_images FROM nstats_users WHERE id=?`;

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

        const userId = result[0].id;

        const permissions = await getAccountPermissions(userId);

        if(permissions.banned === 1) throw new Error("User account has been banned.");
        if(permissions.activated === 0) throw new Error("User account has not been activated.");

        const expires = new Date(Date.now() + 60 * 60 * 1000);

        console.log(username, password);

        const part1 = createRandomString(100);
        const part2 = createRandomString(100);
        const sid = sha256(`${part1}${part2}`);

        console.log(`sid = ${sid}`);

        await createSession(userId, sid, expires);

        cookies().set("nstats_name", permissions.name,{expires, "httpOnly": true, "path": "/"});
        cookies().set("nstats_userid", userId,{expires, "httpOnly": true, "path": "/"});
        cookies().set("nstats_sid", sid,{expires, "httpOnly": true, "path": "/"});
        return {"message": "ok", "error": null};
    }catch(err){
        //console.trace(err);
        return {"error": err.toString(), "message": null};
    }
}

export async function logout(){

    try{
        const cookieStore = cookies();

        console.log(cookieStore.getAll());

        cookieStore.delete("nstats_name");
        cookieStore.delete("nstats_sid");
        cookieStore.delete("nstats_userid");

        return {"message": "done"};
    }catch(err){
        console.trace(err);
    }
}

export async function updateSession(nextRequest){

    try{

        const sId = nextRequest.cookies.get("nstats_sid");

        if(sId === undefined) return;

        const userId = nextRequest.cookies.get("nstats_userid");
        const userName = nextRequest.cookies.get("nstats_name");

        
        const expires = new Date(Date.now() + 60 * 60 * 1000);

        const res = NextResponse.next();

        res.cookies.set({
            "name": "nstats_name",
            "value": userName.value,
            "httpOnly": true,
            "expires": expires
        });

        res.cookies.set({
            "name": "nstats_userid",
            "value": userId.value,
            "httpOnly": true,
            "expires": expires
        });

        res.cookies.set({
            "name": "nstats_sid",
            "value": sId.value,
            "httpOnly": true,
            "expires": expires
       });

       return res;

    }catch(err){
        console.trace(err);
    }
}