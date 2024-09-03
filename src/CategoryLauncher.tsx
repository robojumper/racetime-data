import { useState } from "react";
import "./CategoryLauncher.css";
import { isValidSlug } from "./Loader";
type CLProps = {
	setTableSlug: (slug: string, validity: boolean) => Promise<void>;
	setTableGoal: (goal: string) => void;
	goalRaceMap: Map<string, Set<number>>;
};

export default function CategoryLauncher(props: CLProps) {
	const { setTableSlug, setTableGoal, goalRaceMap } = props;

	const updateSlug = (newSlug: string) => {
		setSlug(newSlug);
		isValidSlug(newSlug).then((valid) => {
			setValidSlug(valid);
		});
	};

	const submitSlug = () => {
		if (validSlug) {
			setTableSlug(slug, true);
		}
	};

	const [slug, setSlug] = useState("");
	const [validSlug, setValidSlug] = useState(false);

	return (
		<div className="inputRow">
			<span>
				Welcome to the{" "}
				<a style={{ color: "cyan" }}
					href="https://github.com/YourAverageLink/racetime-data"
					target="_blank"
					rel="noreferrer">
					RaceTime Data Visualizer
				</a>
				! Enter a slug (e.g., lozssr,
				twwr) to get started.
			</span>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					submitSlug();
				}}
			>
				<input
					type="text"
					onChange={(string) => {
						updateSlug(string.currentTarget.value);
					}}

				/><span style={{ verticalAlign: "middle", marginLeft: "5px" }}>{validSlug ? "✅ Press Enter to load this game's races." : "❌ Please enter a valid slug."}</span>
			</form>
			{goalRaceMap.size !== 0 && (
				<div>
					<select
						name="goal"
						required
						onChange={(goalName) => setTableGoal(goalName.currentTarget.value)}
					>
						<option selected disabled value="">
							Select a goal:
						</option>
						{Array.from(goalRaceMap.keys()).map((goalName, idx) => (
							<option value={goalName} key={idx}>
								{goalName} ({goalRaceMap.get(goalName)?.size} race{goalRaceMap.get(goalName)?.size === 1 ? "" : "s"})
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	);
}
