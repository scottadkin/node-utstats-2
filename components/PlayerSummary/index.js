import styles from './PlayerSummary.module.css';

const PlayerSummary = ({summary}) =>{

    

    summary = JSON.parse(summary);

    console.log(summary);
    //const summary = p
    return (
        <div>

            <div className="special-table">
                <div className="default-header">
                    Multi Kills
                </div>
                <table>
                    <tbody>
                        <tr>
                            <th>Double Kill</th>
                            <th>Multi Kill</th>
                            <th>Mega Kill</th>
                            <th>Ultra Kill</th>
                            <th>Monster Kill</th>
                            <th>ludicrous Kill</th>
                            <th>Holy Shit</th>
                            <th>Best Multi</th>
                        </tr>
                        <tr>
                            <td>{summary.multi_1}</td>
                            <td>{summary.multi_2}</td>
                            <td>{summary.multi_3}</td>
                            <td>{summary.multi_4}</td>
                            <td>{summary.multi_5}</td>
                            <td>{summary.multi_6}</td>
                            <td>{summary.multi_7}</td>
                            <td>{summary.multi_best} kills</td>
           
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="special-table">
                <div className="default-header">
                    Killing Sprees
                </div>
                <table>
                    <tbody>
                        <tr>
                            <th>Killing Spree</th>
                            <th>Rampage</th>
                            <th>Dominating</th>
                            <th>Unstoppable</th>
                            <th>Godlike</th>
                            <th>Massacre</th>
                            <th>Brutalizing</th>
                            <th>Best Spree</th>
                        </tr>
                        <tr>
                            <td>{summary.spree_1}</td>
                            <td>{summary.spree_2}</td>
                            <td>{summary.spree_3}</td>
                            <td>{summary.spree_4}</td>
                            <td>{summary.spree_5}</td>
                            <td>{summary.spree_6}</td>
                            <td>{summary.spree_7}</td>
                    
                            <td>{summary.spree_best} kills</td>
           
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );

}

export default PlayerSummary;