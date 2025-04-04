const { request, response } = require("express");
const { Alumno, ProfeAuth, Aspirante, Usuarios } = require("../models");
const bcrypt = require('bcrypt');

const AuthController = {};

const setSession = (req, user, role, additionalData = {}) => {
  req.session.isAuthenticated = true;
  req.session[role] = true;
  req.session.IDAuth = user.MATRICULA || user.NUMEROALUMNO || user.CLAVEPROFESOR || user.EMAIL;
  req.session.nameAuth = user.NOMBRE || user.NOMBREPROFESOR;
  req.session.lastNameAuth = `${user.PATERNO || ''} ${user.MATERNO || user.APELLIDOPROFESOR || ''}`;
  Object.assign(req.session, additionalData);
};

const handleError = (req, res, errorMessage, logMessage = "") => {
  if (logMessage) console.error(logMessage);
  req.flash('msj_error', errorMessage);
  res.redirect('/login');
};

AuthController.login = (req, res) => res.render("auth/login");

AuthController.authAlumno = async (req = request, res = response) => {
  const { user, password } = req.body;
  try {
    const alumno = await Alumno.findById(user);
    if (!alumno) return handleError(req, res, 'Alumno no encontrado', `Error: Alumno ${user} no existe`);
    if (alumno.STATUS.trim() === "S") return handleError(req, res, 'No pueden ingresar los aspirantes');
    if (!alumno.ALUMNO_PASSWORD?.trim()) return handleError(req, res, 'El alumno no tiene una contraseña registrada');
    if (password !== alumno.ALUMNO_PASSWORD) return handleError(req, res, 'Contraseña incorrecta');
    
    setSession(req, alumno, 'isAlumno');
    res.redirect('/');
  } catch (error) {
    handleError(req, res, 'Hubo un problema al procesar su solicitud', `Error en authAlumno: ${error}`);
  }
};

AuthController.authAspirante = async (req = request, res = response) => {
  const { user } = req.body;
  try {
    if (!user || isNaN(user.trim())) return handleError(req, res, 'El folio debe ser un número válido');
    const aspirante = await Aspirante.findById(user.trim());
    if (!aspirante) return handleError(req, res, 'Folio de aspirante no encontrado');
    if (aspirante.STATUS.trim() !== "S") return handleError(req, res, 'Ya no puede ingresar con el folio proporcionado');

    req.session.regenerate((err) => {
      if (err) return handleError(req, res, 'Error al iniciar sesión');
      setSession(req, aspirante, 'isAspirante');
      res.redirect('/');
    });
  } catch (error) {
    handleError(req, res, 'Hubo un problema al procesar su solicitud', `Error en authAspirante: ${error}`);
  }
};

AuthController.authProfe = async (req = request, res = response) => {
  const { user, password } = req.body;
  try {
    const profesor = await ProfeAuth.findById(user);
    if (!profesor) return handleError(req, res, 'Profesor no encontrado', `Error: Profesor ${user} no existe`);
    if (!profesor.PASSWORD?.trim()) return handleError(req, res, 'El profesor no tiene una contraseña registrada');
    if (password !== profesor.PASSWORD) return handleError(req, res, 'Contraseña incorrecta');

    setSession(req, profesor, 'isProfe');
    res.redirect('/');
  } catch (error) {
    handleError(req, res, 'Hubo un problema al procesar su solicitud', `Error en authProfe: ${error}`);
  }
};

AuthController.authAdmin = async (req = request, res = response) => {
  const { user, password } = req.body;
  try {
    const userData = await Usuarios.findById(user);
    if (!userData) return handleError(req, res, 'Usuario no encontrado', `Error: Usuario ${user} no existe`);
    if (userData.ADMINISTRADOR.trim() === "N") return handleError(req, res, 'El usuario no es administrador');

    setSession(req, userData, 'isAdmin');
    res.redirect('/');
  } catch (error) {
    handleError(req, res, 'Hubo un problema al procesar su solicitud', `Error en authAdmin: ${error}`);
  }
};

AuthController.logout = (req = request, res = response) => {
  req.session.destroy();
  res.redirect("/login");
};

module.exports = { AuthController };
