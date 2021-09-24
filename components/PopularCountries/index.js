import Functions from '../../api/functions';
import styles from './PopularCountries.module.css';

const PopularCountries = ({data, totalPlayers, classic}) =>{

    data = JSON.parse(data);

    const elems = [];

    if(classic === undefined) classic = false;


    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let percent = 0;

        if(totalPlayers > 0){
            percent = (d.total_uses / totalPlayers) * 100;
        }


        elems.push(<div key={i} className={styles.country}>
            <div>{d.countryName}</div>
            <div><img src={`/images/flags/${d.country}.svg`} alt={d.country} /></div>
            <div><span className="yellow">{d.total_uses}</span> Players</div>
            <div className={styles.info}><span className="yellow">{percent.toFixed(2)}%</span> of all Players</div>
            <div className={styles.info}><span className="yellow">First Seen</span> {Functions.convertTimestamp(d.first_match, true)}</div>
            <div className={styles.info}><span className="yellow">Last Seen</span> {Functions.convertTimestamp(d.last_match, true)}</div>
        </div>);
    }

    return <div className="m-bottom-25">
        <div className="default-header">Most Popular Countries</div>
        <div className={styles.wrapper}>
            {elems}
        </div>
    </div>

}


export default PopularCountries;