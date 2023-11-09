import { IsInt } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

const reformatInt = ({ value }: { value: number }): number => {
  if (!value) {
    return 1;
  }
  return +value;
};

export class DataFindManyQueryDto {
  @Expose()
  @Transform(reformatInt)
  @IsInt()
  user: number;
}
