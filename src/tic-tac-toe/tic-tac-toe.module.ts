import { Module } from '@nestjs/common';
import { TicTacToeService } from './tic-tac-toe.service';
import { TicTacToeGateway } from './tic-tac-toe.gateway';

@Module({
  providers: [TicTacToeGateway, TicTacToeService]
})
export class TicTacToeModule {}
