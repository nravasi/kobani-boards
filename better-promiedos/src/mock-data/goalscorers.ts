import type { TopGoalscorer } from "../types.js";
import { teams } from "./teams.js";

export const topGoalscorers: TopGoalscorer[] = [
  { rank: 1, playerName: "Cavani", team: teams.boca, goals: 7 },
  { rank: 2, playerName: "Driussi", team: teams.river, goals: 6 },
  { rank: 3, playerName: "Valoyes", team: teams.talleres, goals: 5 },
  { rank: 4, playerName: "Janson", team: teams.velez, goals: 5 },
  { rank: 5, playerName: "Ramírez", team: teams.huracan, goals: 4 },
  { rank: 6, playerName: "Boselli", team: teams.estudiantesLP, goals: 4 },
  { rank: 7, playerName: "Cauteruccio", team: teams.independiente, goals: 4 },
  { rank: 8, playerName: "Retegui", team: teams.tigre, goals: 3 },
  { rank: 9, playerName: "Colidio", team: teams.river, goals: 3 },
  { rank: 10, playerName: "Sand", team: teams.lanus, goals: 3 },
  { rank: 11, playerName: "Cóccaro", team: teams.huracan, goals: 3 },
  { rank: 12, playerName: "Vecchio", team: teams.rosarioCentral, goals: 3 },
  { rank: 13, playerName: "Carbonero", team: teams.gimnasiaLP, goals: 2 },
  { rank: 14, playerName: "Ávalos", team: teams.argentinos, goals: 2 },
  { rank: 15, playerName: "Almendra", team: teams.racing, goals: 2 },
];
