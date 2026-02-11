// Re-export widget system types
export * from "./widgets";
export * from "./pages";
export * from "./registry";

export type CubeEvent =
  | "222"
  | "333"
  | "444"
  | "555"
  | "666"
  | "777"
  | "333bf"
  | "333oh"
  | "clock"
  | "minx"
  | "pyram"
  | "skewb"
  | "sq1";

export interface SolveRecord {
  id: number;
  time: number;
  scramble: string;
  event: CubeEvent;
  sessionId: number;
  timestamp: Date;
  penalty: "none" | "+2" | "dnf";
  comment?: string;
}

export interface SessionRecord {
  id: number;
  name: string;
  event: CubeEvent;
  createdAt: Date;
}

export interface TimerSettings {
  holdToStart: boolean;
  holdTime: number;
  inspection: boolean;
  inspectionTime: number;
  hideTime: boolean;
}

export interface Statistics {
  count: number;
  best: number | null;
  worst: number | null;
  mean: number | null;
  ao5: number | null;
  ao12: number | null;
  ao50: number | null;
  ao100: number | null;
  bestAo5: number | null;
  bestAo12: number | null;
}
