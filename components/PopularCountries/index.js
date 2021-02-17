import Countries from '../../api/countries';
import CountriesManager from '../../api/countriesmanager';
import styles from './PopularCountries.module.css';

const PopularCountries = ({data}) =>{

    data = JSON.parse(data);

    const elems = [];


    for(let i = 0; i < data.length; i++){
        elems.push(<div className={styles.country}>
            <div><img src={`/images/flags/${data[i].code}.svg`} alt={data[i].country} /></div>
            <div>{data[i].name}</div>
            <div>{data[i].total} Players</div>
        </div>);
    }

    return (<div className={styles.wrapper}>
        {elems}
    </div>);

}


export default PopularCountries;