import styles from './MapDefaultBox.module.css';
import Image from 'next/image';
import Functions from '../../api/functions';
import TimeStamp from '../TimeStamp/';

class MapDefaultBox extends React.Component{

    constructor(props){
        super(props);
    }

    render(){
        return (<div className={styles.wrapper}>
            <div className={styles.title}>
                {Functions.removeUnr(this.props.data.name)}
                <div className={styles.author}>
                    {(this.props.data.author !== "") ? `By ${this.props.data.author}` : ""}           
                </div>
                <div className={styles.enter}>
                    Ideal Player Count {this.props.data.ideal_player_count}<br/>
                    {this.props.data.level_enter_text}
                </div>
            </div>
            <Image src={'/images/temp.jpg'} width={480} height={270} alt="image"/>
            <div className={styles.info}>
                
                Matches {this.props.data.matches}<br/>
                Playtime {parseFloat(this.props.data.playtime / (60 * 60)).toFixed(2)} Hours<br/>
                First <TimeStamp timestamp={this.props.data.first}/><br/>
                Last <TimeStamp timestamp={this.props.data.last}/><br/>
            </div>
        </div>);
    }
}

export default MapDefaultBox;