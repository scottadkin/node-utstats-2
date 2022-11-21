import styles from './MatchResultDisplay.module.css';
import React from 'react';
import Link from 'next/link';


class MatchResultDisplay extends React.Component{

    constructor(props){
        
        super(props);
    }


    getPlayerResultColor(){

        const string = this.props.playerResult.toLowerCase();

        if(string === "won the match"){
            return "green";
        }else if(string === "lost the match"){
            return "red";
        }

        return "yellow"

    }

    reduceNameLength(name){

        const maxLength = 45;

        if(name.length > maxLength){

            const shortName = name.slice(0,maxLength);

            return `${shortName}...`;
        }

        return name;
    }

    renderPlayerResult(){

        if(this.props.mode !== "player") return null;

        const resultColor = this.getPlayerResultColor();

        return <div>
            <div className={styles.presult} style={{"color": resultColor}}>
                {this.props.playerResult}
            </div>
            <div className={styles.mapi}>
                <img className="thumb-sshot" src={this.props.mapImage}  alt="image"/>
            </div>
            <div className={styles.sinfo}>
                {this.reduceNameLength(this.props.serverName)}<br/>
            </div>
            <div className={styles.mapn}>
                {this.props.mapName}
            </div>
            <div className={styles.minfo}>
                {this.props.gametypeName}<br/>
                {this.props.date}<br/>
                Playtime {this.props.playtime}<br/>
                {this.props.players} Players
            </div>
        </div>;

    }

    renderRecentResult(){

        if(this.props.mode !== "recent") return null;

        return <div>
            <div className={styles.mapt}>
                {this.props.mapName}
            </div>
            <div className={styles.mapi}>
                <img className="thumb-sshot" src={this.props.mapImage} alt="image"/>
            </div>
            <div className={styles.sinfo}>
                {this.reduceNameLength(this.props.serverName)}<br/>
            </div>
            <div className={styles.minfo}>
                {this.props.gametypeName}<br/>
                {this.props.date}<br/>
                Playtime {this.props.playtime}<br/>
                {this.props.players} Players
            </div>
        </div>;

    }

    render(){

        return <Link href={this.props.url}>
            <a>
                <div className={styles.wrapper}>
                    {this.renderPlayerResult()}
                    {this.renderRecentResult()}
                    {this.props.children}
                </div>
            </a>
        </Link>
    }
}


export default MatchResultDisplay;