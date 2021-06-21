import React from 'react';


class PlayerMatchPickups extends React.Component{

    constructor(props){

        super(props);
    }


    getItemDetails(id){

        let n = 0;

        for(let i = 0; i < this.props.names.length; i++){

            n = this.props.names[i];

            if(n.id === id){
                return n;
            }
        }

        return {"name": "Not Found", "type": 0};
    }

    getTypeName(id){

        if(id === 1) return "Weapons";
        if(id === 2) return "Ammo";
        if(id === 3) return "Health";
        if(id === 4) return "Powerups";
        if(id === 5) return "Special";


        return "Unsorted";
    }

    createRows(){

        const rows = [];

        let data = this.props.data;

        data.sort((a, b) =>{

            a = a.uses;
            b = b.uses;

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }

            return 0;
        });


        let currentItem = 0;
        let d = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];

            currentItem = this.getItemDetails(d.item);

            rows.push(<tr key={i}>
                <td>{currentItem.name}</td>
                <td>{this.getTypeName(currentItem.type)}</td>
                <td>{d.uses}</td>
            </tr>);
        }

        return rows;
    }

    render(){

        const rows = this.createRows();


        if(rows.length === 0) return null;

        return <div className="m-bottom-25">
            <div className="default-header">Pickups Summary</div>
            <table className="t-width-2">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Uses</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }
}

export default PlayerMatchPickups;