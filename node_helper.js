const NodeHelper = require('node_helper');
const request = require('request');

module.exports = NodeHelper.create({

    start: function()
    {
        console.log("Starting node_helper for: " + this.name);
    },

    lastResults: [],

    getData: function(forcedUpdate = false)
    {
        request({
            url: `https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/events.min.json`,
            method: 'GET' 
        },
        (error, response, body) =>
        {
            if (!error && response.statusCode == 200)
            {
                ["current","upcoming"].forEach(category => {

                    var events = JSON.parse(body);

                    var result = { category: category, array: [] }

                    events.forEach (e =>
                    {
                        var now = new Date();
                        e.start = Date.parse(e.start);
                        e.end = Date.parse(e.end);

                        if (category == "current")
                        {
                            if ((!e.start || e.start <= now) && e.end > now)
                            {
                                result.array.push(e);
                            }
                        }
                        else //upcoming
                        {
                            if (e.start > now)
                            {
                                result.array.push(e);
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
        });
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