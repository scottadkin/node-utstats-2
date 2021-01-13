import TipHeader from '../TipHeader/';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import styles from './MatchSpecialEvents.module.css';


const bAllEmpty = (data, bSpree) =>{

    if(bSpree){

        for(let i = 0; i < 7; i++){

            if(data[`spree_${i+1}`] > 0){
                return false;
            }
        }

        if(data['spree_best'] > 0){
            return false;
        }
    }else{

        for(let i = 0; i < 7; i++){

            if(data[`multi${i+1}`] > 0){
                return false;
            }
        }

        if(data['multi_best'] > 1){
            return false;
        }
    }

    return true;
}

const MatchSpecialEvents = ({bTeamGame, players}) =>{

    players = JSON.parse(players);
    const spreeElems = [];
    const multiElems = [];

    let p = 0;

    let bgColor = '';

    for(let i = 0; i < players.length; i++){

        p = players[i];

        if(bTeamGame){
            switch(p.team){
                case 0: {  bgColor = "team-red"; } break;
                case 1: {  bgColor = "team-blue"; } break;
                case 2: {  bgColor = "team-green"; } break;
                case 3: {  bgColor = "team-yellow"; } break;
                default: { bgColor = "team-none";} break;
            }
        }else{
            bgColor = "team-none";
        }

        if(!bAllEmpty(p, true)){
            spreeElems.push(
                <tr className={bgColor}>
                    <td className="text-left"><CountryFlag country={p.country} /><Link href={`/player/${p.player_id}`}><a>{p.name}</a></Link></td>
                    <td>{(p.spree_1 > 0) ? p.spree_1 : ''}</td>
                    <td>{(p.spree_2 > 0) ? p.spree_2 : ''}</td>
                    <td>{(p.spree_3 > 0) ? p.spree_3 : ''}</td>
                    <td>{(p.spree_4 > 0) ? p.spree_4 : ''}</td>
                    <td>{(p.spree_5 > 0) ? p.spree_5 : ''}</td>
                    <td>{(p.spree_6 > 0) ? p.spree_6 : ''}</td>
                    <td>{(p.spree_7 > 0) ? p.spree_7 : ''}</td>
                    <td>{(p.spree_best > 0) ? p.spree_best : ''}</td>
                </tr>
            );
        }

        if(!bAllEmpty(p, false)){
            multiElems.push(
                <tr className={bgColor}>
                    <td className="text-left"><CountryFlag country={p.country} /><Link href={`/player/${p.player_id}`}><a>{p.name}</a></Link></td>
                    <td>{(p.multi_1 > 0) ? p.multi_1 : ''}</td>
                    <td>{(p.multi_2 > 0) ? p.multi_2 : ''}</td>
                    <td>{(p.multi_3 > 0) ? p.multi_3 : ''}</td>
                    <td>{(p.multi_4 > 0) ? p.multi_4 : ''}</td>
                    <td>{(p.multi_5 > 0) ? p.multi_5 : ''}</td>
                    <td>{(p.multi_6 > 0) ? p.multi_6 : ''}</td>
                    <td>{(p.multi_7 > 0) ? p.multi_7 : ''}</td>
                    <td>{(p.multi_best > 1) ? p.multi_best : ''}</td>
                </tr>
            );
        }
    }

    return (
        <div>
        <div className={`special-table center ${styles.table}`}>      
            <div className="default-header">
                Killing Sprees
            </div>
            <table >
                <tbody>
                    <tr>
                        <th>Player</th>
                        <TipHeader title={'Killing Spree'} content={'Player Killed 5 to 9 players in one life.'}/>
                        <TipHeader title={'Rampage'} content={'Player Killed 10 to 14 players in one life.'}/>
                        <TipHeader title={'Dominating'} content={'Player Killed 15 to 19 players in one life.'}/>
                        <TipHeader title={'Unstoppable'} content={'Player Killed 20 to 24 players in one life.'}/>
                        <TipHeader title={'Godlike'} content={'Player Killed 25 to 29 players in one life.'}/>
                        <TipHeader title={'Massacre'} content={'Player Killed 30 to 34 players in one life.'}/>
                        <TipHeader title={'Brutalizing'} content={'Player Killed 35 players or more in one life.'}/>
                        <TipHeader title={'Best Spree'} content={'The most players the player killed in one life.'}/>
                    </tr>
                    {spreeElems}
                </tbody>
            </table>
        </div>

        <div className={`special-table center ${styles.table}`}>
            <div className="default-header">
                Multi Kills
            </div>
            <table>
                <tbody>
                    <tr>
                        <th>Player</th>
                        <TipHeader title={'Double Kill'} content={'Player Killed 2 players in a short space of time without dying.'}/>
                        <TipHeader title={'Multi Kill'} content={'Player Killed 3 players in a short space of time without dying.'}/>
                        <TipHeader title={'Mega Kill'} content={'Player Killed 4 players in a short space of time without dying.'}/>
                        <TipHeader title={'Ultra Kill'} content={'Player Killed 5 players in a short space of time without dying.'}/>
                        <TipHeader title={'Monster Kill'} content={'Player Killed 6 players in a short space of time without dying.'}/>
                        <TipHeader title={'Ludicirous Kill'} content={'Player Killed 7 players in a short space of time without dying.'}/>
                        <TipHeader title={'Holy Shit'} content={'Player Killed 8 players in a short space of time without dying.'}/>
                        <TipHeader title={'Best Multi'} content={'The most players the player killed in a short space of time without dying.'}/>
                    </tr>
                    {multiElems}
                </tbody>
            </table>
        </div>
        </div>
    );
}


export default MatchSpecialEvents;