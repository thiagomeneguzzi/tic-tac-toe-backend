import { Injectable } from '@nestjs/common';
import { Option, Options, Room, User } from '../shared/interfaces/game-room';

@Injectable()
export class TicTacToeService {
  private rooms: Room[] = [];

  async createRoom(roomId: string, host: User): Promise<Room> {
    const room = {
      id: roomId,
      host,
      users: [host],
      gameState: [
        Option.EMPTY,
        Option.EMPTY,
        Option.EMPTY,
        Option.EMPTY,
        Option.EMPTY,
        Option.EMPTY,
        Option.EMPTY,
        Option.EMPTY,
        Option.EMPTY,
      ],
      winner: undefined,
      draw: false,
      turn: {
        user: host,
        item: Option.X,
      },
    };
    this.rooms.push(room);
    return room;
  }

  async getRoomById(id: string): Promise<number> {
    return this.rooms.findIndex((room) => room.id === id);
  }

  async addUserToRoom(roomId: string, user: User): Promise<Room> {
    const roomIndex = await this.getRoomById(roomId);

    if (roomIndex !== -1) {
      if (this.rooms[roomIndex].users.length !== 2) {
        this.rooms[roomIndex].users.push(user);
      }
      return this.rooms[roomIndex];
    } else {
      const createdRoom = await this.createRoom(roomId, user);
      return createdRoom;
    }
  }

  async savePlay(roomId: string, gameState: Options): Promise<Room> {
    const roomIndex = await this.getRoomById(roomId);
    if (roomIndex !== -1) {
      this.rooms[roomIndex].gameState = gameState;

      const isWinner = this.verifyWinner(
        gameState,
        this.rooms[roomIndex].turn.item,
      );

      if (isWinner) {
        this.rooms[roomIndex].winner = this.rooms[roomIndex].turn.user.userName;
      } else {
        const isDraw = this.verifyGotOld(gameState);
        if (isDraw) {
          this.rooms[roomIndex].draw = isDraw;
        } else {
          const user = this.rooms[roomIndex].users.find(
            (user) =>
              user.socketId !== this.rooms[roomIndex].turn.user.socketId,
          );

          this.rooms[roomIndex].turn.user = user;
          this.rooms[roomIndex].turn.item =
            this.rooms[roomIndex].turn.item === Option.X ? Option.O : Option.X;
        }
      }
    }

    return this.rooms[roomIndex];
  }

  async resetGame(roomId: string): Promise<Room> {
    const roomIndex = await this.getRoomById(roomId);

    if (roomIndex !== -1) {
      const resetedRoom = {
        ...this.rooms[roomIndex],
        gameState: [
          Option.EMPTY,
          Option.EMPTY,
          Option.EMPTY,
          Option.EMPTY,
          Option.EMPTY,
          Option.EMPTY,
          Option.EMPTY,
          Option.EMPTY,
          Option.EMPTY,
        ],
        winner: undefined,
        draw: false,
        turn: {
          user: this.rooms[roomIndex].host,
          item: Option.X,
        },
      };
      this.rooms[roomIndex] = resetedRoom;
    }

    return this.rooms[roomIndex];
  }

  verifyWinner(options, currentTurn) {
    return possibleWinsIndex.some((possible) => {
      return possible.every((value) => options[value] === currentTurn);
    });
  }

  verifyGotOld(options) {
    return options.every((option) => {
      return option.length > 0;
    });
  }
}

const possibleWinsIndex = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 4, 8],
  [6, 4, 2],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];
