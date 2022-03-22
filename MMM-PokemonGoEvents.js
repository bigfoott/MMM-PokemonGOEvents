Module.register("MMM-PokemonGoEvents", {
    defaults: {
        category: "current",
        updateInterval: 600000, //10 minutes
        maxEvents: 5,
        truncateTitle: 30,
        eventBlacklist: [],
        eventWhitelist: [],
        specificEventBlacklist: []
    },
    getStyles: function() {
        return ["MMM-PokemonGoEvents.css"];
    },

    start: function () {
        Log.info("Starting module: " + this.name);

        this.config.category = this.config.category.toLowerCase()

        var payload = { category: this.config.category, index: this.data.index }

        var timer = setInterval(() => 
        {
            this.sendSocketNotification("PGO_GET_DATA", payload);
        },
        this.config.updateInterval);

        this.sendSocketNotification("PGO_GET_DATA", payload);
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
                    relativeDate = "Ends " + moment(e.end).fromNow();
                }
                else
                {
                    relativeDate = "Starts " + moment(e.start).fromNow();
                }

                if (this.config.truncateTitle > 0 && e.name.length > this.config.truncateTitle)
                {
                    e.name = e.name.substring(0, this.config.truncateTitle) + "…"
                }
                
                html += `<div class="event-container ${e.eventType}">
                            <div class="heading">
                                ${e.heading}
                                <img src="${e.image}">
                            </div>
                            <div class="inner">
                                <p class="title">${e.name}</p>
                                <p class="date">${relativeDate}</p>
                            </div>
                        </div>`;
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
    
    socketNotificationReceived: function(notification, payload) { 
        if (notification === "PGO_DATA_RESULT" && payload.index == this.data.index)
        {
            this.eventData = payload.array;
            this.updateDom();
        }
    }
  })