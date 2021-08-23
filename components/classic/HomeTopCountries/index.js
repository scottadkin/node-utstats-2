const HomeTopCountries = ({data}) =>{

    if(data.length === 0) return null;

    return <div className="m-bottom-25">
        <div className="default-header">Most Popular Countries</div>
    </div>
}

export default HomeTopCountries;