import styles from './MatchResult.module.css';

const MatchResult = ({data}) =>{

    if(data === null) return <div className={`${styles.wrapper}`}>N/A</div>

    const colors = ["red", "blue", "green", "yellow"];
    const classes = ["solo", "duo", "trio", "quad"];

    const elems = [];

    console.log(data);

    for(let i = 0; i < data.length; i++){

        elems.push(<div className={`team-${colors[i]}`} key={i}>{data[i]}</div>);
    }
  

    return <div className={`${styles.wrapper} ${classes[elems.length - 1]}`}>{elems}</div>
}

export default MatchResult;