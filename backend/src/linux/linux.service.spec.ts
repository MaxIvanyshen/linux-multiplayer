import { Test, TestingModule } from '@nestjs/testing';
import { LinuxService } from './linux.service';

describe('LinuxService', () => {
  let service: LinuxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LinuxService],
    }).compile();

    service = module.get<LinuxService>(LinuxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
