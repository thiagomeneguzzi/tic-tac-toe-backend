export interface User {
  userName: string;
  socketId: string;
}

export interface Room {
  id: string;
  host: User;
  users: User[];
  gameState: Options;
  winner: string | undefined;
  draw: boolean;
  turn: {
    user: User;
    item: Option;
  };
}

export enum Option {
  X = 'X',
  O = 'O',
  EMPTY = '',
}

export type Options = Option[];

export interface ServerToClientEvents {
  play: (room: Room) => void;
  reset: (roomId: string) => void;
  join_room: (room: Room) => void;
}

export interface ClientToServerEvents {
  join_room: (e: { user: User; roomId: string }) => void;
  play: (e: { roomId: string; gameState: Options }) => void;
  reset: (e: { roomId: string }) => void;
}
