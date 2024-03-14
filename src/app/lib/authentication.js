"use server"
import { sha256 } from 'js-sha256';
import salt from "../../../salt";
import mysql from "../../../api/database";
import { cookies } from 'next/headers';



export async function register(formData){

    try{

        console.log("register");
        console.log(formData);

    }catch(err){
        console.trace(err);
    }
}

export async function login(formData){

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
        const query = `SELECT COUNT(*) FROM nstats_users WHERE name=? AND password=?`;

        console.log(await mysql.simpleQuery(query, ["ooper", password]));

        const cookieStore = cookies();
        //console.log(cookieStore.getAll());

        const expires = new Date(Date.now() + 60 * 1000);

        console.log(username, password);

        cookies().set("name",Math.random(),{expires, "httpOnly": true, "path": "/"});
        return "";
    }catch(err){
        console.trace(err);
        return err.toString();
    }
}