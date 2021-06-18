import Link from 'next/link';
import {useRouter} from 'next/router';

function Nav({session, settings}){

    const router = useRouter();

    session = JSON.parse(session);

    let displayName = "NOT FOUND";


    if(session.displayName !== undefined){
        displayName = session.displayName;
    }
    

    if(settings !== undefined){

        settings = JSON.parse(settings);

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
        };
    }

    const urls = {
        "Display Home": {"text": "Home", "url": "/"},
        "Display Matches": {"text": "Matches", "url": "/matches", "alt": ["/match/[id]","/pmatch/[match]"]},
        "Display Players": {"text": "Players", "url": "/players", "alt": ["/player/[id]"]},
        "Display Rankings":{"text": "Rankings", "url": "/rankings", "alt": ["/rankings/[id]"]},
        "Display Records": {"text": "Records", "url": "/records"},
        "Display Maps": {"text": "Maps", "url": "/maps", "alt": ["/map/[id]"]},
        "Display Admin": {"text": "Admin", "url": "/admin"},
        "Display Login/Logout": {"text": "Login/Register", "url": "/login"},
        
    }

    const pathName = router.pathname.toLowerCase();;

    let links = [];

    for(const [key, value] of Object.entries(urls)){


        if(settings[key] === "true"){

            if(key === "Display Login/Logout"){

                if(session.bLoggedIn === undefined){
                    links.push({"url": `/login`, "text": "Login/Register"});
                }else{
            
                    if(session.bLoggedIn){
            
                        links.push({"url": `/login`, "text": `Logout ${displayName}`});
                    }else{
                        links.push({"url": `/login`, "text": "Login/Register"});
                    }
                }

            }else if(key === "Display Admin"){

                if(session.bAdmin && session.bLoggedIn){

                    links.push({
                        "url": value.url,
                        "text": value.text,
                        "alt": value.alt
                    });
                }

            }else{

                links.push({
                    "url": value.url,
                    "text": value.text,
                    "alt": value.alt
                });
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


        elems.push(<Link key={i} href={links[i].url}><a><div className={`nl ${(bCurrent) ? "green" : null}`}>{links[i].text}</div></a></Link>);
    }

    return (
        <div>
        <div id="mouse-over">
                <div id="mouse-over-title"></div>
                <div id="mouse-over-content"></div>
            </div>
        <header>
            <h1>Node UTStats 2</h1>
            <nav>
                {elems} 

            </nav>         
        </header>
        </div>
        
    );
}

export default Nav;