# RaceTime Data Visualizer

This is a web app I created to automate the process of calculating a Head2Head sheet for races held on [racetime.gg](https://racetime.gg/). It fetches data from rt.gg's public API endpoints. Currently, you can enter any game's slug (e.g., `lozssr` for Skyward Sword Randomizer, or `twwr` for The Wind Waker Randomizer), and select any of its current recordable goals, and a Head2Head table will begin populating its cells. Currently, the API only gives data for 10 races at a time, so it may take some time for all of a game's races to be loaded in. The table will update in real time. Do note that changing goals will not clear out the table (it only filters which races are counted), but changing the slug *will* reset the table.

The table is sorted by the sum of each player's win rate against each other player. For sorting purposes, an empty record counts as a 25% win rate. This is an arbitrary choice, but it is meant to place those with few matches above those who have lost many matches.

### TODO
- Add general data page (could display number of 1st, 2nd, and 3rd place finishes, win rate, etc.)
- Add click functionality for Head2Head cells (display a list of races two players faced off in)
