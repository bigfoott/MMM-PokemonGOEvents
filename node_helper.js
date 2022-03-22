const NodeHelper = require('node_helper');
const jsd = require('jsdom');
const moment = require('moment');
const { JSDOM } = jsd;

module.exports = NodeHelper.create({

    start: function()
    {
        console.log("Starting node_helper for: " + this.name);
    },

    getData: function(payload)
    {
        JSDOM.fromURL("https://www.leekduck.com/events/")
        .then(
            (dom) => {
                var events = dom.window.document.querySelectorAll(`div.events-list.${payload.category}-events a.event-item-link`);

                var result = { index: payload.index, array: [] }
                events.forEach (e =>
                {
                    var heading = e.querySelector(":scope > .event-item-wrapper > p").innerHTML;
                    var name = e.querySelector(":scope > .event-item-wrapper > .event-item > .event-text-container > .event-text > h2").innerHTML;
                    var image = e.querySelector(":scope > .event-item-wrapper > .event-item > .event-img-wrapper > img").src;
                    var eventID = e.href.substring(32, e.href.length - 1)
                    
                    var eventItemWrapper = e.querySelector(":scope > .event-item-wrapper");
                    eventItemWrapper.classList
                    var eventType = (eventItemWrapper.classList + "").replace("event-item-wrapper ", "");

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

                    if (payload.category == "current")
                    {
                        if ((startTime == null || start < Date.now()) && end > Date.now())
                        {
                            if (revealCountdown == null || reveal <= Date.now())
                            {
                                result.array.push({ "heading": heading, "name": name, "eventType": eventType, "eventID": eventID, "image": image, "start": start, "end": end });
                            }
                        }
                    }
                    else if (payload.category == "upcoming")
                    {
                        if (start > Date.now())
                        {
                            result.array.push({ "heading": heading, "name": name, "eventType": eventType, "eventID": eventID, "image": image, "start": start, "end": end });
                        }
                    }
                });

                this.sendSocketNotification('PGO_DATA_RESULT', result);
            }
        )
    },

    socketNotificationReceived: function(notification, payload)
    {
        if (notification === 'PGO_GET_DATA')
        {
            this.getData(payload);
        }
    }
});