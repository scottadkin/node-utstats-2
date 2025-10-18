"use client"
import { useState } from "react";

export default function Checkbox({name, initialValue, bForceValue}){

    if(initialValue === undefined) initialValue = false;
    if(bForceValue === undefined) bForceValue = false;
    const [value, setValue] = useState(initialValue);

    const className = (value) ? "team-green" : "team-red";
    const text = (value) ? "True" : "False";



    return <div className={`checkbox ${className}`} onClick={() =>{
        if(bForceValue) return;
        setValue(() => !value)
    }}>
        {text}
        <input type="hidden" name={name} value={value}/>
    </div>
}