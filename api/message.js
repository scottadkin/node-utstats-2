class Message{

    constructor(message, type){

        this.message = message;
        this.type = '';

        if(type !== undefined){
            this.type = type.toLowerCase();
        }

        this.displayMessage();

    }


    displayMessage(){

        let bgColor = '';
        let fontColor = '';

        const now = new Date(); 

        let hour = now.getHours();
        let minute = now.getMinutes();
        let seconds = now.getSeconds();

        if(hour < 10){
            hour = `0${hour}`
        }

        if(minute < 10){
            minute = `0${minute}`;
        }

        if(seconds < 10){
            seconds = `0${seconds}`;
        }
        
        let timeString = `[${hour}:${minute}:${seconds}]`;

        let type = '';

        if(this.type == 'error'){
            type = 'Error';
            fontColor = '\u001b[31m';
        }else if(this.type == 'warning'){
            type = 'Warning';
            fontColor = '\u001b[33m';
        }else if(this.type == 'pass'){
            type = 'Pass';
            fontColor = '\u001b[32m';
        }else if(this.type == 'note'){
            type = 'Notice';
            fontColor = '\u001b[36m';
        }

        console.log(`${fontColor}${timeString}${type}: ${this.message}\u001b[0m`);
    }


}


module.exports = Message;