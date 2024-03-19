"use client"

import { useEffect } from "react";
//probably not the right way of doing this
async function fart(){

    try{

        const req = await fetch("/api/session", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"a": ""})
        });

        const res = await req.json();

        console.log(res);
    }catch(err){

        console.trace(err);
    }
}

export default function TestSession(){

    useEffect(() =>{
        fart();
    },[]);
    return <>
    </>
}