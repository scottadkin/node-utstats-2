import React from 'react';

class AdminPlayerSearch extends React.Component{

    constructor(props){

        super(props);

        this.search = this.search.bind(this);
    }

    async search(e){

        try{

            e.preventDefault();

            let name = e.target[0].value;

            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "namesearch", "name": name})
            });

            

        }catch(err){
            console.trace(err);
        }
    }

    render(){

        return <div>
            <div className="default-header">Player Search</div>

            <div className="form">
                <form action="/" method="POST" onSubmit={this.search}>
                    <div className="form-info m-bottom-25">
                        Search for a player by name or IP.
                    </div>
                    <div className="select-row">
                        <div className="select-label">Name</div>
                        <div>
                            <input type="textbox" className="default-textbox" placeholder="Name..."/>
                        </div>
                    </div>
                    <div className="select-row">
                        <div className="select-label">IP</div>
                        <div>
                            <input type="textbox" className="default-textbox" placeholder="IP..."/>
                        </div>
                    </div>
                    <input type="submit" className="search-button" value="Search"/>
                </form>
            </div>
        </div>
    }
}

export default AdminPlayerSearch;