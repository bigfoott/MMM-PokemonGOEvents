# MMM-PokemonGOEvents

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/) that displays Pokemon GO events. All event data is scraped from [Leek Duck](https://www.leekduck.com/events/).

![Preview](https://github.com/bigfoott/MMM-PokemonGOEvents/blob/master/docs/preview.png?raw=true)

## Using the Module

To install this module, clone this repository into the `MagicMirror/modules` folder and install the necessary dependencies:
```
git clone https://github.com/bigfoott/MMM-PokemonGOEvents.git
cd MMM-PokemonGOEvents
npm install
```

To use this module, add the following to the modules array in the `config/config.js` file:
```js
modules: [
    {
        module: 'MMM-PokemonGOEvents',
        position: 'bottom_right',
        header: "Pokemon GO Events",
        config: {
            category: "current",
            updateInterval: 5000, //5 seconds
            dataUpdateInterval: 600000, //10 minutes
            maxEvents: 5,
            truncateTitle: 0,
            eventWhitelist: [],
            eventBlacklist: [],
            specificEventBlacklist: []
        }
    }
]
```

## Configuration

| Option                           | Type       | Default     | Description
|--------------------------------- |----------- |------------ |----------- 
| **`category`**                   | `string`   | `"current"` | The category of events to display. Can be either `"current"` or `"upcoming"`.
| **`updateInterval`**             | `int` (ms) | `5000`      | The interval at which the DOM is updated.<br/>**NOTE**: This does not re-download event data.
| **`dataUpdateInterval`**         | `int` (ms) | `600000`    | The interval at which event data is updated.<br/>**NOTE**: Event data (on Leek Duck) is updated very rarely, so this does not need to update very often.
| **`maxEvents`**                  | `int`      | `5`         | The maximum number of events to show in the module.
| **`truncateTitle`**              | `int`      | `0`         | Truncate the title of events if they're too long. [0 = no truncation]
| **`eventWhitelist`**             | `string[]` | `[]`        | Whitelist certain event types. Only types listed in this array will be shown.
| **`eventBlacklist`**             | `string[]` | `[]`        | Blacklist certain event types. All types not listed in this array will be shown.<br/>**NOTE**: This option is ignored if the a whitelist is set.
| **`specificEventBlacklist`**     | `string[]` | `[]`        | Blacklist specific events. Events are specified by the ID on the Leek Duck website.<br/>**EX:** To blacklist the Season of Alola event, add `"season-of-alola"` from the event's url `"https://www.leekduck.com/events/season-of-alola/"`.

## Event Types

View the list of event types [here](https://github.com/bigfoott/MMM-PokemonGOEvents/tree/master/docs/EVENTS.md).

## Default Configuration

```js
modules: [
    {
        module: 'MMM-PokemonGOEvents',
        position: 'bottom_right',
        header: "Pokemon GO Events",
        config: {
            category: "current",
            updateInterval: 5000, //5 seconds
            dataUpdateInterval: 600000, //10 minutes
            maxEvents: 5,
            truncateTitle: 0,
            eventWhitelist: [],
            eventBlacklist: [],
            specificEventBlacklist: []
        }
    }
]
```