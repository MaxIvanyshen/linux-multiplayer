import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { LinuxService } from "./linux.service";
import { Inject } from "@nestjs/common";

@WebSocketGateway(8000, {
    namespace: '/linux',
    cors: {
        origin: '*',
        credentials: true
    }
})
export class LinuxGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(@Inject() private readonly service: LinuxService) {
        this.service = service;
    }

    @SubscribeMessage('key')
    onKey(@MessageBody() key: string) {
        this.service.write(key);
        return { status: 'ok' };
    }

    @SubscribeMessage('resize')
    onResize(@MessageBody() data: { cols: number; rows: number }) {
        this.service.resize(data.cols, data.rows);
        return { status: 'ok' };
    }


    handleConnection(client: any) {
        this.service.checkConnections(client.id);
        this.service.onData(chunk => client.emit('output', chunk));
    }

    handleDisconnect(client: any) {
        this.service.deleteConnection(client.id);
    }
}
