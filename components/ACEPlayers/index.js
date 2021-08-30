import React from 'react';

class ACEPlayers extends React.Component{

    constructor(props){

        super(props);

        this.playerSearch = this.playerSearch.bind(this);
    }

    async playerSearch(e){

        try{

            e.preventDefault();

            const name = e.target[0].value;
            const ip = e.target[1].value;
            const hwid = e.target[2].value;
            const mac1 = e.target[3].value;
            const mac2 = e.target[4].value;
            

            console.log(name, ip, hwid, mac1, mac2);

        }catch(err){
            console.trace(err);
        }
    }

    render(){
        return <div>
        <div className="default-header">Players</div>
        <div className="default-sub-header">Search for a player</div>
        <div className="form">
            <form action="/" method="POST" onSubmit={this.playerSearch}>
                <div className="form-info">
                    Search for a player using one or multiple parameters.
                </div>
                <div className="select-row">
                    <div className="select-label">
                        Name
                    </div>
                    <div>
                        <input type="text" className="default-textbox" name="name"/>
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">
                        IP
                    </div>
                    <div>
                        <input type="text" className="default-textbox" name="ip"/>
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">
                        HWID
                    </div>
                    <div>
                        <input type="text" className="default-textbox" name="hwid"/>
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">
                        MAC1
                    </div>
                    <div>
                        <input type="text" className="default-textbox" name="mac1"/>
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">
                        MAC2
                    </div>
                    <div>
                        <input type="text" className="default-textbox" name="mac2"/>
                    </div>
                </div>

                <input type="submit" className="search-button" value="Search"/>
            </form>
        </div>
    </div>
    }
}


export default ACEPlayers;