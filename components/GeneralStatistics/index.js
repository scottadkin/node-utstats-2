import TimeStamp from '../TimeStamp/';
import styles from './GeneralStatistics.module.css';

const GeneralStatistics = ({totalMatches, firstMatch, lastMatch, totalPlayers}) =>{


    console.log(firstMatch);
    return (<div className={`special-table center ${styles.table}`}>
        <table >
            <tbody>
                <tr>
                    <td>Total Matches</td>
                    <td>{totalMatches}</td>
                </tr>
                <tr>
                    <td>First Match</td>
                    <td><TimeStamp timestamp={firstMatch} /></td>
                </tr>
                <tr>
                    <td>Last Match</td>
                    <td><TimeStamp timestamp={lastMatch} /></td>
                </tr>
                <tr>
                    <td>Total Players</td>
                    <td>{totalPlayers}</td>
                </tr>
            </tbody>
        </table>
    </div>)
}


export default GeneralStatistics;