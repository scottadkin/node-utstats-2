import styles from './MatchResultDisplay.module.css';
import React from 'react';
import Image from 'next/image';
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

        return "yellow;"

    }

    renderPlayerResult(){

        if(this.props.mode !== "player") return null;

        const resultColor = this.getPlayerResultColor();

        return <div>
            <div className={styles.presult} style={{"color": resultColor}}>
                {this.props.playerResult}
            </div>
            <div className={styles.mapi}>
                <Image src={this.props.mapImage} width={400} height={225}/>
            </div>
            <div className={styles.sinfo}>
                {this.props.serverName}<br/>
            </div>
            <div className={styles.minfo}>
                {this.props.gametypeName}<br/>
                {this.props.date}<br/>
                Playtime {this.props.playtime}<br/>
                {this.props.players} Players
            </div>
        </div>
    }

    render(){

        return <Link href={this.props.url}>
            <a>
                <div className={styles.wrapper}>
                    {this.renderPlayerResult()}
                    {this.props.children}
                </div>
            </a>
        </Link>
    }
}


export default MatchResultDisplay;