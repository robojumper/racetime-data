import { useState } from "react";
import {
	getRaces,
	getSlugData,
	numPagesForGame,
	RACETIME,
	SlugData,
} from "./Loader";
import FormattedTable from "./FmtTable";
import CategoryLauncher from "./CategoryLauncher";
import "./Head2Head.css";
import MUTable, { MUEntrant, MUMapCtor } from "./MUTable";

// Used to cancel the async function that loads races if a new slug is set.
let token: Symbol;

function Head2Head() {
	const [muTable, setMuTable] = useState(new MUTable());
	const [playerNameList, setPlayerNameList] = useState<Array<string>>([]);
	const [recordTable, setRecordTable] = useState(MUMapCtor());
	const [userInfoMap, setUserInfoMap] = useState(new Map<string, MUEntrant>());
	const [loading, setLoading] = useState(false);
	const [validSlug, setValidSlug] = useState(false);
	const [currentSlugData, setCurrentSlugData] = useState<SlugData>();
	const updateFMTTableProps = (table: MUTable, newPlayersAdded: boolean) => {
		const [nameList, recTable] = table.generateSortedTable();
		setRecordTable(recTable);
		setPlayerNameList(nameList);
		if (newPlayersAdded) setUserInfoMap(table.playerRaceMap);
	};

	const setTableSlug = async (slug: string, valid = true) => {
		setValidSlug(valid);
		if (!valid) return;
		const myToken = (token = Symbol());
		clearTable();
		getSlugData(slug).then((data) => {
			setCurrentSlugData(data);
		});
		setLoading(true);
		try {
			const pageLimit = await numPagesForGame(slug);
			for (let i = 1; i <= pageLimit; i++) {
				const newTable = muTable;
				const newPlayersAdded = newTable.processRecordedRaces(
					(await getRaces(slug, i, true)).races
				);
				if (myToken !== token) {
					clearTable();
					return;
				} else {
					setMuTable(newTable);
					updateFMTTableProps(newTable, newPlayersAdded);
				}
			}
			setLoading(false);
		} catch {
			console.log(`A network error occurred when loading slug ${slug}.`);
			setLoading(false);
		}
	};

	const setTableGoal = (goal: string) => {
		setMuTable((muTable) => {
			muTable.goal = goal;
			updateFMTTableProps(muTable, false);
			return muTable;
		});
	};

	const clearTable = () => {
		setMuTable((muTable) => {
			muTable.clear();
			return muTable;
		});
	};
	return (
		<div className="container">
			<div className="catLaunch">
				<CategoryLauncher
					setTableSlug={setTableSlug}
					setTableGoal={setTableGoal}
					goalRaceMap={muTable.goalRaceMap}
				/>
			</div>
			{validSlug && (
				currentSlugData !== undefined && (
					<span>
						Selected Game:{" "}
						<a
							style={{ color: "cyan" }}
							href={`${RACETIME}${currentSlugData.url}`}
							target="_blank"
							rel="noreferrer"
						>
							{currentSlugData.name}
						</a>
						. {muTable.raceArray.length} total recorded race{muTable.raceArray.length === 1 ? "" : "s"} loaded
						{loading ? " so far." : "."}
					</span>
				)
			)}
			{validSlug &&
				(recordTable.size !== 0 ? (
					<div className="fmtTbl">
						<FormattedTable
							playerNameList={playerNameList}
							recordTable={recordTable}
							userInfoMap={userInfoMap}
						/>
					</div>
				) : muTable.goal === "" && (
					<span>Select a goal and a Head2Head table will appear here.</span>
				)
			)}
		</div>
	);
}

export default Head2Head;
