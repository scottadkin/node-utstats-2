"use client"
import { useEffect, useState} from "react";


export default function useScreenInfo(){

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    function updateStats(){

        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }
    

    useEffect(() =>{

        window.addEventListener("resize", updateStats);

        updateStats();

        return () =>{
            window.removeEventListener("resize", updateStats);
        }

    },[]);

    return {"screenWidth": width, "screenHeight": height};
}