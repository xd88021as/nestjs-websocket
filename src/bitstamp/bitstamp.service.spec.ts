import { Test, TestingModule } from '@nestjs/testing';
import { BitstampService } from './bitstamp.service';

describe('BitstampService', () => {
  let service: BitstampService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BitstampService],
    }).compile();

    service = module.get<BitstampService>(BitstampService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
