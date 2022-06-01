Module.register("MMM-PokemonGOEvents", {
    defaults: {
        category: "current",
        theme: "default",
        updateInterval: 5000, //5 seconds
        maxEvents: 5,
        truncateTitle: 0,
        exactTimestamp: false,
        eventWhitelist: [],
        eventBlacklist: [],
        specificEventBlacklist: [],
        eventIcon: "fa-solid fa-ticket"
    },
    getStyles: function() {
        return ["MMM-PokemonGOEvents.css", "font-awesome.css"];
    },

    start: function () {
        Log.info("Starting module: " + this.name);

        this.config.category = this.config.category.toLowerCase()
        this.config.theme = this.config.theme.toLowerCase();

        this.sendSocketNotification('PGO_INITIALIZE_GET_DATA', null);

        var domTimer = setInterval(() => 
        {
            this.updateDom();
        },
        this.config.updateInterval);
    },

    getEvents: function() {
        
        if (this.eventData != null)
        {
            var doUpdateData = false;
            var events = [];
            
            for (var i = 0; i < this.eventData.length && events.length < this.config.maxEvents; i++)
            {
                var e = this.eventData[i];

                if (this.config.eventWhitelist.length > 0)
                {
                    if (!this.config.eventWhitelist.includes(e.eventType))
                        continue;
                }
                else if (this.config.eventBlacklist.length > 0)
                {
                    if (this.config.eventBlacklist.includes(e.eventType))
                        continue;
                }

                if (this.config.specificEventBlacklist.length > 0)
                {
                    if (this.config.specificEventBlacklist.includes(e.eventID))
                        continue;
                }

                if (this.config.category == "current")
                {     
                    if (e.end - Date.now() < 0)
                    {
                        doUpdateData = true;
                        continue;
                    }
                    
                    if (this.config.exactTimestamp)
                    {
                        var time = moment.duration(e.end - Date.now());
                        e.relativeDate = "Ends in " + this.formatExactTime(time);
                    }
                    else
                    {
                        e.relativeDate = "Ends " + moment(e.end).fromNow();
                    }

                }
                else
                {
                    if (e.start - Date.now() < 0)
                    {
                        doUpdateData = true;
                        continue;
                    }

                    if (this.config.exactTimestamp)
                    {
                        var time = moment.duration(e.start - Date.now());
                        e.relativeDate = "Starts in " + this.formatExactTime(time);
                    }
                    else
                    {
                        e.relativeDate = "Starts " + moment(e.start).fromNow();
                    }
                }

                if (this.config.truncateTitle > 0 && e.name.length > this.config.truncateTitle)
                {
                    e.name = e.name.substring(0, this.config.truncateTitle) + "…"
                }
                
                events.push(e);
            }

            if (doUpdateData)
            {
                this.sendSocketNotification("PGO_GET_DATA", true);
            }

            return events;
        }
        
        return null;
    },

    getTemplate: function () {
		switch (this.config.theme) {
			case "default":
				return "themes/default.njk";
			case "leekduck":
				return "themes/leekduck.njk";
			default:
				return "themes/default.njk";
		}
	},

	getTemplateData: function () {

		return {
			config: this.config,
			events: this.getEvents()
		};
	},

    formatExactTime: function(time) {
        var timeSec = Math.floor(time / 1000);

        var days = Math.floor(timeSec / (3600*24));
        var hours = Math.floor(timeSec % (3600*24) / 3600);
        var minutes = Math.floor(timeSec % 3600 / 60);

        var formatted = ""
        if (days > 0)
            formatted = `${days} day${days == 1 ? "" : "s"}, ${hours} hour${hours == 1 ? "" : "s"}.`;
        else if (hours > 0)
                formatted = `${hours} hour${hours == 1 ? "" : "s"}, ${minutes} minute${minutes == 1 ? "" : "s"}.`;
        else if (minutes > 0)
            formatted = `${minutes} minute${minutes == 1 ? "" : "s"}.`;
        else
            formatted = "less than a minute."

        return formatted;
    },
    
    socketNotificationReceived: function(notification, payload) { 
        if (notification === "PGO_DATA_RESULT" && payload.category == this.config.category.toLowerCase())
        {
            console.log("[" + this.name + "] Received data result notification (\"" + payload.category + "\").")

            this.eventData = payload.array;

            if (this.config.category == "current")
            {
                this.eventData.sort((a, b) => a.end - b.end);
            }
            else //upcoming
            {
                this.eventData.sort((a, b) => a.start - b.start);
            }

            this.updateDom();
        }
    }
})