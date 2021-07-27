const AnalyticsHitsGeneral = ({data}) =>{

    return <div>
        <div className="default-header">General Statistics</div>

        <div className="default-sub-header">Hits Past 24 Hours</div>

        {data.day}

        <div className="default-sub-header">Hits Past 7 Days</div>

        {data.week}

        <div className="default-sub-header">Hits Past 28 Days</div>

        {data.month}

        <div className="default-sub-header">Hits Past 365 Days</div>

        {data.year}

        <div className="default-sub-header">All Time Hits</div>

    </div>
}

export default AnalyticsHitsGeneral;