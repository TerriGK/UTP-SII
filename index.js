const express = require("express");
const { engine } = require("express-handlebars");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const fileUpload = require('express-fileupload');
const chalk = require('chalk');
const figlet = require('figlet');
require("dotenv").config();

const app = express();

// ==============================================
// Configuración inicial del servidor
// ==============================================
console.log(chalk.green.bold('\nInicializando arquitectura del servidor...\n'));

// Configuración de vistas
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
console.log(chalk.blue('✓ Directorio público configurado:'), chalk.white(path.join(__dirname, 'public')));

// Configuración de Handlebars
app.set("views", path.join(__dirname, "src", "views"));
app.engine(
  ".hbs",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: [
      path.join(app.get("views"), "layouts"),
      path.join(app.get("views"), "alumno", "estadia", "partials")
    ],
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");
console.log(chalk.blue('✓ Motor de plantillas Handlebars configurado'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());
console.log(chalk.blue('✓ Middlewares básicos configurados'));

// Configuración de sesión
app.use(session({
  secret: "keyboard cat",
  resave: true,
  saveUninitialized: true,
}));
app.use(flash());
console.log(chalk.blue('✓ Sistema de sesiones y flash messages configurado'));

// Variables globales
app.use(require('./globals'));
console.log(chalk.blue('✓ Variables globales configuradas'));

// Rutas
app.use('/api', require('./src/routes/apis'));
app.use(require("./src/routes/routes"));
console.log(chalk.blue('✓ Rutas configuradas'));

// ==============================================
// Inicio del servidor - Diseño mejorado
// ==============================================
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.clear();
  
  // Banner principal con efecto ASCII
  figlet.text('Servidor Express', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true
  }, (err, data) => {
    if (err) {
      console.log(chalk.green.bold('\nServidor Express\n'));
    } else {
      console.log(chalk.hex('#00ff00').bold(data));
    }

    // Marco de información del servidor
    console.log(chalk.hex('#00ffff').bold(`
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║                SERVIDOR INICIADO CON ÉXITO                 ║
    ║                                                            ║
    ╠════════════════════════════════════════════════════════════╣
    ║                                                            ║
    ║    Modo:          ${chalk.white.bold(process.env.MODE || 'development'.padEnd(30))}║
    ║    Puerto:        ${chalk.white.bold(port.toString().padEnd(30))}║
    ║    URL:           ${chalk.white.bold(`http://localhost:${port}`.padEnd(30))}║
    ║    Iniciado:      ${chalk.white.bold(new Date().toLocaleString().padEnd(30))}║
    ║                                                            ║
    ╠════════════════════════════════════════════════════════════╣
    ║                                                            ║
    ║    ${chalk.hex('#ff9900')('Developed by:')} ${chalk.white.bold('Fabian').padEnd(42)}║
    ║    ${chalk.hex('#ff9900')('Error System:')} ${chalk.white.bold('Terri v2.1').padEnd(42)}║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
    `));

    // Mensaje final
    console.log(chalk.hex('#00ff00')(`
    [${new Date().toLocaleTimeString()}] Servidor operativo
    Presiona ${chalk.white.bold('CTRL + C')} para finalizar la ejecución
    `));

    // Mensaje oculto estilo hacker
    console.log(chalk.gray(`
    Sistema de monitoreo activo
    Escaneando rutas...
    Conexiones seguras: ${chalk.green.bold('ENABLED')}
    `));
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.log(chalk.red.bold('\n⚠ Error crítico detectado por Terri:'));
  console.log(chalk.red(err.stack));
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.log(chalk.red.bold('\n⚠ Advertencia de promesa no manejada:'));
  console.log(chalk.red(err.stack));
});