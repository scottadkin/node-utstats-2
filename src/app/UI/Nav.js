"use client"
import styles from "./Nav.module.css";
import { usePathname } from "next/navigation";
import Link from "next/link";


export default function Nav({params}){

    const pathname = usePathname().toLowerCase();

    const options = [
        {
            "name": "Home", 
            "url": "/", 
            "bExactMatchesOnly": true,
            "matches": ["/"]},
        {
            "name": "Matches", 
            "url": "/matches", 
            "matches": [
                "/match/",
                "/matches"
            ]
        },
        {
            "name": "Login",
            "url": "/login",
            "matches": ["/login"]
        },
        {
            "name": "Register",
            "url": "/register",
            "matches": ["/register"]
        }
    ];

    const elems = [];

    for(let i = 0; i < options.length; i++){

        const o = options[i];

        let bActive = false;
   
        for(let x = 0; x < o.matches.length; x++){

            const m = o.matches[x];

            const bExactMatchesOnly = o?.bExactMatchesOnly || false;
  
            if(!bExactMatchesOnly){

                if(pathname.toLowerCase().startsWith(m)){
                    bActive = true;
                    break;
                }

            }else{

                if(pathname === m) {
                    bActive = true; 
                    break;
                }
            }    
        }
        
        const className = (bActive) ? styles.active : "";

        const elem = <Link href={o.url} key={i} className={className}>{o.name}</Link>;

        elems.push(elem);
    }

    return <nav className={styles.wrapper}>
        {elems}
    </nav>
}