import React from 'react';


class AdminPickupsManager extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            "items": this.props.data,
            "previousSavedItems": this.props.data,
            "saveInProgress": false,
            "savePassed": null,
            "errors": []
        };

        this.changeType = this.changeType.bind(this);
        this.changeName = this.changeName.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
    }

    saveChanges(){

        this.setState({"saveInProgress": true, "savePassed": null, "errors": []});


        const errors = [];

        setTimeout(() =>{
            
            this.setState({"previousSavedItems": this.state.items, "saveInProgress": false, "savePassed": false, "errors": errors});
        }, 750);

    }

    changeName(e){

        const reg = /^.+_(.+?)$/i;

        const result = reg.exec(e.target.id);

        if(result !== null){

            const id = parseInt(result[1]);
            const value = e.target.value;

            console.log(`set item ${id} to ${value}`);

            this.updateItemList(id, value, true);
        }

    }

    changeType(e){

        const reg = /^.+_(.+?)$/i;

        const result = reg.exec(e.target.id);

        console.log(result);

        if(result !== null){

            const id = parseInt(result[1]);
            const value = parseInt(e.target.value);
            this.updateItemList(id, value, false);
        }
    }

    updateItemList(id, value, bName){

        const newItems = [];

        let i = 0;

        for(let x = 0; x < this.state.items.length; x++){

            i = this.state.items[x];

            if(i.id === id){


                newItems.push({
                    "id": i.id,
                    "name": i.name,
                    "display_name": (bName) ? value : i.display_name,
                    "first": i.first,
                    "last": i.last,
                    "uses": i.uses,
                    "matches": i.matches,
                    "type": (!bName) ? value : i.type

                });

            }else{

                newItems.push(i);
            }

        }

        this.setState({"items": newItems});
        this.props.updateParentList(newItems);
    }

    getTypeDisplayName(id){

        id = parseInt(id);

        switch(id){

            case 0: {   return "Unsorted"; } break;
            case 1: {   return "Weapons"; } break;
            case 2: {   return "Ammo"; } break;
            case 3: {   return "Health"; } break;
            case 4: {   return "Powerups"; } break;
            case 5: {   return "Special"; } break;
            default: {  return "Unknown"; } break;
        }
    }

    createDropDown(name, defaultValue){

        return <select className="default-select" id={name} defaultValue={defaultValue} onChange={this.changeType}>
            <option value="-1">Select a type</option>
            <option value="0">Unsorted</option>
            <option value="1">Weapons</option>
            <option value="2">Ammo</option>
            <option value="3">Health</option>
            <option value="4">Powerups</option>
            <option value="5">Special</option>
        </select>
    }

    renderTable(){

        const rows = [];

        let i = 0;

        for(let x = 0; x < this.state.items.length; x++){

            i = this.state.items[x];
 
            rows.push(<tr key={x}>
                <td>{i.name}</td>
                <td><input type="text" className="default-textbox" onChange={this.changeName} value={i.display_name} id={`name_${i.id}`}/></td>
                <td>{i.matches}</td>
                <td>{i.uses}</td>
                <td>{this.createDropDown(`type_${i.id}`, i.type)}</td>

            </tr>);
        }

        return <div>
            <table className="t-width-1 m-bottom-25">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Display Name</th>
                        <th>Matches</th>
                        <th>Uses</th>
                        <th>Change Type</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    bAnyChanges(){

        const oldData = this.state.previousSavedItems;
        const newData = this.state.items;

        for(let i = 0; i < newData.length; i++){

            if(newData[i].display_name !== oldData[i].display_name) return true;
            if(newData[i].type !== oldData[i].type) return true;
        }

        return false;
    }

    renderUnsavedChanges(){

        if(!this.bAnyChanges()){

            if(this.state.savePassed){

                return <div className="team-green m-bottom-25 p-bottom-25 t-width-1 center">
                    <div className="default-header">Passed</div>
                    Update was successful.
                </div>
            }

            if(this.state.savePassed !== null){

                const errorElems = [];

                for(let i = 0; i < this.state.errors.length; i++){

                    errorElems.push(<div key={i}>{this.state.errors[i]}</div>);
                }

                return <div className="team-red m-bottom-25 p-bottom-25 t-width-1 center">
                    <div className="default-header">Error</div>
                        {errorElems}
                </div>
            }

            return null;
        }

        if(this.state.saveInProgress){

            return <div className="team-yellow m-bottom-25 p-bottom-25 t-width-1 center">
                <div className="default-header">Processing</div>
                Save in progress, please wait....
            </div>

        }

        return <div className="team-red m-bottom-25 p-bottom-25 t-width-1 center">
            <div className="default-header">Warning</div>
            You have unsaved changes please save them to make them take effect.
            <div className="search-button m-top-25" onClick={this.saveChanges}>Save Changes</div>
        </div>
    }


    render(){

        return <div>
            <div className="default-header">Manage Pickups</div>
            {this.renderUnsavedChanges()}
            {this.renderTable()}
            {this.renderUnsavedChanges()}
        </div>
    }
}


export default AdminPickupsManager;