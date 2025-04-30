const { request, response } = require("express");
const { Alumno, ProfeAuth, Aspirante, Usuarios } = require("../models");
const bcrypt = require('bcrypt');

const AuthController = {};

// Establecer sesión de usuario
const setSession = (req, user, role, additionalData = {}) => {
  req.session.isAuthenticated = true;
  req.session[role] = true;
  req.session.IDAuth = user.MATRICULA || user.NUMEROALUMNO || user.CLAVEPROFESOR || user.EMAIL;
  req.session.nameAuth = user.NOMBRE || user.NOMBREPROFESOR;
  req.session.lastNameAuth = `${user.PATERNO || ''} ${user.MATERNO || user.APELLIDOPROFESOR || ''}`;
  Object.assign(req.session, additionalData);
};

// Función para manejar errores con mensajes y logs
const handleError = (req, res, errorMessage, logMessage = "", redirectPath = "/login") => {
  if (logMessage) console.error(logMessage);
  req.flash('msj_error', errorMessage);
  res.redirect(redirectPath);
};

// Vista de login
AuthController.login = (req, res) => res.render("auth/login");

// Alumno
AuthController.authAlumno = async (req = request, res = response) => {
  const { user, password } = req.body;
  try {
    const alumno = await Alumno.findById(user);
    if (!alumno)
      return handleError(req, res, 'No se encontró ninguna cuenta de alumno con la matrícula ingresada.', `Alumno ${user} no existe`);

    if (alumno.STATUS.trim() === "S")
      return handleError(req, res, 'Este folio pertenece a un aspirante. Por favor verifica tus datos.');

    if (!alumno.ALUMNO_PASSWORD?.trim())
      return handleError(req, res, 'Este alumno aún no tiene una contraseña asignada. Contacta a control escolar.');

    if (password !== alumno.ALUMNO_PASSWORD)
      return handleError(req, res, 'La contraseña proporcionada no coincide con la registrada.');

    setSession(req, alumno, 'isAlumno');
    res.redirect('/');
  } catch (error) {
    handleError(req, res, 'No fue posible procesar la solicitud en este momento. Intenta de nuevo más tarde.', `Error en authAlumno: ${error}`);
  }
};

// Aspirante
AuthController.authAspirante = async (req = request, res = response) => {
  const { user } = req.body;
  try {
    if (!user || isNaN(user.trim()))
      return handleError(req, res, 'Por favor ingresa un folio válido (solo números).');

    const aspirante = await Aspirante.findById(user.trim());
    if (!aspirante)
      return handleError(req, res, 'No se encontró ningún aspirante con el folio ingresado.');

    if (aspirante.STATUS.trim() !== "S")
      return handleError(req, res, 'Este folio ya no está habilitado para ingresar.');

    req.session.regenerate((err) => {
      if (err) return handleError(req, res, 'Ocurrió un error al iniciar sesión. Inténtalo otra vez.');
      setSession(req, aspirante, 'isAspirante');
      res.redirect('/');
    });

  } catch (error) {
    handleError(req, res, 'No se pudo completar la autenticación en este momento.', `Error en authAspirante: ${error}`);
  }
};


// Profesor
AuthController.authProfe = async (req = request, res = response) => {
  const { user, password } = req.body;
  try {
    const profesor = await ProfeAuth.findById(user);
    if (!profesor)
      return handleError(req, res, 'La clave del profesor no fue localizada en el sistema.', `Profesor ${user} no existe`);

    if (!profesor.PASSWORD?.trim())
      return handleError(req, res, 'El profesor no tiene contraseña asignada. Solicítala en dirección académica.');

    if (password !== profesor.PASSWORD)
      return handleError(req, res, 'Contraseña incorrecta para el profesor. Verifica e intenta de nuevo.');

    setSession(req, profesor, 'isProfe');
    res.redirect('/');
  } catch (error) {
    handleError(req, res, 'No se pudo completar el inicio de sesión del profesor.', `Error en authProfe: ${error}`);
  }
};

// Administrador
AuthController.authAdmin = async (req = request, res = response) => {
  const { user, password } = req.body;
  try {
    const userData = await Usuarios.findById(user);
    if (!userData)
      return handleError(req, res, 'No existe una cuenta con ese usuario.', `Usuario ${user} no existe`);

    if (userData.ADMINISTRADOR.trim() === "N")
      return handleError(req, res, 'Este usuario no cuenta con permisos de administrador.');

    setSession(req, userData, 'isAdmin');
    res.redirect('/');
  } catch (error) {
    handleError(req, res, 'No se pudo iniciar sesión como administrador. Intenta más tarde.', `Error en authAdmin: ${error}`);
  }
};

// Logout
AuthController.logout = (req = request, res = response) => {
  req.session.destroy();
  res.redirect("/login");
};

module.exports = { AuthController };
