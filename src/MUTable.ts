import { EntrantStatus, RaceData, UserData } from "./Loader";

export type MURecord = {
    wins: number,
    losses: number,
    draws: number,
};

export type MUEntrant = {
    userData: UserData,
    raceSet: Set<number>,
    goalSet: Set<string>,
};

export type MUMap = Map<string, Map<string, MURecord>>;

export function MUMapCtor(): MUMap {
    return new Map<string, Map<string, MURecord>>();
}

/** Returns the percentage of matches won in the given record.
 * An empty record counts as a 25% win rate for sorting purposes.
 * Draws count as half of a win.
 * @param mu The record to be evaluated
 * 
 * @return The win rate (between 0 and 1 inclusive)
 */
export function winRate(mu: MURecord): number {
    if (mu === undefined) return 0;
    const totalGames = mu.wins + mu.losses + mu.draws
    if (totalGames === 0) return 0.25;
    return (mu.wins + mu.draws / 2) / totalGames;
}

/** Returns the inverse of a matchup record (i.e., player 2 vs. player 1) 
 * @param mu The record to invert
 * @return The inverse record (mu's wins become losses and losses become wins)
*/
function inverseMU(mu: MURecord): MURecord {
    return { wins: mu.losses, losses: mu.wins, draws: mu.draws };
}

/** A class for handling race data and calculating head-to-head matchups. */
class MUTable {
    raceArray: Array<RaceData> = [];
    playerRaceMap = new Map<string, MUEntrant>();
    goal: string = "";

    /** Returns the intersection of two sets of races, filtered by the currently selected goal. */
    intersectByGoal(set1: Set<number>, set2: Set<number>): Set<number> {
        let interSet = new Set<number>();
        set1.forEach((n) => {
            if (this.raceArray[n].goal.name === this.goal && set2.has(n)) interSet.add(n);
        })
        return interSet;
    }

    /** Returns a list of players who have played at least one race with the currently selected goal. */
    getPlayerList(): Array<string> {
        let arr: Array<string> = [];
        this.playerRaceMap.forEach((entrant, name) => {
            if (entrant.goalSet.has(this.goal)) arr.push(name);
        })
        return arr;
    }

    /** Looks up the head-to-head matchup between player1 and player2 for the currently selected goal. */
    lookup(player1: string, player2: string): MURecord | undefined {
        if (player1 === player2) return undefined;
        const p1 = this.playerRaceMap.get(player1);
        const p2 = this.playerRaceMap.get(player2);
        if (p1 === undefined || p2 === undefined) return undefined;
        return this.calculateMatchup(p1, p2);
    }

    /** Calculates the head-to-head matchup between p1 and p2 for the currently selected goal, using the
     * data held in the race array and the players' race sets.
     */
    calculateMatchup(p1: MUEntrant, p2: MUEntrant): MURecord {
        let matchup: MURecord = { wins: 0, losses: 0, draws: 0 };
        const racesToCheck = this.intersectByGoal(p1.raceSet, p2.raceSet);
        racesToCheck.forEach((idx) => {
            const race = this.raceArray[idx];
            // The entrant array is sorted by finish time, so the first name we find
            // is either the winner or (in case of double forfeit) in a draw.
            for (const entrant of race.entrants) {
                if (entrant.user.name === p1.userData.name) {
                    if (entrant.status.value === EntrantStatus.DNF) {
                        matchup.draws++;
                    } else {
                        matchup.wins++;
                    }
                    break;
                } else if (entrant.user.name === p2.userData.name) {
                    if (entrant.status.value === EntrantStatus.DNF) {
                        matchup.draws++;
                    } else {
                        matchup.losses++;
                    }
                    break;
                }
            }
        });
        return matchup;
    }

    /** Generates a two-layer map containing all calculated head-to-head matchups for the currently selected goal.
     * @returns a Map from username to another Map from username to a h2h matchup (MURecord).
     */
    generateTable(): MUMap {
        let table = MUMapCtor();
        this.playerRaceMap.forEach((entrant, username) => {
            if (entrant.goalSet.has(this.goal)) table.set(username, new Map<string, MURecord>());
        });
        this.playerRaceMap.forEach((entrant1, p1name) => {
            if (!entrant1.goalSet.has(this.goal)) return;
            this.playerRaceMap.forEach((entrant2, p2name) => {
                if (!entrant2.goalSet.has(this.goal)) return;
                if (p1name === p2name) return;
                if (table.get(p1name)?.get(p2name) !== undefined) return;
                const matchup = this.calculateMatchup(entrant1, entrant2);
                table.get(p1name)?.set(p2name, matchup);
                table.get(p2name)?.set(p1name, inverseMU(matchup));
            });
        });
        return table;
    }

    /** Generates a matchup map and sorts the list of players by the sum of their win rates. 
     * @returns a tuple containing the sorted Array of usernames, and the generated MUMap (see generateTable())
    */
    generateSortedTable(): [Array<string>, MUMap] {
        const playerList = this.getPlayerList();
        const recTable = this.generateTable();
        const sumWinRate = (name: string) => {
            let sum = 0;
            for (const opponent of playerList) {
                const rec = recTable.get(name)?.get(opponent);
                if (rec !== undefined) sum += winRate(rec);
            }
            return sum;
        }
        const sortedList = playerList.toSorted((p1: string, p2: string) => sumWinRate(p2) - sumWinRate(p1));
        return [sortedList, recTable];
    }

    /** Adds the given race to the race array and updates players' info to include this race.
     * Any new players will be added to the playerRaceMap with a fresh set of races and goals.
     * @returns Whether or not any new players were added to the playerRaceMap.
     */
    processRace(race: RaceData): boolean {
        const arrayID = this.raceArray.length;
        this.raceArray.push(race);
        let newPlayersAdded = false;
        for (const entrant of race.entrants) {
            const { user } = entrant;
            if (!this.playerRaceMap.has(user.name)) {
                newPlayersAdded = true;
                this.playerRaceMap.set(user.name, { userData: user, raceSet: new Set<number>(), goalSet: new Set<string>() });
            }
            this.playerRaceMap.get(entrant.user.name)?.raceSet.add(arrayID);
            this.playerRaceMap.get(entrant.user.name)?.goalSet.add(race.goal.name);
        }
        return newPlayersAdded;
    }

    /** Processes any races in the array that are recorded.
     * @returns Whether any recorded race added any new players to the playerRaceMap
     */
    processRecordedRaces(races: Array<RaceData>): boolean {
        // The mapping array needs to exist, because if we directly check for any true values
        // returned by processRace, any races recorded after the first one that includes someone new
        // will be optimized out.
        const anyNewPlayers = races.filter((race) => race.recorded).map((race) => {
            return this.processRace(race);
        })
        return anyNewPlayers.some((newPlayers) => newPlayers === true);
    }

    /** Resets the table's goal, array of races, and player map. */
    clear() {
        this.goal = "";
        this.raceArray = [];
        this.playerRaceMap = new Map<string, MUEntrant>();
    }

}

export default MUTable;