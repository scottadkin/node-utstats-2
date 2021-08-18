const PlayerPingSummary = ({average, max}) =>{

    return <div className="m-bottom-25">
        <div className="default-header">Ping Summary</div>
        <table className="t-width-2">
            <tbody>
                <tr>
                    <th>Data Type</th>
                    <th>Min</th>
                    <th>Average</th>
                    <th>Max</th>
                </tr>
                <tr>
                    <td>Averages</td>
                    <td>{Math.round(average.min)}</td>
                    <td>{Math.round(average.average)}</td>
                    <td>{Math.round(average.max)}</td>
                </tr>
                <tr>
                    <td>Extremes</td>
                    <td>{max.min}</td>
                    <td>{max.average}</td>
                    <td>{max.max}</td>
                </tr>
            </tbody>
        </table>
    </div>
}

export default PlayerPingSummary;