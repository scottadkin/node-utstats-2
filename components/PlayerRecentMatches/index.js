import Link from 'next/link'

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
    console.log(`mappppppppppps`);
    console.log(maps);


    const elems = [];

    let m = 0;

    for(let i = 0; i < matches.length; i++){

        m = matches[i];

        elems.push(
            <Link key={m.id} href={`/match/${m.match_id}`}>
                <a>
                    <div>
                        <div>
                            {m.match_date}
                        </div>
                        <div>
                            {getMapName(maps, m.map_id)}
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