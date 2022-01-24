import React from "react";


class AdminPlayerRename extends React.Component{

    constructor(props){

        super(props);
    }

    renderNameDropDown(){

        const options = [];

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            options.push(<option key={i} value={p.id}>{p.name}</option>);
        }
        return <select className="default-select">
            <option value="-1">Select a player</option>
            {options}
        </select>
    }


    render(){

        return <div>
            <div className="default-header">Rename Player</div>

            <div className="form">
                <div className="form-info m-bottom-25">Change a player's name to another one.<br/>You can't rename a player to a name that already exists
                you must merge the players instead.</div>

                <form action="/" method="POST" onSubmit={(() =>{
                    alert("For fuck sakes");
                })}>
                    <div className="select-row">
                        <div className="select-label">Current Name</div>
                        <div>
                            {this.renderNameDropDown()}
                        </div>
                    </div>

                    <div className="select-row">
                        <div className="select-label">New Name</div>
                        <div>
                            <input type="text" className="default-textbox" placeholder="new name"/>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    }
}

export default AdminPlayerRename;