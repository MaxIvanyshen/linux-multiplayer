import { Module } from '@nestjs/common';
import { LinuxGateway } from './linux.gateway';
import { LinuxService } from './linux.service';

@Module({
    providers: [LinuxGateway, LinuxService],
})
export class LinuxModule { }
