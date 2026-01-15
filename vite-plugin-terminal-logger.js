// Vite plugin для отправки console.log из браузера в терминал
export function terminalLogger() {
  return {
    name: 'terminal-logger',
    configureServer(server) {
      // HTTP endpoint для отправки логов
      server.middlewares.use('/__terminal-log', (req, res, next) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const log = JSON.parse(body)
              const { level, message } = log
              
              const timestamp = new Date().toLocaleTimeString()
              
              // Выводим только console.log/info/warn/error/debug
              if (level === 'error') {
                console.error(`[${timestamp}] ${message}`)
              } else if (level === 'warn') {
                console.warn(`[${timestamp}] ${message}`)
              } else {
                console.log(`[${timestamp}] ${message}`)
              }
              
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: true }))
            } catch (e) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Invalid log format' }))
            }
          })
        } else {
          next()
        }
      })

      // Middleware для инжекта скрипта
      server.middlewares.use((req, res, next) => {
        if (req.url === '/__terminal-logger.js') {
          res.setHeader('Content-Type', 'application/javascript')
          res.end(`
            (function() {
              function sendToTerminal(level, ...args) {
                const message = args.map(arg => {
                  if (typeof arg === 'object') {
                    try {
                      return JSON.stringify(arg, null, 2);
                    } catch (e) {
                      return String(arg);
                    }
                  }
                  return String(arg);
                }).join(' ');

                fetch('/__terminal-log', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ level, message })
                }).catch(() => {});
              }

              const originalLog = console.log;
              const originalInfo = console.info;
              const originalWarn = console.warn;
              const originalError = console.error;
              const originalDebug = console.debug;

              console.log = (...args) => {
                sendToTerminal('log', ...args);
                originalLog.apply(console, args);
              };
              console.info = (...args) => {
                sendToTerminal('info', ...args);
                originalInfo.apply(console, args);
              };
              console.warn = (...args) => {
                sendToTerminal('warn', ...args);
                originalWarn.apply(console, args);
              };
              console.error = (...args) => {
                sendToTerminal('error', ...args);
                originalError.apply(console, args);
              };
              console.debug = (...args) => {
                sendToTerminal('debug', ...args);
                originalDebug.apply(console, args);
              };
            })();
          `)
        } else {
          next()
        }
      })
    },
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `<script src="/__terminal-logger.js"></script></head>`
      )
    }
  }
}
