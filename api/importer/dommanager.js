
class DOMManager{

    constructor(){

        this.data = [];

        this.domPoints = [];
    }

    parseData(){

        const domPointReg = /^\d+\.\d+\tnstats\tdom_point\t(.+?)\t(.+?),(.+?),(.+)$/i;
        const capReg = /^(\d+\.\d+)\tcontrolpoint_capture\t(.+?)\t(.+)$/;

        let d = 0;
        let result = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];
            console.log(d);


            if(domPointReg.test(d)){

                result = domPointReg.exec(d);

                this.createDomPoint(result[1],result[2],result[3],result[4]);
              

            }else if(capReg.test(d)){

                result = capReg.exec(d);

                this.pointCaptured(result[2], result[3]);
            }
        }

        console.log(this.domPoints);

    }


    createDomPoint(name, x, y, z){

        this.domPoints.push({
            "name": name,
            "position": {
                "x": parseFloat(x),
                "y": parseFloat(y),
                "z": parseFloat(z),
            },
            "captured": 0      
        });
    }


    getPoint(name){

        let d = 0;

        for(let i = 0; i < this.domPoints.length; i++){

            d = this.domPoints[i];

            if(d.name === name){
                return d;
            }

        }

        return null;
    }

    pointCaptured(name, playerId){

        playerId = parseInt(playerId);
        
        let point = this.getPoint(name);

        if(point === null){
            this.createDomPoint(name, 0, 0, 0);
            point = this.getPoint(name);
        }

        point.captured++;


    }
}


module.exports = DOMManager;