"use client"
import Header from "../Header";
import { useEffect } from "react";

async function loadData(){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Cotnent-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "load-ftp"})
        });

        const res = await req.json();

        console.log(res);

    }catch(err){
        console.trace(err);
    }
}

export default function FTPManager(){

    useEffect(() =>{

        const controller = new AbortController();

        loadData(controller);

        return () =>{
            console.log("aa");
            controller.abort();
        }

    },[]);

    return <div>
        <Header>FTP Manager</Header>
    </div>
}