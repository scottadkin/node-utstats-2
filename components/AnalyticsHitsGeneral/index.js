import Table2 from "../Table2";

const Box = ({hits, unique, returning, header}) =>{

    return <div>
        <Table2 width={3} header={header}>
            <tr>
                <td className="yellow text-left">Site Hits</td>
                <td>{hits}</td>
            </tr>
            <tr>
                <td  className="yellow text-left">Unique Visitors</td>
                <td>{unique}</td>
            </tr>
            <tr>
                <td  className="yellow text-left">Returning Visitors</td>
                <td>{returning}</td>
            </tr>
        </Table2>
    </div>
}

const AnalyticsHitsGeneral = ({data, visitors}) =>{

    return <div>
        <div className="default-header">General Statistics</div>

        <Box header="Hits Past 24 Hours" hits={data.day} unique={visitors.day.unique} returning={visitors.day.returning}/>

        <Box header="Hits Past 7 Days" hits={data.week}unique={visitors.week.unique} returning={visitors.week.returning}/>

        <Box header="Hits Past 28 Days" hits={data.month} unique={visitors.month.unique} returning={visitors.month.returning}/>

        <Box header="Hits Past 365 Days" hits={data.year} unique={visitors.year.unique} returning={visitors.year.returning}/>

        <Box header="All Time Hits" hits={data.allTime} unique={visitors.allTime.unique} returning={visitors.allTime.returning}/>

    </div>
}

export default AnalyticsHitsGeneral;