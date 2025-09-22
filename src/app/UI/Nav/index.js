"use client"
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import styles from './Nav.module.css';
import { logoutUser } from '../../actions';

const urls = {
    "Display Home": {"text": "Home", "url": "/"},
    "Display Matches": {"text": "Matches", "url": "/matches", "reg": /^\/(?:match|pmatch).+$/i},
    "Display Servers": {"text": "Servers", "url": "/servers", "reg": /^\/server.+$/i},
    "Display Players": {"text": "Players", "url": "/players", "reg": /^\/player.+$/i,},
    "Display Rankings":{"text": "Rankings", "url": "/rankings/0", "reg": /^\/rankings\/.+$/i},
    "Display Records": {"text": "Records", "url": "/records", "reg": /^\/(?:records|ctfcaps).+$/i},
    "Display Maps": {"text": "Maps", "url": "/maps", "reg": /^\/map\/.+$/i},
    "Display Admin": {"text": "Admin", "url": "/admin"},
    "Display ACE": {"text": "ACE", "url": "/ace"},
    "Display Login/Logout": {"text": "Login/Register", "url": "/login"},    
};

const defaultSettings = {
    "Display Home": "true",
    "Display Matches": "true",
    "Display Servers": "true",
    "Display Players": "true",
    "Display Rankings": "true",
    "Display Records": "true",
    "Display Maps": "true",
    "Display Login/Logout": "true",
    "Display Admin": "true",
    "Display ACE": "true",
};

const defaultOrder = {
    'Display Home': 0,
    'Display Matches': 1,
    'Display Servers': 2,
    'Display Players': 3,
    'Display Rankings': 4,
    'Display Records': 5,
    'Display Maps': 6,
    'Display ACE': 7,
    'Display Admin': 8,
    'Display Login/Logout': 9
};

function Nav({session, settings}){

    let displayName = "NOT FOUND";

    if(session.displayName !== undefined){
        displayName = session.displayName;
    }


    let order = [];
    
    
    if(settings !== undefined){

        if(typeof settings === "string"){
            settings = JSON.parse(settings);
        }

        const parsedSettings = settings;

        settings = parsedSettings.settings;
        order = parsedSettings.order;


    }else{
        settings = defaultSettings;
        order = defaultOrder;
    }

    const pathName = usePathname().toLowerCase();

    let links = [];

    for(const [key, value] of Object.entries(urls)){

        if(settings[key] === "true"){

            if(key === "Display Login/Logout"){

                if(session.bLoggedIn === undefined){
                    links[order[key]] = {"url": `/login`, "text": "Login/Register"};
                }else{
            
                    if(session.bLoggedIn){
            
                        links[order[key]] = {"url": `#logout`, "text": `Logout ${displayName}`};
                    }else{
                        links[order[key]] = {"url": `/login`, "text": "Login/Register"};
                    }
                }

            }else if(key === "Display Admin" || key === "Display ACE"){

                if(session.bAdmin && session.bLoggedIn){

                    links[order[key]] = {
                        "url": value.url,
                        "text": value.text,
                    };
                }

            }else{

                links[order[key]] = {
                    "url": value.url,
                    "text": value.text,
                };

                if(value.reg !== undefined){
                    links[order[key]].reg = value.reg;
                }
            }
        }
    }

    const elems = [];

    for(let i = 0; i < links.length; i++){

        if(links[i] === undefined) continue;
        
        let bCurrent = false;

        if(links[i].reg !== undefined){

            if(links[i].reg.test(pathName)){
       
                bCurrent = true;
            }
        }

        if(pathName === links[i].url.toLowerCase()){

             bCurrent = true;
        }

        let onClickFunction = null;

        if(links[i].url === "#logout"){
            onClickFunction = logoutUser;
        }

        elems.push(<Link key={i} href={links[i].url}>
            <div className={`${styles.nl} ${(bCurrent) ? styles.selected : null}`} onClick={onClickFunction}>
                {links[i].text}
            </div>
        </Link>);
    }

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <h1 className={styles.h1} style={{"display": "none"}}>Node UTStats 2</h1>
                <nav className={styles.nav}>
                    {elems}
                </nav>         
            </header>
        </div>   
    );
}

export default Nav;