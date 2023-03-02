import styles from './MapDefaultBox.module.css';
import Functions from '../../api/functions';
import Link from 'next/link';
import React from 'react';
import Playtime from '../Playtime';

class MapDefaultBox extends React.Component{

    constructor(props){
        super(props);
    }

    getImage(){
        

        const fixedName = Functions.cleanMapName(this.props.data.name).toLowerCase();
        const images = JSON.parse(this.props.images);

       // const index = images.indexOf(fixedName);

        if(images[fixedName] !== undefined){
            return `${this.props.host}/images/maps/thumbs/${images[fixedName]}.jpg`;
        }

        return `${this.props.host}/images/maps/thumbs/default.jpg`;
    }

    render(){

        return (<Link href={`/map/${this.props.data.id}`}><a><div className={styles.wrapper}>
            <div className={styles.title}>
                {Functions.removeUnr(this.props.data.name)}
            </div>
            <img className="thumb-sshot" src={this.getImage()} alt="image"/>
            <div className={styles.info}>
                
                {this.props.data.matches} {(this.props.data.matches === 1) ? "Match" : "Matches"}<br/>
                Playtime <Playtime timestamp={this.props.data.playtime}/><br/>
                First {Functions.convertTimestamp(this.props.data.first, true)}<br/>
                Last {Functions.convertTimestamp(this.props.data.last, true)}<br/>
            </div>
        </div></a></Link>);
    }
}

export default MapDefaultBox;