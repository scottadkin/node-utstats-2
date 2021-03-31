import styles from './MapDefaultBox.module.css';
import Image from 'next/image';
import Functions from '../../api/functions';
import TimeStamp from '../TimeStamp/';
import Link from 'next/link';
import React from 'react';

class MapDefaultBox extends React.Component{

    constructor(props){
        super(props);
    }

    getImage(){
        

        const fixedName = Functions.removeMapGametypePrefix(Functions.removeUnr(this.props.data.name)).toLowerCase();
        const images = JSON.parse(this.props.images);

        const index = images.indexOf(fixedName);
        

        if(index !== -1){
            return `/images/maps/${images[index]}.jpg`;
        }

        return `/images/defaultmap.jpg`;
    }

    render(){

        return (<Link href={`/map/${this.props.data.id}`}><a><div className={styles.wrapper}>
            <div className={styles.title}>
                {Functions.removeUnr(this.props.data.name)}
                <div className={styles.author}>
                    {(this.props.data.author !== "") ? `By ${this.props.data.author}` : ""}           
                </div>
                <div className={styles.enter}>
                    {(this.props.data.ideal_player_count !== '') ? "Ideal Player Count " : ""}
                    {(this.props.data.ideal_player_count !== '') ? <span className="yellow">{this.props.data.ideal_player_count}</span> : ""}<br/>

                    <span className={styles.levelenter}>{(this.props.data.level_enter_text !== "") ? `"${this.props.data.level_enter_text}"` : ""}</span>
                </div>
            </div>
            <Image src={this.getImage()} width={384} height={216} alt="image"/>
            <div className={styles.info}>
                
                <span className="yellow">Matches</span> {this.props.data.matches}<br/>
                <span className="yellow">Playtime</span> {parseFloat(this.props.data.playtime / (60 * 60)).toFixed(2)} Hours<br/>
                <span className="yellow">First</span> <TimeStamp timestamp={this.props.data.first}/><br/>
                <span className="yellow">Last</span> <TimeStamp timestamp={this.props.data.last}/><br/>
            </div>
        </div></a></Link>);
    }
}

export default MapDefaultBox;