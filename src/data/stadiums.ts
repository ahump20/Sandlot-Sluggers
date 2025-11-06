export interface StadiumProfile {
  id: string;
  name: string;
  city: string;
  capacity: number;
  skylineColor: string;
}

export const stadiums: StadiumProfile[] = [
  {
    id: "harbor-lights",
    name: "Harbor Lights Park",
    city: "San Francisco",
    capacity: 42000,
    skylineColor: "#1f8ce6"
  },
  {
    id: "midnight-diamond",
    name: "Midnight Diamond",
    city: "Chicago",
    capacity: 38500,
    skylineColor: "#7235ff"
  }
];

export function getDefaultStadium(): StadiumProfile {
  return stadiums[0];
}
