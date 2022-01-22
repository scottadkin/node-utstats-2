import Link from 'next/link';
import {useRouter} from 'next/router';
import styles from './Nav.module.css';

function Nav({session, settings}){

    const router = useRouter();

    session = JSON.parse(session);

    //console.log(session);

    let displayName = "NOT FOUND";

    if(session.displayName !== undefined){
        displayName = session.displayName;
    }

    let order = [];
    
    if(settings !== undefined){

        const parsedSettings = JSON.parse(settings);

        settings = parsedSettings.settings;
        order = parsedSettings.order;


    }else{
        settings = {
            "Display Home": "true",
            "Display Matches": "true",
            "Display Players": "true",
            "Display Rankings": "true",
            "Display Records": "true",
            "Display Maps": "true",
            "Display Login/Logout": "true",
            "Display Admin": "true",
            "Display ACE": "true",
        };

        order = {
            'Display Home': 0,
            'Display Matches': 1,
            'Display Players': 2,
            'Display Rankings': 3,
            'Display Records': 4,
            'Display Maps': 5,
            'Display ACE': 6,
            'Display Admin': 7,
            'Display Login/Logout': 8
        }
    }

    const urls = {
        "Display Home": {"text": "Home", "url": "/"},
        "Display Matches": {"text": "Matches", "url": "/matches", "alt": ["/match/[id]","/pmatch/[match]"]},
        "Display Players": {"text": "Players", "url": "/players", "alt": ["/player/[id]"]},
        "Display Rankings":{"text": "Rankings", "url": "/rankings/0", "alt": ["/rankings/[id]"]},
        "Display Records": {"text": "Records", "url": "/records", "alt": ["/ctfcaps"]},
        "Display Maps": {"text": "Maps", "url": "/maps", "alt": ["/map/[id]"]},
        "Display Admin": {"text": "Admin", "url": "/admin"},
        "Display ACE": {"text": "Ace", "url": "/ace"},
        "Display Login/Logout": {"text": "Login/Register", "url": "/login"},
        
    }

    const pathName = router.pathname.toLowerCase();

    let links = [];

    for(const [key, value] of Object.entries(urls)){

        if(settings[key] === "true"){

            if(key === "Display Login/Logout"){

                if(session.bLoggedIn === undefined){
                    links[order[key]] = {"url": `/login`, "text": "Login/Register"};
                }else{
            
                    if(session.bLoggedIn){
            
                        links[order[key]] = {"url": `/login`, "text": `Logout ${displayName}`};
                    }else{
                        links[order[key]] = {"url": `/login`, "text": "Login/Register"};
                    }
                }

            }else if(key === "Display Admin" || key === "Display ACE"){

                if(session.bAdmin && session.bLoggedIn){

                    links[order[key]] = {
                        "url": value.url,
                        "text": value.text,
                        "alt": value.alt
                    };
                }

            }else{

                links[order[key]] = {
                    "url": value.url,
                    "text": value.text,
                    "alt": value.alt
                };
            }
        }
    }

    let bCurrent = false;
    const elems = [];

    for(let i = 0; i < links.length; i++){

        bCurrent = false;

        if(pathName === links[i].url.toLowerCase()){

            bCurrent = true;

        }else{

            if(links[i].alt !== undefined){

                for(let x = 0; x < links[i].alt.length; x++){
                    
                    if(pathName === links[i].alt[x].toLowerCase()){
                        bCurrent = true;
                    }
                }

            }
        }


        elems.push(<Link key={i} href={links[i].url}><a><div className={`${styles.nl} ${(bCurrent) ? "green" : null}`}>{links[i].text}</div></a></Link>);
    }

    return (
        <div className={styles.wrapper}>
        <div id="mouse-over">
                <div id="mouse-over-title"></div>
                <div id="mouse-over-content"></div>
            </div>
        <header className={styles.header}>
            <div id="beta-message">
                This is an early beta build, there may be problems at first, they will be fixed once reported <a className="yellow" href="https://github.com/scottadkin/node-utstats-2/issues">Here.</a> Build v2.4.0 XXth January 2022
            </div>
            <h1 className={styles.h1}>Node UTStats 2</h1>
            <nav className={styles.nav}>
                {elems}
            </nav>         
        </header>
        </div>
        
    );
}

export default Nav;