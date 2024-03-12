"use client"

import { useEffect } from "react";


async function getData(){

    try{

        const req = await fetch("../api/testRoute?test=444",{
            "method": "GET",
            "headers": {"Content-type": "application/json"}
        });

        const res = await req.json();

        console.log(res);

    }catch(err){
        console.trace(err);
    }
}

export default function Test(){

    useEffect(() =>{

        getData();
    },[])

    return <div>

        test
    </div>
}