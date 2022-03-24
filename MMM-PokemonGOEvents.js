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
        minimalIcon: "fa-solid fa-circle"
    },
    getStyles: function() {
        return ["MMM-PokemonGOEvents.css"];
    },

    start: function () {
        Log.info("Starting module: " + this.name);

        this.config.category = this.config.category.toLowerCase()

        this.sendSocketNotification('PGO_INITIALIZE_GET_DATA', null);

        var domTimer = setInterval(() => 
        {
            this.updateDom();
        },
        this.config.updateInterval);
    },

    getDom: function() {
        var wrapper = document.createElement("div")
        
        if (this.eventData != null)
        {
            var html = '';
            var added = 0;
            for (var i = 0; i < this.eventData.length && added < this.config.maxEvents; i++)
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

                var relativeDate = '';
                if (this.config.category == "current")
                {     
                    if (e.end - Date.now() < 0)
                    {
                        this.sendSocketNotification("PGO_GET_DATA", true);
                        break;
                    }
                    
                    if (this.config.exactTimestamp)
                    {
                        var time = moment.duration(e.end - Date.now());
                        relativeDate = "Ends in " + this.formatExactTime(time);
                    }
                    else
                    {
                        relativeDate = "Ends " + moment(e.end).fromNow();
                    }

                }
                else
                {
                    if (e.start - Date.now() < 0)
                    {
                        this.sendSocketNotification("PGO_GET_DATA", true);
                        break;
                    }

                    if (this.config.exactTimestamp)
                    {
                        var time = moment.duration(e.start - Date.now());
                        relativeDate = "Starts in " + this.formatExactTime(time);
                    }
                    else
                    {
                        relativeDate = "Starts " + moment(e.start).fromNow();
                    }
                }

                if (this.config.truncateTitle > 0 && e.name.length > this.config.truncateTitle)
                {
                    e.name = e.name.substring(0, this.config.truncateTitle) + "…"
                }
                
                
                if (this.config.theme.toLowerCase() == "leekduck")
                {
                    html += `<div class="event-container leekduck" style="background-color: var(--pgo-${e.eventType})">
                                <div class="heading">
                                    ${e.heading}
                                    <img src="${e.image}">
                                </div>
                                <div class="inner">
                                    <p class="title">${e.name}</p>
                                    <p class="date">${relativeDate}</p>
                                </div>
                            </div>`;
                }
                else //default
                {
                    html += `<div class="event-container default">
                                <p class="title"><i class="${this.config.minimalIcon}" style="color: var(--pgo-${e.eventType})"></i> ${e.name}</p>
                                <p class="date light">${relativeDate}</p>
                            </div>`;
                }

                added++;
            }

            if (html == "")
            {
                html = '<span style="color: var(--color-text-bright);">No events.</span>'
            }

            wrapper.innerHTML = html;
        }
        
        return wrapper;
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
            this.updateDom();
        }
    }
})