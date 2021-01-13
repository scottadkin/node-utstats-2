import styles from './MatchWeapon.module.css';
import CleanDamage from '../CleanDamage/';
import TipHeader from '../TipHeader/';
import CountryFlag from '../CountryFlag/';


const getBGColor = (bTeamGame, team) =>{

    if(!bTeamGame) return 'team-none';

    let color = 'team-none';

    switch(team){
        case 0: { color = 'team-red'; } break;
        case 1: { color = 'team-blue'; } break;
        case 2: { color = 'team-green'; } break;
        case 3: { color = 'team-yellow'; } break;
    }

    return color;
}

const MatchWeapon = ({name, data, bTeamGame}) =>{

    data = JSON.parse(data);


    data.sort((a,b) =>{

        a = a.playerTeam;
        b = b.playerTeam;

        if(a < b){
            return -1;
        }else if(a > b){
            return 1;
        }

        return 0;
    });

    const elems = [];

    let currentEff = 0;

    for(let i = 0; i < data.length; i++){

        currentEff = 0;

        if(data[i].kills > 0 && data[i].deaths > 0){
            currentEff = data[i].kills / (data[i].deaths + data[i].kills);
        }else{

            if(data[i].kills > 0){
                currentEff = 1;
            }
        }

        currentEff *= 100;
        elems.push(
            <tr className={getBGColor(bTeamGame, data[i].playerTeam)}>
                <td><CountryFlag country={data[i].playerCountry} />{data[i].playerName}</td>
                <td><CleanDamage damage={data[i].damage} /></td>
                <td>{(data[i].deaths > 0) ? data[i].deaths : ''}</td>
                <td>{(data[i].kills > 0) ? data[i].kills : ''}</td>
                <td>{currentEff.toFixed(2)}%</td>
                <td>{(data[i].shots > 0) ? data[i].shots : ''}</td>
                <td>{(data[i].hits > 0) ? data[i].hits : ''}</td>
                <td>{(data[i].accuracy > 0) ? `${data[i].accuracy.toFixed(2)}%` : ''}</td>
            </tr>
        );
    }

    return (<div className={`special-table center ${styles.table}`}>
        <div className="default-header">
            {name}
        </div>
        <table className={styles.table}>
            <tbody>
                <tr>
                    <th>Player</th>
                    <TipHeader key={`${name}-0`} title="Damage" content="How much damage the player caused with the weapon. K = Thousand, M = Million, B = Billion, T = Trillion."/>
                    <TipHeader key={`${name}-1`} title="Deaths" content="How many times the played died to this weapon." />
                    <TipHeader key={`${name}-2`} title="Kills" content="How many times the played killed with this weapon." />
                    <TipHeader key={`${name}-3`} title="Efficiency" content="(Kills / (kills + deaths)) * 100"/>
                    <TipHeader key={`${name}-4`} title="Shots" content="How many times the player shot the weapon."/>
                    <TipHeader key={`${name}-5`} title="Hits" content="How many times the player hit a shot with the weapon."/>
                    <TipHeader key={`${name}-6`} title="Accuracy" content="(hits / shots) * 100"/>
                </tr>
                {elems}
            </tbody>
        </table>
    </div>);
}


export default MatchWeapon;