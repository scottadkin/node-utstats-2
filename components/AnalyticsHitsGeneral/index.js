
const Box = ({hits, unique, returning}) =>{

    return <div>
        <table className="t-width-2 td-1-left">
            <tbody>
                <tr>
                    <td>Site Hits</td>
                    <td>{hits}</td>
                </tr>
                <tr>
                    <td>Unique Visitors</td>
                    <td>{unique}</td>
                </tr>
                <tr>
                    <td>Returning Visitors</td>
                    <td>{returning}</td>
                </tr>
            </tbody>
        </table>
    </div>
}

const AnalyticsHitsGeneral = ({data, visitors}) =>{

    return <div>
        <div className="default-header">General Statistics</div>

        <div className="default-sub-header">Hits Past 24 Hours</div>

        <Box hits={data.day} unique={visitors.day.unique} returning={visitors.day.returning}/>

        <div className="default-sub-header">Hits Past 7 Days</div>

        <Box hits={data.week}unique={visitors.week.unique} returning={visitors.week.returning}/>

        <div className="default-sub-header">Hits Past 28 Days</div>

        <Box hits={data.month} unique={visitors.month.unique} returning={visitors.month.returning}/>

        <div className="default-sub-header">Hits Past 365 Days</div>

        <Box hits={data.year} unique={visitors.year.unique} returning={visitors.year.returning}/>

        <div className="default-sub-header">All Time Hits</div>

        <Box hits={data.allTime} unique={visitors.allTime.unique} returning={visitors.allTime.returning}/>

    </div>
}

export default AnalyticsHitsGeneral;