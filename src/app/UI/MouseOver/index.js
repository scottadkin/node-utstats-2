"use client"
import { useRef, useState, useEffect } from "react";

export function BasicMouseOver({children, text}){

    const [bDisplayed, setBDisplayed] = useState(false);
    const [marginLeft, setMarginLeft] = useState(0);
    const [marginTop, setMarginTop] = useState(0);
    const mouseRef = useRef(null);

   // if(!bDisplayed) return children;

    useEffect(() =>{
        //console.log(mouseRef.current);
        const bounds = mouseRef.current.getBoundingClientRect();
        //console.log(bounds);
        setMarginTop(-bounds.height);
    },[bDisplayed]);


    return <div onMouseOver={() =>{
        setBDisplayed(() => true);
    }} onMouseLeave={() =>{ setBDisplayed(() =>false)}}>
        <div ref={mouseRef} onMouseMove={() =>{ setBDisplayed(false)}} className={`basic-mouse-over ${(bDisplayed) ? "" : "hidden"}`} style={{"marginTop": marginTop}}>
            {text}
        </div>
        {children}
    </div>
}