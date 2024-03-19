"use server"
import { sha256 } from 'js-sha256';
import salt from "../../../salt";
import mysql from "../../../api/database";
import { cookies } from 'next/headers';
import { createRandomString } from "./generic";
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server';

async function getUserName(id){

    const query = `SELECT name FROM nstats_users WHERE id=?`;

    const result = await mysql.simpleQuery(query, [id])

    if(result.length > 0){
        return result[0].name;
    }

    return "Not Found";
}

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

    const query = `INSERT INTO nstats_sessions VALUES(NULL,?,?,?,?)`;

    expires = Math.floor(expires * 0.001);
    const now = Math.floor(Date.now() * 0.001);
    await mysql.simpleQuery(query, [now, userId, hash, "0.0.0.0"]);
}

async function bUserLoggedIn(userId){

}

async function deleteSession(userId, sId){

    const query = `DELETE FROM nstats_sessions WHERE user=? AND hash=?`;

    return await mysql.simpleQuery(query, [userId, sId]);
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

        const username = formData.get("username");
        let password = formData.get("password");

        if(username === null || username === "") throw new Error("No username entered");
        if(password === null || password === "") throw new Error("No password entered");

        password = sha256(`${salt()}${password}`);
        const query = `SELECT id FROM nstats_users WHERE name=? AND password=?`;

        const result = await mysql.simpleQuery(query, [username, password]);
    
        if(result.length === 0) throw new Error("Incorrect username or password");

        const userId = result[0].id;

        const permissions = await getAccountPermissions(userId);

        if(permissions.banned === 1) throw new Error("User account has been banned.");
        if(permissions.activated === 0) throw new Error("User account has not been activated.");

        const expires = new Date(Date.now() + 60 * 60 * 1000);

        const part1 = createRandomString(100);
        const part2 = createRandomString(100);
        const sid = sha256(`${part1}${part2}`);

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

       // ..const userId = cookieStore.get("nstats_userid");
       // ,,const sessionId = cookieStore.get("nstats_sid");

        //if(userId === undefined) throw new Error("UserId is undefined");
        //if(sessionId === undefined) throw new Error("sessionId is undefined");

        cookieStore.delete("nstats_name");
        cookieStore.delete("nstats_sid");
        cookieStore.delete("nstats_userid");

        return {"message": "done"};
    }catch(err){
        console.trace(err);
    }
}

async function bSessionValid(userId, sessionId){

    const query = `SELECT COUNT(*) as total_sessions FROM nstats_sessions WHERE user=? AND hash=?`;

    const result = await mysql.simpleQuery(query, [userId, sessionId]);

    if(result.length > 0){

        const r = result[0].total_sessions;
        return r > 0;
    }

    return false;
}

async function updateSessionExpires(userId, sessionId, expires){

    const query = `UPDATE nstats_sessions SET expires=? WHERE user=? AND hash=?`;

    expires = Math.floor(expires * 0.001);

    await mysql.simpleQuery(query, [expires, userId, sessionId]);
}

export async function updateSession(){

    try{

        const cookieStore = cookies();

        const sId = cookieStore.get("nstats_sid");

        if(sId === undefined) return null;

        const userId = cookieStore.get("nstats_userid");
        //const userName = cookieStore.get("nstats_name");

        if(!await bSessionValid(userId.value, sId.value)){

            await deleteSession(userId.value, sId.value);
            cookieStore.delete("nstats_name");
            cookieStore.delete("nstats_userid");
            cookieStore.delete("nstats_sid");
            
            
            return;
            //throw new Error("Not a valid session");   
        }

        const expires = new Date(Date.now() + 60 * 60 * 1000);

        const userName = await getUserName(userId.value);


       cookieStore.set("nstats_name", userName, {expires, "httpOnly": true, "path": "/"});
       cookieStore.set("nstats_userid", userId.value, {expires, "httpOnly": true, "path": "/"});
       cookieStore.set("nstats_sid", sId.value, {expires, "httpOnly": true, "path": "/"});

       await updateSessionExpires(userId.value, sId.value, expires);

       //return res;
       return userName;

    }catch(err){
        console.trace(err);
    }
}