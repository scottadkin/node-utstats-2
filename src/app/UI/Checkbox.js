"use client"
import { useState } from "react";

export default function Checkbox({name, initialValue}){

    if(initialValue === undefined) initialValue = false;
    const [value, setValue] = useState(initialValue);

    const className = (value) ? "team-green" : "team-red";
    const text = (value) ? "True" : "False";



    return <div className={`checkbox ${className}`} onClick={() =>{
        setValue(() => !value)
    }}>
        {text}
        <input type="hidden" name={name} value={value}/>
    </div>
}