export interface CharacterProfile {
  id: string;
  name: string;
  position: string;
  battingAverage: number;
  handedness: "L" | "R" | "S";
  accentColor: string;
}

export const characters: CharacterProfile[] = [
  {
    id: "ace-pitch",
    name: "Ace Valdez",
    position: "Pitcher",
    battingAverage: 0.278,
    handedness: "R",
    accentColor: "#ff8f1f"
  },
  {
    id: "sky-short",
    name: "Skylar Brooks",
    position: "Shortstop",
    battingAverage: 0.301,
    handedness: "S",
    accentColor: "#35d0ff"
  },
  {
    id: "crush-left",
    name: "Mason \"Crush\" Hart",
    position: "Left Field",
    battingAverage: 0.289,
    handedness: "L",
    accentColor: "#ff4f6d"
  }
];

export function getLineup(): CharacterProfile[] {
  return characters;
}
