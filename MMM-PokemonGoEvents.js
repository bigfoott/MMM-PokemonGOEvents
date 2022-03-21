Module.register("MMM-PokemonGoEvents", {
    defaults: {
        category: "current",
        updateInterval: 600000, //10 minutes
        maxEvents: 5,
        truncateTitle: 35
        //TODO: whitelist/blacklist events
    },
    getStyles: function() {
        return ["MMM-PokemonGoEvents.css"];
    },

    start: function () {
        Log.info("Starting module: " + this.name);

        this.config.category = this.config.category.toLowerCase()

        var timer = setInterval(() => 
        {
            this.sendSocketNotification("GET_DATA", this.config.category);
        },
        this.config.updateInterval)
        this.sendSocketNotification("GET_DATA", this.config.category);
    },

    getDom: function() {
        var wrapper = document.createElement("div")
        
        if (this.eventData != null)
        {
            var html = '';
            for (var i = 0; i < this.config.maxEvents && i < this.eventData.length; i++)
            {
                var e = this.eventData[i];

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
            }
            wrapper.innerHTML = html;
        }
        
        return wrapper;
    },
    
    socketNotificationReceived: function(notification, payload) { 
        if (notification === "DATA_RESULT") {
            this.eventData = payload;
            this.updateDom();
        }
    }
  })