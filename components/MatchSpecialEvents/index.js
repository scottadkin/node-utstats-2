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

    players = players.reverse();
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
                <tr key={`spree_tr_${i}`} className={bgColor}>
                    <td className="text-left"><CountryFlag key={`spree_flag_${p.player_id}`} country={p.country} /><Link key={`spree_link_${p.player_id}`} href={`/player/${p.player_id}`}><a>{p.name}</a></Link></td>
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
                <tr key={`multi_tr_${i}`} className={bgColor}>
                    <td className="text-left"><CountryFlag  key={`multi_flag_${p.player_id}`} country={p.country} /><Link key={`multi_link_${p.player_id}`} href={`/player/${p.player_id}`}><a>{p.name}</a></Link></td>
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

    if(multiElems.length === 0){
        multiElems.push(<tr key="multis-none">
            <td colspan="9">There where no multi kills in the match</td>
        </tr>);
    }

    if(spreeElems.length === 0){
        spreeElems.push(<tr key="sprees-none">
            <td colspan="9">There where no sprees in the match</td>
        </tr>);
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
                        <TipHeader key={`t_spree_1`} title={'Killing Spree'} content={'Player Killed 5 to 9 players in one life.'}/>
                        <TipHeader key={`t_spree_2`} title={'Rampage'} content={'Player Killed 10 to 14 players in one life.'}/>
                        <TipHeader key={`t_spree_3`} title={'Dominating'} content={'Player Killed 15 to 19 players in one life.'}/>
                        <TipHeader key={`t_spree_4`} title={'Unstoppable'} content={'Player Killed 20 to 24 players in one life.'}/>
                        <TipHeader key={`t_spree_5`} title={'Godlike'} content={'Player Killed 25 to 29 players in one life.'}/>
                        <TipHeader key={`t_spree_6`} title={'Massacre'} content={'Player Killed 30 to 34 players in one life.'}/>
                        <TipHeader key={`t_spree_7`} title={'Brutalizing'} content={'Player Killed 35 players or more in one life.'}/>
                        <TipHeader key={`t_spree_8`} title={'Best Spree'} content={'The most players the player killed in one life.'}/>
                    </tr>
                    {spreeElems}
                </tbody>
            </table>
        </div>

        <div className={`special-table center ${styles.table} m-bottom-25`}>
            <div className="default-header">
                Multi Kills
            </div>
            <table>
                <tbody>
                    <tr>
                        <th>Player</th>
                        <TipHeader key={`t_multi_1`} title={'Double Kill'} content={'Player Killed 2 players in a short space of time without dying.'}/>
                        <TipHeader key={`t_multi_2`} title={'Multi Kill'} content={'Player Killed 3 players in a short space of time without dying.'}/>
                        <TipHeader key={`t_multi_3`} title={'Mega Kill'} content={'Player Killed 4 players in a short space of time without dying.'}/>
                        <TipHeader key={`t_multi_4`} title={'Ultra Kill'} content={'Player Killed 5 players in a short space of time without dying.'}/>
                        <TipHeader key={`t_multi_5`} title={'Monster Kill'} content={'Player Killed 6 players in a short space of time without dying.'}/>
                        <TipHeader key={`t_multi_6`} title={'Ludicirous Kill'} content={'Player Killed 7 players in a short space of time without dying.'}/>
                        <TipHeader key={`t_multi_7`} title={'Holy Shit'} content={'Player Killed 8 players in a short space of time without dying.'}/>
                        <TipHeader key={`t_multi_8`} title={'Best Multi'} content={'The most players the player killed in a short space of time without dying.'}/>
                    </tr>
                    {multiElems}
                </tbody>
            </table>
        </div>
        </div>
    );
}


export default MatchSpecialEvents;