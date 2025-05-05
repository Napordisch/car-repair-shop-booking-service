export class TimeOfDay {
    hours;
    minutes;
    seconds;

    constructor(hours, minutes, seconds = 0) {
        this.hours = parseInt(hours);
        this.minutes = parseInt(minutes);
        this.seconds = parseInt(seconds);
    }

    toStringWithoutSeconds() {
        let hoursString = this.hours.toString()
        if (hoursString.length < 2) {
            hoursString = "0" + hoursString;
        }

        let minutesString = this.minutes.toString()
        if (minutesString.length < 2) {
            minutesString = "0" + minutesString;
        }
        return hoursString + ":" + minutesString;
    }

    toString() {
        let secondsString = this.seconds.toString()
        if (secondsString.length < 2) {
            secondsString = "0" + secondsString;
        }

        return this.toStringWithoutSeconds() + ":" + secondsString;
    }

    static fromString(timeString) {
        const hoursMinutesSeconds = timeString.split(":"); //expected format : "hh:mm:ss" or "hh:mm"
        const hours = hoursMinutesSeconds[0];
        const minutes = hoursMinutesSeconds[1];
        const seconds = hoursMinutesSeconds[2];
        return new TimeOfDay(hours, minutes, seconds);
    }
    static fromJSON(timeOfTheDayJSON) {
        let timeOfTheDayInstance;
        if (typeof timeOfTheDayJSON === "string") {
            timeOfTheDayInstance = JSON.parse(timeOfTheDayJSON);
        } else if (typeof timeOfTheDayJSON === "object") {
            timeOfTheDayInstance = timeOfTheDayJSON;
        }
        return new TimeOfDay(timeOfTheDayInstance.hours, timeOfTheDayInstance.minutes, timeOfTheDayInstance.seconds);
    }
}
