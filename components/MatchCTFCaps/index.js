import TipHeader from '../TipHeader/';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import MMSS from '../MMSS/';

const createPlayerMap = (players) =>{

    const data = new Map();

    let p = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        data.set(p.player_id, {"name": p.name, "country": p.country});
    }

    return data;
}

const MatchCTFCaps = ({players, caps, matchStart}) =>{

    players = JSON.parse(players);
    caps = JSON.parse(caps);
    matchStart = parseFloat(matchStart);

    const elems = [];
    console.log(caps);


    const playerNames = createPlayerMap(players);
    console.log(playerNames);

    let c = 0;

    let grab = '';
    let covers = [];
    let assists = [];
    let cap = '';
    let currentName = '';
    let coverElems = [];
    let assistElems = [];

    let bgColor = '';



    for(let i = 0; i < caps.length; i++){

        c = caps[i];
        coverElems = [];
        assistElems = [];
        covers = [];
        assists = [];

        c.covers = c.covers.split(',');
        c.assists = c.assists.split(',');

        switch(c.team){
            case 0: {  bgColor = "team-red"; } break;
            case 1: {  bgColor = "team-blue"; } break;
            case 2: {  bgColor = "team-green"; } break;
            case 3: {  bgColor = "team-yellow"; } break;
            default: { bgColor = "team-none";} break;
        }
        

        console.log(c.covers);

        grab = playerNames.get(c.grab);

        if(grab === undefined){
            grab = {"name": "Not found", "country": "xx"};
        }

        cap = playerNames.get(c.cap);

        if(cap === undefined){
            cap = {"name": "Not found", "country": "xx"};
        }

        for(let x = 0; x < c.covers.length; x++){

            currentName = playerNames.get(parseInt(c.covers[x]));

            if(currentName !== undefined){

                coverElems.push(
                    <span>
                        <CountryFlag country={currentName.country}/>
                        <Link href={`/player/${c.covers[x]}`} ><a>{currentName.name}</a></Link>
                        {(x < c.covers.length - 1) ? ',' : ''}
                    </span>
                );
            }else{
                if(c.covers[x] !== ''){
                    coverElems.push(
                        <span>
                            <CountryFlag country="xx"/>
                            Not Found
                            {(x < c.covers.length - 1) ? ',' : ''}
                        </span>
                    );
                }
            }
        }

        for(let x = 0; x < c.assists.length; x++){

            currentName = playerNames.get(parseInt(c.assists[x]));

            if(currentName !== undefined){
                assistElems.push(
                    <span>
                        <CountryFlag country={currentName.country}/>
                        <Link href={`/player/${c.assists[x]}`} ><a>{currentName.name}</a></Link>
                        {(x < c.assists.length - 1) ? ',' : ''}
                    </span>
                );
            }else{
                if(c.assists[x] !== ''){
                    assistElems.push(
                        <span>
                            <CountryFlag country="xx"/>
                            Not Found
                            {(x < c.assists.length - 1) ? ',' : ''}
                        </span>
                    );
                }
            }
        }

        elems.push(<tr className={bgColor}>
            <td className="text-left"><CountryFlag country={grab.country}/><Link href={`/player/${c.grab}`} ><a>{grab.name}</a></Link></td>
            <td><MMSS timestamp={c.grab_time - matchStart}/> </td>
            <td>{coverElems}</td>
            <td>{assistElems}</td>
            <td className="text-left"><CountryFlag country={cap.country} /><Link href={`/player/${c.cap}`} ><a>{cap.name}</a></Link></td>
            <td><MMSS timestamp={c.cap_time - matchStart}/></td>
            <td>{c.travel_time} Seconds</td>
        </tr>);
    }

    return (<div className="special-table m-bottom-25">
        <div className="default-header">
            Flag Captures
        </div>
        <table>
            <tbody>
                <tr>
                    <TipHeader title="Grab" content=""/>
                    <TipHeader title="Grab Time" content=""/>
                    <TipHeader title="Covers" content=""/>
                    <TipHeader title="Assists" content=""/>
                    <TipHeader title="Capture" content=""/>
                    <TipHeader title="Capture Time" content=""/>
                    <TipHeader title="Travel Time" content=""/>
                </tr>
                {elems}
            </tbody>
        </table>
    </div>);
}


export default MatchCTFCaps;