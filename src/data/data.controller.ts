import { Controller, Get, Query } from '@nestjs/common';
import { DataService } from './data.service';
import { DataFindManyQueryDto } from 'src/dto/data-query.dto';
import { DataFindManyResponseDto } from 'src/dto/data-response.dto';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get()
  async findMany(
    @Query() query: DataFindManyQueryDto,
  ): Promise<DataFindManyResponseDto> {
    const data = await this.dataService.get();
    const response = data
      .map((element) => {
        if (element % query.user === 0) return element;
      })
      .filter((element) => element !== undefined);
    return { result: response };
  }
}
