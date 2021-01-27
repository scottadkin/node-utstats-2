class MatchScreenshot{

    constructor(canvas, image, map, players, teams){

        console.log(`new match screenshot`);
        
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");

        this.map = map;
        this.players = JSON.parse(players);
        this.teams = parseInt(teams);

        this.image = new Image();
        this.image.src = image;

        this.colors = {
            "red": "rgb(226,0,0)",
            "blue": "rgb(62,144,194)",
            "green": "rgb(0,181,0)",
            "yellow": "rgb(255,255,0)"
        };

        //this.scaleImage();

       // this.image.onload = () =>{
         //   console.log(`image loaded`);
            this.render();
        //}   

    }

    x(input){
        return (this.canvas.width * 0.01) * input;
    }

    y(input){
        return (this.canvas.height * 0.01) * input
    }

    getTeamColor(team){

        switch(team){
            case 0: {   return this.colors.red; }
            case 1: {   return this.colors.blue; } 
            case 2: {   return this.colors.green; } 
            case 3: {   return this.colors.yellow; }
            default: {  return "white; "} 
        }
    }

    renderStandardTeamGamePlayer(c, offsetX, offsetY, team, name, score){

        const scoreOffset = this.x(30);

        console.log("test");

        c.fillStyle = this.getTeamColor(team);
        c.font = "40px Arial";
        c.fillText(name, this.x(offsetX), this.y(offsetY));
        c.fillText(score, this.x(offsetX) + scoreOffset, this.y(offsetY));
    }

    render(){

        const c = this.context;

        console.log("render");

        c.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);


        this.renderStandardTeamGamePlayer(c, 10,10, 0, "Player", 100);
        this.renderStandardTeamGamePlayer(c, 10,10, 1, "Player", 100);
        this.renderStandardTeamGamePlayer(c, 10,10, 2, "Player", 100);
        this.renderStandardTeamGamePlayer(c, 10,10, 3, "Player", 100);
       // c.drawImage(this.image, this.x(20), this.y(20), this.x(20), this.x(20));
    }
}

window.onload = () =>{

    const sshots = document.getElementsByClassName("match-screenshot");

    console.log(sshots);

    for(let i = 0; i < sshots.length; i++){

        console.log(sshots[i].dataset);

        new MatchScreenshot(sshots[i], sshots[i].dataset.image, sshots[i].dataset.map, sshots[i].dataset.players, sshots[i].dataset.teams);
    }
}

