## Inform Mapper
Inform Mapper is an interactive web graphing application for Inform adventure games.

![Site screenshot](/promos/promo.png?raw=true "Graph screen")

### About
Remember those old text adventure games where you would type in what you wanted your character to do? Those games came in many formats, but one of the most popular was the Inform format. Even though the company that created it, Infocom, went bankrupt, the Inform format was reverse-engineered and recreated, so even many modern adventure games use it. 
 
Since the format is well-understood and well-structured, it's possible to map out all the nodes in a game along with how they connect. That's what this site does. Inform files end with the .z1-.z8 extension.

Inform Mapper is a Flask app that uses cytoscape.js to draw the interactive graph. It uses gulp to deal with building all the frontend resources.

### Resources
Inform Mapper makes use of the following resources:
* [cytoscape.js](http://js.cytoscape.org/)
* [modernizr](https://modernizr.com/)
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/)
* [findAndReplaceDOMText](https://github.com/padolsey/findAndReplaceDOMText)
* [Paper background](http://timeproduction.ru/) from [subtlepatterns](https://www.toptal.com/designers/subtlepatterns/)

The build process makes use of gulp and sass. Run `gulp watch` while developing and `gulp dist` to generate a distribution package.

The backend uses Flask and Python 3.

The server related code is explained in the server/README.md file.

Tests are written using pytest. Run `pytest` in the `tests/` directory to run them.

### Future Work
Due to a lack of time, resources, and interest, I have shut down informmapper.xyz and will be taking a hiatus from this project. Below is a list of bugs and planned features I had originally planned to work on.

#### Bugs
- Add href tags to the About and Contact links.
- Node info box will not scroll to top if you select a long node then a short one.
- Make a 16x16 icon for mobile.
- Fix v8 compatibility. Some work, but titles like moon.v8 do not.
- Test on v1 compatibility. I have never found a v1 game.
- Properly import flask into tests to build them out.

#### Features
- Get the hard-coded text strings at the end of the file.
- Log page views using a sqlite backend.
- Add parchment interpreter so users can play and disassemble at the same time.
- Detect the release library in the header.
- Decode verbs.
- Decode property defaults.
- Disassembler of the game code.
- Add abbrevation and custom dictionary support in text decoding.
 
