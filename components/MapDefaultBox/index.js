import styles from './MapDefaultBox.module.css';
import Functions from '../../api/functions';
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

class MapDefaultBox extends React.Component{

    constructor(props){
        super(props);
    }

    getImage(){
        

        const fixedName = Functions.removeMapGametypePrefix(Functions.removeUnr(this.props.data.name)).toLowerCase();
        const images = JSON.parse(this.props.images);

        const index = images.indexOf(fixedName);
        

        if(index !== -1){
            return `/images/maps/thumbs/${images[index]}.jpg`;
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
                    {(this.props.data.ideal_player_count !== '') ? this.props.data.ideal_player_count : ""}<br/>

                    <span className={styles.levelenter}>{(this.props.data.level_enter_text !== "") ? `"${this.props.data.level_enter_text}"` : ""}</span>
                </div>
            </div>
            <Image src={this.getImage()} width={350} height={196} className="map-image" alt="image"/>
            <div className={styles.info}>
                
                {this.props.data.matches} Matches<br/>
                Playtime {Functions.toHours(this.props.data.playtime)} Hours<br/>
                First {Functions.convertTimestamp(this.props.data.first, true)}<br/>
                Last {Functions.convertTimestamp(this.props.data.last, true)}<br/>
            </div>
        </div></a></Link>);
    }
}

export default MapDefaultBox;