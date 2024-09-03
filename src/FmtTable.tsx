import { MUEntrant, MUMap, winRate } from "./MUTable";
import "./FmtTable.css";
type FMTProps = {
    playerNameList: Array<string>;
    recordTable: MUMap;
    userInfoMap: Map<string, MUEntrant>;
};

function FormattedTable(props: FMTProps) {
    const { playerNameList, recordTable, userInfoMap } = props;
    const formattedRecord = (p1: string, p2: string) => {
        const rec = recordTable.get(p1)?.get(p2);
        if (rec === undefined) return <span>X</span>;
        if (rec.wins === 0 && rec.losses === 0) return <span>0 - 0</span>;
        let cssName = "neutralRec";
        const wr = winRate(rec);
        if (wr > 0.5) cssName = "posRec";
        else if (wr < 0.5) cssName = "negRec";
        return <span className={cssName}>{`${rec.wins} - ${rec.losses}`}</span>;
    };
    return (
        <div className="innerContainer">
            <table>
                <thead>
                    <tr>
                        <td className="cornerCell">Left vs Top</td>
                        {playerNameList.map((name, idx) => (
                            <td key={idx}>
                                {name}
                                {userInfoMap.get(name)?.userData.avatar !== undefined &&
                                    userInfoMap.get(name)?.userData.avatar !== null && (
                                        <img
                                            src={userInfoMap.get(name)?.userData.avatar}
                                            alt={name}
                                            className="topPfp"
                                        ></img>
                                    )}
                            </td>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {playerNameList.map((name, idx) => (
                        <tr key={idx}>
                            <td className="leftmost">
                                <span className="playerNameLeft">{name}</span>
                                {userInfoMap.get(name)?.userData.avatar !== undefined &&
                                    userInfoMap.get(name)?.userData.avatar !== null && (
                                        <img
                                            src={userInfoMap.get(name)?.userData.avatar}
                                            alt={name}
                                            className="leftPfp"
                                        ></img>
                                    )}
                            </td>
                            {playerNameList.map((opponent, idx2) => (
                                <td key={idx2} className="h2h">
                                    {formattedRecord(name, opponent)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default FormattedTable;
