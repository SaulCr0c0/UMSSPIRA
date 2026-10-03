const { spawn } = require('node:child_process');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const url = 'http://localhost:3000';
const frontendUrl = 'http://localhost:3001';
const nestCli = path.join(__dirname, 'node_modules', '@nestjs', 'cli', 'bin', 'nest.js');
const server = spawn(process.execPath, [nestCli, 'start', '--watch'], {
  cwd: __dirname,
  env: process.env,
  stdio: 'inherit',
});

server.on('error', (error) => {
  console.error('No se pudo iniciar Nest:', error.message);
  process.exitCode = 1;
});

server.on('exit', (code) => {
  process.exit(code ?? 0);
});

async function openConsoleWhenReady() {
  for (let attempt = 0; attempt < 60 && server.exitCode === null; attempt += 1) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      if (response.ok && html.includes('UMSSPIRA | Consola API')) {
        console.log(`Consola backend disponible: ${url}`);
        console.log(`Frontend web: ${frontendUrl}`);
        return;
      }
    } catch {
      // Nest may still be compiling; retry while the server process is alive.
    }

    await delay(1000);
  }

  if (server.exitCode === null) {
    console.error(`No se detecto la consola en ${url}. Revisa los errores de compilacion de Nest.`);
  }
}

openConsoleWhenReady();