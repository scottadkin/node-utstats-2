import Link from 'next/link';
import {useRouter} from 'next/router';

function Nav({session}){

    const router = useRouter();

    const pathName = router.pathname.toLowerCase();;

    const links = [
        {"url": `/`, "text": "Home"},
        {"url": `/matches`, "text": "Matches", "alt": "/match/[id]"},
        {"url": `/players`, "text": "Players", "alt": "/player/[id]"},
        {"url": `/rankings/0`, "text": "Rankings", "alt": "/rankings/[id]"},
        {"url": `/records`, "text": "Records"},
        {"url": `/maps`, "text": "Maps", "alt": "/map/[id]"}
        //{"url": `/login`, "text": "Login/Register",},
    ];

    session = JSON.parse(session);

    if(session.bLoggedIn === undefined){
        links.push({"url": `/login`, "text": "Login/Register"});
    }else{

        if(session.bLoggedIn){

            if(session.bAdmin !== undefined){

                if(session.bAdmin){
                    links.push({"url": `/admin`, "text": "Admin"});
                }
            }
            links.push({"url": `/login`, "text": "Logout"});
        }else{
            links.push({"url": `/login`, "text": "Login/Register"});
        }
    }
    

    let bCurrent = false;
    const elems = [];

    for(let i = 0; i < links.length; i++){

        if(pathName === links[i].url.toLowerCase()){

            bCurrent = true;

        }else{

            if(links[i].alt !== undefined){

                if(pathName === links[i].alt.toLowerCase()){
                    bCurrent = true;
                }else{
                    bCurrent = false;
                }

            }else{

                bCurrent = false;
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