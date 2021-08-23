import styles from './PopularCountries.module.css';

const PopularCountries = ({data, classic}) =>{

    data = JSON.parse(data);

    const elems = [];

    if(classic === undefined) classic = false;


    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let code = d.code;

        let uses = 0;

        if(classic){
            uses = d.total_uses;
        }else{
            uses = d.total;
        }


        elems.push(<div key={i} className={styles.country}>
            <div><img src={`/images/flags/${code}.svg`} alt={code} /></div>
            <div>{data[i].name}</div>
            <div>{uses} Uses</div>
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