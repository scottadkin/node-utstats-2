import Link from 'next/link';
import { useRouter } from 'next/router';

function createLink(url, displayTitle, cleanPath, highlightWords, bDisplay){

    if(!bDisplay) return null;

    let className = "nl";

    let h = 0;

    for(let i = 0; i < highlightWords.length; i++){

        h = highlightWords[i];

        if(cleanPath === h){
            className = "nl green";
            break;
        }
    }
    

    return <Link href={url}><a><div className={className}>{displayTitle}</div></a></Link>;
}

const Nav = () =>{

    const router = useRouter();

    const fullPathName = router.pathname.toLowerCase();
    const pathReg = /classic\/(.+?)(\/.*|$)/i;

    const pathResult = pathReg.exec(fullPathName);

    let cleanPath = "";
    
    if(pathResult !== null){
        cleanPath = pathResult[1].toLowerCase();
    }

    return <header>
        <div id="beta-message">
            This is an early beta build, there may be problems at first, they will be fixed once reported <a className="yellow" href="https://github.com/scottadkin/node-utstats-2/issues">Here</a>
        </div>
        <h1>Node UTStats 2 Classic Mode</h1>
        <nav>
            <Link href="/"><a><div className="nl yellow">Main Site</div></a></Link>

            {createLink("/classic/", "Classic Home", cleanPath, [""], true)}
            {createLink("/classic/matches", "Matches", cleanPath, ["match","matches"], true)}
            {createLink("/classic/rankings", "Rankings", cleanPath, ["rankings"], true)}
            {createLink("/classic/servers", "Servers", cleanPath, ["servers"], true)}
            {createLink("/classic/players", "Players", cleanPath, ["players","player"], true)}
            {createLink("/classic/maps", "Maps", cleanPath, ["map","maps"], true)}
            {createLink("/classic/records", "Records", cleanPath, ["records"], true)}

        </nav>         
</header>
}

export default Nav;