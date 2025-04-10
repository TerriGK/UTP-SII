const express = require("express");
const router = express.Router();
// Controladores
const {AlumnosController} = require("../app/controllers");
const {EstadiaController} = require("../app/controllers/EstadiaController");
const {TitulacionController} = require("../app/controllers/TitulacionController");
const PDFController = require("../app/controllers/PdfController");
const { ReinscripcionController } = require("../app/controllers");
const { GrupController,  } = require("../app/controllers");
const { GrupaluController } = require("../app/controllers");

const fileUpload = require('express-fileupload');

// Siempre poner este middleware al crear una ruta get
const { isAspirante } = require("../app/middlewares/session");
const {
  GruposCtr,
  CuatrisCtr,
  NivelesCtr,
  AlumnosAdminCtr,
  CalifiCtr,
  PlanesCtr,
  ProfeCtr,

} = require("../app/controllers");



//ruta del aspirante
router.get("/aspirantedoctos", isAspirante, AlumnosController.doctosAspirante);
router.get("/aspirantedoctos/:idDocto", AlumnosController.showDocto);

// router.get("/aspirante", isAspirante, AlumnosController.showByIdAspirates);

router.get("/contactar", (req, res) => res.render("others/contacto-screen"));
// Aspirante-screen
router.get("/aspirante", AlumnosAdminCtr.showByIdAspirante);
router.post("/Alumnos/:id/update", AlumnosAdminCtr.updateAspirante);
router.post("/Alumnos/:id/updatePhoto", AlumnosAdminCtr.updatePhotoAspirante);
router.get("/Alumnos/:id/doctos", AlumnosAdminCtr.doctosAspirante);
router.get("/Alumnos/:id/boletas", AlumnosAdminCtr.boletasAspirante);


module.exports = router;
