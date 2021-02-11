import PlayerListBox from '../PlayerListBox/'
import styles from './PlayerList.module.css';
import CountryFlag from '../CountryFlag/';
import TimeStamp from '../TimeStamp/';
import Link from 'next/link';

function PlayersList({players, faces, records, displayType}){

    const elems = [];

    players = JSON.parse(players);

    faces = JSON.parse(faces);


    let currentFace = 0;

    displayType = parseInt(displayType);

    console.log(`displayType = ${displayType}`);

    let p = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        if(displayType === 1 && i === 0){
            elems.push(<tr>
                <th>Name</th>
                <th>First</th>
                <th>Last</th>
                <th>Score</th>
                <th>Kills</th>
                <th>Deaths</th>
                <th>Efficiency</th>
                <th>Accuracy</th>
                <th>Playtime (Horus)</th>
                <th>Matches</th>
            </tr>);
        }

        currentFace = faces[p.face];


        if(!currentFace.imageExists){
            currentFace = {"name": "faceless"};
        }

        if(displayType === 0){
            elems.push(<PlayerListBox key={i} 

                playerId={p.id} 
                name={p.name} 
                country={p.country}
                playtime={p.playtime}
                wins={p.wins}
                matches={p.matches}
                score={p.score}
                kills={p.kills}
                deaths={p.deaths}
                face={currentFace.name}
                first={p.first}
                last={p.last}
                records={records}
                accuracy={parseInt(p.accuracy)}
                displayType={displayType}
            />);

        }else{
            elems.push(<tr>
                <td><CountryFlag country={p.country}/> <Link href={`/player/${p.id}`}><a>{p.name}</a></Link></td>
                <td><TimeStamp timestamp={p.first} noTime="1" noDayName="1"/></td>
                <td><TimeStamp timestamp={p.last}  noTime="1" noDayName="1"/></td>
                <td>{p.score}</td>
                <td>{p.kills}</td>
                <td>{p.deaths}</td>
                <td>{p.efficiency.toFixed(2)}%</td>
                <td>{p.accuracy.toFixed(2)}%</td>
                <td>{(p.playtime / (60 * 60)).toFixed(2)}</td>
                <td>{p.matches}</td>
          
            </tr>);
        }
    }

    if(displayType === 0){
        return (
            <div className={styles.box}>
                {elems}
            </div>
        );
    }else{

        return (<div className={`special-table`}>
        <table >
            <tbody className={styles.table}>
                {elems}
            </tbody>
        </table>
        </div>);
    }

}



export default PlayersList;