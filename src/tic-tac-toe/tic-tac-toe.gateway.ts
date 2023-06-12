import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { TicTacToeService } from './tic-tac-toe.service';
import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  Options,
  ServerToClientEvents,
  User,
} from '../shared/interfaces/game-room';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://127.0.0.1:5173',
  },
})
export class TicTacToeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly ticTacToeService: TicTacToeService) {}

  @WebSocketServer() server: Server = new Server<
    ServerToClientEvents,
    ClientToServerEvents
  >();

  private logger = new Logger('ChatGateway');

  @SubscribeMessage('join_room')
  async join(@MessageBody() payload: { roomId: string; user: User }) {
    const room = await this.ticTacToeService.addUserToRoom(
      payload.roomId,
      payload.user,
    );

    this.server.in(payload.user.socketId).socketsJoin(room.id);

    this.server.to(room.id).emit('join_room_client', room);
    return room;
  }

  @SubscribeMessage('play')
  async play(
    @MessageBody()
    payload: {
      roomId: string;
      gameState: Options;
    },
  ) {
    const room = await this.ticTacToeService.savePlay(
      payload.roomId,
      payload.gameState,
    );

    this.server.to(room.id).emit('play_client', room);
    return room;
  }

  @SubscribeMessage('reset')
  async reset(
    @MessageBody()
    payload: {
      roomId: string;
    },
  ) {
    const room = await this.ticTacToeService.resetGame(payload.roomId);

    this.server.to(room.id).emit('reset_client', room);
    return room;
  }

  handleConnection(socket: Socket): any {
    this.logger.log(`Socket connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket): any {
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }
}
