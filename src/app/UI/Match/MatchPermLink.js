"use client"
import styles from "./MatchPermLink.module.css";
import ErrorMessage from "../ErrorMessage";
import { useState, useEffect } from "react";

async function copyToClipboard(url, setError){

    try{
        await navigator.clipboard.writeText(url);

    }catch(err){

        if(err.name === "TypeError"){
            setError(`Copy to clipboard does not work unless the site is running on a secure connection(HTTPS), 
                but more likely Scott is too lazy to make it work for http, so here is a link below you can copy.`);
            return;
        }
        
        console.trace(err);
    }
}

function changeUrl(setUrl, value){
    setUrl(() => value);
}

export default function MatchPermLink({hash}){

    "use client"
    const [error, setError] = useState(null);
    const [url, setUrl] = useState("");

    useEffect(() =>{
            changeUrl(setUrl, `${window.location.protocol}//${window.location.hostname}:${window.location.port}/match/${hash}`);
    },[hash]);


    if(hash === "") return null;

    if(error !== null){

        return <div className={styles.wrapper}>
            <ErrorMessage title="Match Permalink" text={error} />
            <input type="text" className={`${styles.url} team-red`} readOnly={true} onClick={(e) => {
                e.target.select()}} value={url}/> 
        </div>
    }

    return <div className={styles.wrapper} onClick={() => copyToClipboard(url, setError)}>
        <div className={`${styles.button} team-red`}>Copy Match Permalink To Clipboard</div>
        
    </div>
}