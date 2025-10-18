import styles from './MessageBox.module.css';
import { useState } from 'react';
import Image from 'next/image';


export default function MessageBox({text, title, children, type}){

    const [hide, setHide] = useState(false);

    if(children === null) return null;
    if(hide) return null;

    if(text !== undefined && text == null) return null;

    let elems = null;

    if(type === undefined) type = "note";

    let bgClassName = `team-none`;

    if(title === undefined) title = "";

    if(type === "error"){
        bgClassName = `team-red`;
        if(title === "") title = "Error";
    }else if(type === "pass"){
        bgClassName = "team-green";
        if(title === "") title = "Success";
    }else if(type === "warn" || type === "warning"){
        bgClassName = "team-yellow";
        if(title === "") title = "Warning";
    }else{
        if(title === "") title = "Message";
    }

 
    if(text === undefined && children === undefined){

        elems = <>
            No text or children components provided.
        </>
        
    }else if(children !== undefined){

        elems = children;

    }else if(text !== undefined){
        elems = text;
    }

    return <div className={`${styles.wrapper} ${bgClassName}`}>
        <div className={styles.title}>
            <div><b>{title}</b></div> <div><Image src="/images/controlpoint.png" alt="image" width={14} height={14} onClick={() => setHide(() => true)}/></div>
        </div>
        <div className={styles.text}>
            {elems}
        </div>
    </div>
}
