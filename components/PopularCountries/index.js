import Functions from '../../api/functions';
import styles from './PopularCountries.module.css';
import Image from 'next/image';

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
            <div className={styles.name}>{d.countryName}</div>
            <div><Image src={`/images/flags/${d.country.toLowerCase()}.svg`} alt={d.country} width={190} height={100}/></div>
            <div className={styles.info}>
                {d.total_uses} Players<br/>
                {percent.toFixed(2)}% of all Players<br/>
            </div>
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