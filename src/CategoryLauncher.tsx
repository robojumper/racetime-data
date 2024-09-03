import { useState } from "react";
import "./CategoryLauncher.css";
import { isValidSlug, getRecordableGoals } from "./Loader";
type CLProps = {
	setTableSlug: (slug: string, validity: boolean) => Promise<void>;
	setTableGoal: (goal: string) => void;
};

export default function CategoryLauncher(props: CLProps) {
	const { setTableSlug, setTableGoal } = props;

	const updateSlug = (newSlug: string) => {
		isValidSlug(newSlug).then((valid) => {
			setValidSlug(valid);
			setTableSlug(newSlug, valid);
			if (valid) {
				getRecordableGoals(newSlug).then((goals) => {
					setGoalList(goals);
				});
			} else {
				setGoalList([]);
			}
		});
	};

	const [validSlug, setValidSlug] = useState(false);
	const [goalList, setGoalList] = useState<Array<string>>([]);

	return (
		<div className="inputRow">
			<span>
				Welcome to the RaceTime Data Visualizer! Enter a slug (e.g., lozssr,
				twwr) to get started.
			</span>
			<form>
				<input
					type="text"
					onChange={(string) => {
						updateSlug(string.currentTarget.value);
					}}
				/>
			</form>
			{validSlug && (
				<div>
					<select
						name="goal"
						required
						onChange={(goalName) => setTableGoal(goalName.currentTarget.value)}
					>
						<option selected disabled value="">
							Select a goal:
						</option>
						{goalList.map((goalName, idx) => (
							<option value={goalName} key={idx}>
								{goalName}
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	);
}
