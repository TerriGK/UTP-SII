// middlewares/globals.js

const globals = (req, res, next) => {
  res.locals.msj_error = req.flash("msj_error");
  res.locals.msj_good = req.flash("msj_good");

  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.IDAuth = req.session.IDAuth;
  res.locals.nameAuth = req.session.nameAuth;
  res.locals.lastNameAuth = req.session.lastNameAuth;
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.isAlumno = req.session.isAlumno;
  res.locals.isProfe = req.session.isProfe;
  res.locals.isAspirante = req.session.isAspirante;

  next();
};

module.exports = globals;
