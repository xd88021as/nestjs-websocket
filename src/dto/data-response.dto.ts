import { IsArray } from 'class-validator';

export class DataFindManyResponseDto {
  @IsArray()
  result: number[];
}
