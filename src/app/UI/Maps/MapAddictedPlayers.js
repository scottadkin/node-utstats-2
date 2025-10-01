import Link from 'next/link';
import CountryFlag from '../CountryFlag';
import { toPlaytime, convertTimestamp, getPlayer } from '../../../../api/generic.mjs';
import { BasicTable } from '../Tables';

export default function MapAddictedPlayers({players}){

    const elems = players.map((p) =>{
        return [<Link href={`/player/${p.id}`}><CountryFlag country={p.country}/>{p.name}</Link>,
            convertTimestamp(p.first, false, false),
            convertTimestamp(p.last, false, false),
            p.matches,
            toPlaytime(p.playtime)    
        ]
    });

    if(elems.length === 0) return null;

    const headers = ["Name", "First Match", "Last Match", "Matches Played", "Playtime"];
    const styles = ["text-left", "playtime", "playtime", null, "playtime"];

    return <div>
        <div className="default-header">
            Addicted Players
        </div>
        <div className="m-bottom-10 center">  
            <BasicTable width={1} rows={elems} headers={headers} columnStyles={styles}/>
        </div>
    </div>
}

