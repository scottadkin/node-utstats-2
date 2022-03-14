import React from 'react';
import styles from './MonsterHuntMonster.module.css';
import Image from 'next/image';
import Table2 from '../Table2';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';

class MonsterHuntMonster extends React.Component{

    constructor(props){

        super(props);

    }


    createRows(){

        const rows = [];

        const usedNames = [];

        const data = JSON.parse(JSON.stringify(this.props.data));

        data.sort((a, b) =>{

            a = a.kills;
            b = b.kills;

            if(a < b){
                return 1;
            }else if(a > b){
                return -1;
            }
            return 0;
        });

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            usedNames.push(d.playerName);

            let url = null;

            if(!this.props.bPlayerMatch){

                url = `/pmatch/${this.props.matchId}?player=${d.player}`;
            }else{
                url = `/player/${d.player}`;
            }

            rows.push(<tr key={i}>
                <td>
                    <Link href={url}>
                        <a>
                            <CountryFlag country={d.country}/>
                            {d.playerName}
                        </a>
                    </Link>
                </td>
                <td>{d.kills}</td>
            </tr>);
        }

        if(!this.props.bHide0Kills){
            
            for(const [key, value] of Object.entries(this.props.playerNames)){

                if(usedNames.indexOf(value.name) === -1){

                    let url = null;

                    if(!this.props.bPlayerMatch === undefined){

                        url = `/pmatch/${this.props.matchId}?player=${key}`;
                    }else{
                        url = `/player/${key}`;
                    }

                    rows.push(<tr key={value.name}>
                        <td>
                            <Link href={url}>
                                <a>
                                    <CountryFlag country={value.country}/>
                                    {value.name}
                                </a>
                            </Link>
                        </td>
                        <td></td>
                    </tr>);
                }
            }
        }

        if(rows.length === 0){

            rows.push(<tr key="1"><td colSpan="2" style={{"textAlign": "center"}}>No Kills</td></tr>);
        }

        return rows;

    }



    render(){

        const rows = this.createRows();

        return <div className={styles.wrapper}>
            <div className={styles.name}>{this.props.name}</div>
            <div className={styles.image}>
                <Image src={`/images/monsters/${this.props.image}`} width={200} height={200}/>    
            </div>
            <Table2 width={0} noBottomMargin={1} compressed={1} players={1}>
                <tr>
                    <th>Player</th>
                    <th>Kills</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }
}

export default MonsterHuntMonster;