const net = require('net');

const host = 'aws-1-ap-south-1.pooler.supabase.com';
const ports = [5432, 6543];

ports.forEach(port => {
    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.on('connect', () => {
        console.log(`Successfully connected to ${host}:${port}`);
        socket.destroy();
    });

    socket.on('timeout', () => {
        console.log(`Connection to ${host}:${port} timed out`);
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.log(`Error connecting to ${host}:${port}: ${err.message}`);
    });

    console.log(`Connecting to ${host}:${port}...`);
    socket.connect(port, host);
});
