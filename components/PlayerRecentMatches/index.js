import Link from 'next/link';
import Timestamp from '../TimeStamp/';
import styles from './PlayerRecentMatches.module.css';
import Playtime from '../Playtime/';
//import RecentMatchResult from '../RecentMatchResult/'

const getMapName = (maps, id) =>{

    for(let i = 0; i < maps.length; i++){

        if(maps[i].id === id){
            return maps[i].name;
        }
    }

    return 'Not Found';
}

const PlayerRecentMatches = ({matches, maps}) =>{

    matches = JSON.parse(matches);
    maps = JSON.parse(maps);
    //console.log(matches);
    console.log(maps);


    const elems = [];

    elems.push(
     <div className={`${styles.default} ${styles.header}`}>
         <div className="yellow">Date</div>
         <div className="yellow">Map</div>
         <div className="yellow">Playtime</div>
         <div className="yellow">Result</div>
     </div>
    );

    let m = 0;


    for(let i = 0; i < matches.length; i++){

        m = matches[i];


        elems.push(
            <Link key={m.id} href={`/match/${m.match_id}`}>
                <a>
                    <div className={styles.default}>
                        <Timestamp timestamp={m.match_date} />        
                        <div>
                            {getMapName(maps, m.map_id)}
                        </div>
                        <div><Playtime seconds={m.playtime} /></div>
                        <div>
                            { (m.winner) ? "Winner" : (m.draw) ? "Draw" : "Lost"}
                        </div>
                    </div>
                </a>
            </Link>
        );
    }

    return (
        <div>
        <div className="default-header">
            Recent Matches
        </div>
            {elems}      
        </div>
    );
}


export default PlayerRecentMatches;