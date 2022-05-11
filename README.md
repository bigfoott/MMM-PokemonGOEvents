![Preview](https://github.com/bigfoott/MMM-PokemonGOEvents/blob/master/docs/preview.png?raw=true)

![License | MIT](https://badgen.net/badge/license/MIT/purple) ![Platform | MagicMirror²](https://badgen.net/badge/platform/MagicMirror%C2%B2/purple)

**MMM-PokemonGOEvents** is a module for [MagicMirror²](https://magicmirror.builders/) ([Repo](https://github.com/MichMich/MagicMirror)) that displays Pokemon GO events.

All event data is gathered from [ScrapedDuck](https://github.com/bigfoott/ScrapedDuck), which scrapes [LeekDuck.com](https://www.leekduck.com/) at a set interval.

## Usage

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
            // See below for configuration options
        }
    }
]
```

## Configuration

| Option                           | Type       | Default              | Description
|--------------------------------- |----------- |--------------------- |----------- 
| **`category`**                   | `string`   | `"current"`          | The category of events to display. Can be either `"current"` or `"upcoming"`.
| **`theme`**                      | `string`   | `"default"`          | Choose a visual theme for the module. Can be either `"default"` or `"leekduck"`.
| **`updateInterval`**             | `int` (ms) | `5000`               | The interval at which the DOM is updated.<br/>**NOTE**: This does not re-download event data.
| **`maxEvents`**                  | `int`      | `5`                  | The maximum number of events to show in the module.
| **`truncateTitle`**              | `int`      | `0`                  | Truncate the title of events if they're too long.<br/>[0 = no truncation]
| **`exactTimestamp`**             | `bool`     | `false`              | Display a more precise timestamp for the event start/end dates.
| **`eventWhitelist`**             | `string[]` | `[]`                 | Whitelist certain event types. Only types listed in this array will be shown.
| **`eventBlacklist`**             | `string[]` | `[]`                 | Blacklist certain event types. All types not listed in this array will be shown.<br/>**NOTE**: This option is ignored if the a whitelist is set.
| **`specificEventBlacklist`**     | `string[]` | `[]`                 | Blacklist specific events. Events are specified by the ID on the Leek Duck website.<br/>**EX:** To blacklist the Season of Alola event, add `"season-of-alola"` from the event's url `"https://www.leekduck.com/events/season-of-alola/"`.
| **`eventIcon`**                  | `string`   | `fa-solid fa-ticket` | The icon to show next to event titles using the `default` theme. Value should be the relevant classes of a [Font Awesome](https://fontawesome.com/) icon.

## Event Types

View the list of event types [here](https://github.com/bigfoott/MMM-PokemonGOEvents/tree/master/docs/EVENTS.md).

## Default Configuration

```js
{
    module: 'MMM-PokemonGOEvents',
    position: 'bottom_right',
    header: "Pokemon GO Events",
    config: {
        category: "current",
        theme: "default",
        updateInterval: 5000,
        maxEvents: 5,
        truncateTitle: 0,
        exactTimestamp: false,
        eventWhitelist: [],
        eventBlacklist: [],
        specificEventBlacklist: [],
        eventIcon: "fa-solid fa-ticket"
    }
}
```