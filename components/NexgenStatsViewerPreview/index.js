import React from "react";


class NexgenStatsViewerPreview extends React.Component{

    constructor(props){

        super(props);
    }

    async componentDidMount(){

        await this.loadData();
    }

    async loadData(){

        const req = await fetch("/api/nexgenstatsviewer");

        const response = await req.text();

        this.parseText(response);
    }


    parseText(data){

        const titleReg = /^beginlist "(.+?)"$/im;
        const lineReg = /^addplayer "(.+?)" (.+?) (.+?) (.+?)$/im;

        const lines = data.match(/(.+)/img);

        if(lines === null) return;

        const lists = [];

        for(let i = 0; i < lines.length; i++){

            const c = lines[i];

            const titleResult = titleReg.exec(c);

            if(titleResult !== null){
                lists.push({"title": titleResult[1],"data": []});
                continue;
            }

            const lineResult = lineReg.exec(c);

            if(lineResult !== null){

                const player = {
                    "name": lineResult[1],
                    "value": lineResult[2],
                    "flag": lineResult[3],
                    "icon": lineResult[4]
                };

                lists[lists.length - 1].data.push(player);
            }
        }

        console.log(lists);
        
    }

    render(){

        return <div>
            <div className="default-header">NexgenStatsViewer Preview</div>
        </div>
    }
}

export default NexgenStatsViewerPreview;