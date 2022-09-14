import React from "react";
import Image from "next/image";
import Table2 from "../Table2";
import CountryFlag from "../CountryFlag";

class CombogibMatchStats extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        return <div>
            <div className="default-header">Combogib Stats</div>

            <Table2 width={4} players={true}>
                <tr>
                    <th>&nbsp;</th>
                    <th>
                        <Image src="/images/combo.png" alt="image" width={64} height={64}/>
                        <br/>Combo Kills
                    </th>
                    <th>
                        <Image src="/images/shockball.png" alt="image" width={64} height={64}/>
                        <br/>Shock Ball Kills
                    </th>
                    <th>
                        <Image src="/images/primary.png" alt="image" width={64} height={64}/>
                        <br/>Instagib Kills
                    </th>
                    <th>
                        <Image src="/images/combo.png" alt="image" width={64} height={64}/>
                        <br/>Best Single Combo
                    </th>
                </tr>
                <tr>
                    <td className="team-red"><CountryFlag country="gb"/>Ooper</td>
                    <td>32</td>
                    <td>12</td>
                    <td>105</td>
                    <td>3 Kills</td>
                </tr>
                <tr>
                    <td className="team-blue"><CountryFlag country="us"/>AS~Chinpo</td>
                    <td>5</td>
                    <td>789</td>
                    <td>5</td>
                    <td>1 Kill</td>
                </tr>
            </Table2>
        </div>
    }
}

export default CombogibMatchStats;