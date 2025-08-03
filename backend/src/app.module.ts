import { Module } from '@nestjs/common';
import { LinuxModule } from './linux/linux.module';

@Module({
    imports: [LinuxModule],
})
export class AppModule { }
