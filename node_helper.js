const NodeHelper = require('node_helper');
const jsd = require('jsdom');
const moment = require('moment');
const { Console } = require('console');
const { JSDOM } = jsd;

module.exports = NodeHelper.create({

    start: function()
    {
        console.log("Starting node_helper for: " + this.name);
    },

    lastResults: [],

    getData: function(forcedUpdate = false)
    {
        JSDOM.fromURL("https://www.leekduck.com/events/")
        .then(
            (dom) => {
                ["current","upcoming"].forEach(category => {
                    
                    var events = dom.window.document.querySelectorAll(`div.events-list.${category}-events a.event-item-link`);

                    var result = { category: category, array: [] }
                    events.forEach (e =>
                    {
                        var heading = e.querySelector(":scope > .event-item-wrapper > p").innerHTML;
                        var name = e.querySelector(":scope > .event-item-wrapper > .event-item > .event-text-container > .event-text > h2").innerHTML;
                        var image = e.querySelector(":scope > .event-item-wrapper > .event-item > .event-img-wrapper > img").src;
                        var eventID = e.href.substring(32, e.href.length - 1)
                        
                        var eventItemWrapper = e.querySelector(":scope > .event-item-wrapper");
                        eventItemWrapper.classList
                        var eventType = (eventItemWrapper.classList + "").replace("event-item-wrapper ", "");
                        eventType = eventType.replace("é", "e");

                        var revealCountdownNode = e.querySelector(":scope > .event-item-wrapper > div:not(.event-item)");
                        var revealCountdown = "";
                        if (revealCountdownNode != null) revealCountdown = revealCountdownNode.dataset.revealCountdown; 
                        var reveal = new Date(0)
                        if (!/^\d+$/.test(revealCountdown))
                        {
                            reveal = Date.parse(moment(revealCountdown, 'MM/DD/YYYY HH:mm:ss').toISOString());
                        }
                        else
                        {
                            reveal.setUTCSeconds(parseInt(revealCountdown))
                        }
                        
                        var countdownNode = e.querySelector(":scope > .event-item-wrapper > .event-item > .event-text-container > .event-countdown-container > .event-countdown");
                        var timeRaw = timeRaw = countdownNode.dataset.countdown;
                        var countdownTo = countdownNode.dataset.countdownTo;
                        var isLocaleTime = ['start', 'end'].includes(countdownTo) ? !/^\d+$/.test(timeRaw) : null;
                        var time = isLocaleTime ? moment(timeRaw, 'MM/DD/YYYY HH:mm:ss').toISOString() : moment.unix(parseInt(timeRaw) / 1000).toISOString();
                        var startTime = countdownTo === 'start' ? time : null;
                        var endTime = countdownTo === 'end' ? time : null;

                        var start = Date.parse(startTime);
                        var end = Date.parse(endTime);

                        if (category == "current")
                        {
                            if ((startTime == null || start < Date.now()) && end > Date.now())
                            {
                                if (revealCountdown == null || reveal <= Date.now())
                                {
                                    result.array.push({ "heading": heading, "name": name, "eventType": eventType, "eventID": eventID, "image": image, "start": start, "end": end });
                                }
                            }
                        }
                        else if (category == "upcoming")
                        {
                            if (start > Date.now())
                            {
                                result.array.push({ "heading": heading, "name": name, "eventType": eventType, "eventID": eventID, "image": image, "start": start, "end": end });
                            }
                        }
                    });

                    this.lastResults[category] = result;
                    this.sendSocketNotification('PGO_DATA_RESULT', result);

                });

                if (!forcedUpdate)
                {
                    var date = new Date();
                    var timeTillQuarter = (15 - (date.getMinutes() % 15));

                    console.log("[" + this.name + "] Waiting " + timeTillQuarter + " minutes until next timed getData.")

                    setTimeout(() => 
                    {
                        console.log("[" + this.name + "] Timed getData now running.")
                        this.getData();
                    },
                    timeTillQuarter * 60 * 1000);
                }
            }
        )
    },

    initializedGetData: false,

    socketNotificationReceived: function(notification, payload)
    {
        if (notification === 'PGO_GET_DATA')
        {
            this.getData(payload);
        }
        else if (notification === 'PGO_INITIALIZE_GET_DATA')
        {
            if (!this.initializedGetData)
            {
                console.log("[" + this.name + "] getData initialized.")

                this.initializedGetData = true;
                this.getData();
            }
            else if (Object.keys(this.lastResults).length > 0)
            {
                console.log("[" + this.name + "] New modules loaded - sending existing data notifications.")

                this.sendSocketNotification('PGO_DATA_RESULT', this.lastResults["current"]);
                this.sendSocketNotification('PGO_DATA_RESULT', this.lastResults["upcoming"]);
            }
        }
    }
});