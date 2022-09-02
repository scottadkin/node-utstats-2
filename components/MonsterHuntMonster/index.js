import React from 'react';
import styles from './MonsterHuntMonster.module.css';
import Image from 'next/image';
import Table2 from '../Table2';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';
import Functions from '../../api/functions';

class MonsterHuntMonster extends React.Component{

    constructor(props){

        super(props);
        this.state = {"page": 0, "totalPages": 0, "perPage": 5, "totalData": 0};

        this.previousPage = this.previousPage.bind(this);
        this.nextPage = this.nextPage.bind(this);

    }


    previousPage(){

        if(this.state.page - 1 < 0) return;

        this.setState({"page": this.state.page - 1});
    }

    nextPage(){

        if(this.state.page + 1 >= this.state.totalPages) return;

        this.setState({"page": this.state.page + 1});

    }

    componentDidMount(){

        const totalData = this.props.data.length;

        if(totalData <= this.state.perPage){
            this.setState({"totalPages": 1, "totalData": totalData});
            return;
        }

        const pages = Math.ceil(totalData / this.state.perPage);

        this.setState({"totalPages": pages, "totalData": totalData});
    }
    

    createRows(){

        const rows = [];

        const usedNames = [];

        const data = JSON.parse(JSON.stringify(this.props.data));

        data.sort((a, b) =>{


            if(a.kills < b.kills){
                return 1;
            }else if(a.kills > b.kills){
                return -1;
            }

            if(a.deaths > b.deaths){
                return 1;
            }else if(a.deaths < b.deaths){
                return -1;
            }

            
            return 0;
        });

        const start = this.state.page * this.state.perPage;
        const end = (start + this.state.perPage > this.state.totalData ) ? this.state.totalData : start + this.state.perPage ;

        for(let i = start; i < end; i++){

            const d = data[i];

            usedNames.push(d.playerName);

            let url = null;

            if(!this.props.bPlayerMatch){

                url = `/pmatch/${this.props.matchId}?player=${d.player}`;
            }else{
                url = `/player/${d.player}`;
            }

            let eff = 0;

            if(d.kills > 0){

                if(d.deaths > 0){

                    eff = ((d.kills / (d.kills + d.deaths)) * 100).toFixed(2);
                }else{

                    eff = 100;
                }
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
                <td>{Functions.ignore0(d.kills)}</td>
                <td>{Functions.ignore0(d.deaths)}</td>
                <td>{eff}%</td>
            </tr>);
        }


        if(rows.length === 0){

            rows.push(<tr key="1"><td colSpan="4" style={{"textAlign": "center"}}>No Kills</td></tr>);
        }

        return rows;

    }



    render(){

        const rows = this.createRows();

        return <div className={styles.wrapper}>
            <div className={styles.name}>{this.props.name}</div>
            <div className={styles.inner}>
                <div className={styles.left}>
                    <div className={styles.image}>
                        <Image src={`/images/monsters/${this.props.image}`} alt="Image" width={200} height={200}/>    
                    </div>
                </div>
                <div className={styles.right}>
                    <Table2 width={0} noBottomMargin={1} compressed={1} players={1}>
                        <tr>
                            <th>Player</th>
                            <th>Kills</th>
                            <th>Deaths</th>
                            <th>Efficiency</th>
                        </tr>
                        {rows}
                    </Table2>
                </div>
            </div>
            <div className={styles.pages}>
                <div className={styles.button} onClick={this.previousPage}>Previous Players</div>
                <div className={styles.button} onClick={this.nextPage}>Next Players</div>
            </div>
        </div>
    }
}

export default MonsterHuntMonster;