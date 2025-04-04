const { request, response } = require("express");
const { Alumno } = require("../models");

const firebird = require("node-firebird");
const options = require("../../configs/credential-firebird");

const AlumnosAdminCtr = {};

AlumnosAdminCtr.createView = (req, res) => {
  res.render("admin/alumnos/alumnos/alumnos-crear");
};

AlumnosAdminCtr.show = (req, res) => {
  const { search } = req.query;
  res.render("admin/alumnos/alumnos/alumnos-lista", { search });
};

AlumnosAdminCtr.showDocto = async (req, res) => {
  const { id, idDocto } = req.params;
  const alumno = await Alumno.findById(id);

  firebird.attach(options, function (err, db) {
    if (err) throw err;

    db.query(
      `select documento from doctos 
        where clave = '${alumno.NUMEROALUMNO}' AND id_docto = '${idDocto}'`,
      (err, row) => {
        if (err) throw err;

        let docto = row[0]?.DOCUMENTO;

        if (docto) {
          docto(function (err, _name, e) {
            let chunks = [];
            e.on("data", (chunk) => {
              chunks.push(chunk);
            });

            e.on("end", () => {
              let buffer = Buffer.concat(chunks);

              res.contentType("application/pdf");
              res.send(buffer);
              db.detach();
            });
          });
        } else {
          // res.redirect(`/alumnos/${id}/doctos`);
          res.send("No hay documento");
        }
      }
    );
  });
};

AlumnosAdminCtr.showById = async (req = request, res = response) => {
  const alumno = await Alumno.findById(req.params.id);
  let image = "data:image/jpeg;base64, ";

  firebird.attach(options, function (err, db) {
    if (err) throw err;

    db.query(
      `select fotografia from alumnos where matricula = '${alumno?.MATRICULA}'`,
      (err, row) => {
        if (err) throw err;

        let foto = row[0]?.FOTOGRAFIA;
        if (foto) {
          foto(function (err, _name, e) {
            if (err) throw err;

            let chunks = [];
            e.on("data", (chunk) => {
              chunks.push(chunk);
            });

            e.on("end", () => {
              let buffer = Buffer.concat(chunks);
              image += buffer.toString("base64");

              let newAlumno = {
                ...alumno,
                image,
              };

              res.render("admin/alumnos/alumnos/alumno-id", newAlumno);

              db.detach();
            });
          });
        } else {
          res.render("admin/alumnos/alumnos/alumno-id", alumno);
        }
      }
    );
  });
};

AlumnosAdminCtr.update = async (req = request, res = response) => {
  const body = req.body;

  const data = {
    paterno: body?.paterno,
    materno: body?.materno,
    nombre: body?.nombre,
    genero: body?.genero,
    fecha_nacimiento: body?.fecha_nacimiento,
    estado_nacimiento: body?.estado_nacimiento,
    lugar_nacimiento: body?.municipio_naci,
    nacionalidad: body?.nacionalidad,
    clave_ciudadana: body?.curp,
    domicilio: body?.domicilio,
    entre_calles: body?.cruzamientos,
    estado: body?.estado,
    cp: body?.postal,
    email: body?.email_personal,
    email_alterno: body?.email_insti,
    celular: body?.tel_cel,
    telefono: body?.tel_domicilio,
    nivel: body?.nivel,
    grado: body?.grado,
    matricula: body?.matricula,
    observaciones: body?.nota,
    proyecto_obs: body?.proyecto_obs,
    obs_proyecto_lic: body?.obs_proyecto_lic,



    //Estadisticos

    BECA: body?.BECA,
    PESO_KG: body?.PESO_KG,
    talla: body?.talla,
    contacto: body?.contacto,
    PARENTESCO_CONTACTO: body?.PARENTESCO_CONTACTO,
    tel_contacto: body?.tel_contacto,
    tipo_seg_med: body?.tipo_seg_med,
    num_imss: body?.num_imss,
    num_imss_verificador: body?.num_imss_verificador,
    lenguaindigena: body?.lenguaindigena,
    discapacidad: body?.discapacidad,
    ENFERNEDAD: body?.ENFERNEDAD,
    alergias: body?.alergias,
    nombrepadre: body?.nombrepadre,
    nombremadre: body?.nombremadre,
    escolaridadpadre: body?.escolaridadpadre,
    escolaridadmadre: body?.escolaridadmadre,
    actividadpadre: body?.actividadpadre,
    actividadmadre: body?.actividadmadre,
    automovilfamiliar: body?.automovilfamiliar,
    computadora: body?.computadora,
    tamanocasa: body?.tamanocasa,
    infresofamiliar: body?.infresofamiliar,
    personasdependeningreso: body?.personasdependeningreso,
    vivenencasa: body?.vivenencasa,
    hermanos: body?.hermanos,

    lugarnacimiento: body?.lugarnacimiento,
    hermanosestudian: body?.hermanosestudian,
    trabajas: body?.trabajas,
    ACTIVIDADTRABAJAS: body?.ACTIVIDADTRABAJAS,
    horariotrabajo: body?.horariotrabajo,
    estadocivil: body?.estadocivil,
    nombreconyuge: body?.nombreconyuge,
    escolaridadconyuge: body?.escolaridadconyuge,
    actividadconyuge: body?.escolaridadconyuge,
    hijos0a5: body?.hijos0a5,

    //BACHILLERATO--->

    ESCUELA_PROCEDENCIA: body?.ESCUELA_PROCEDENCIA,
    ESTADO_ESCOLARIDAD: body?.ESTADO_ESCOLARIDAD,

    //LICENCIATURA
    INICIO_BACH: body?.INICIO_BACH,
    FIN_BACH: body?.FIN_BACH,


    //TSU Titulacion

    inicio_egreso: body?.inicio_egreso,
    folio_titulacion: body?.folio_titulacion,
    fecha_tramite: body?.fecha_tramite,
    titulacion_an: body?.titulacion_an,
    titulacion_cb: body?.titulacion_cb,
    titulacion_na: body?.titulacion_na,
    titulacion_cle: body?.titulacion_cle,
    titulacion_cai: body?.titulacion_cai,
    titulacion_curp: body?.titulacion_curp,
    titulacion_fotos: body?.titulacion_fotos,
    titulacion_pago: body?.titulacion_pago,
    titulacion_foliopago: body?.titulacion_foliopago,
    empresa: body?.empresa,
    empresa_nr: body?.empresa_nr,
    asesor_empresarial: body?.asesor_empresarial,
    asesor_empresarial_int: body?.asesor_empresarial_int,
    estadia_inicio: body?.estadia_inicio,
    estadia_termino: body?.estadia_termino,
    carta_liberacion_emision: body?.carta_liberacion_emision,


    //Folios LIC
    folio_cerlic: body?.folio_cerlic,
    libro_cerlic: body?.libro_cerlic,
    foja_cerlic: body?.foja_cerlic,

    folio_aexlic: body?.folio_aexlic,
    libro_aexlic: body?.libro_aexlic,
    foja_aexlic: body?.foja_aexlic,

    folio_csslic: body?.folio_csslic,
    libro_csslic: body?.libro_csslic,
    foja_csslic: body?.foja_csslic,

    folio_titlic: body?.folio_titlic,
    libro_titlic: body?.libro_titlic,
    foja_titlic: body?.foja_titlic,

    //Folios TSU
    folio_certificado_tsu: body?.folio_certificado_tsu,
    libro_certificado_tsu: body?.libro_certificado_tsu,
    fojas_certificado_tsu: body?.fojas_certificado_tsu,

    folio_titulo_tsu: body?.folio_titulo_tsu,
    libro_titulo_tsu: body?.libro_titulo_tsu,
    fojas_titulo_tsu: body?.fojas_titulo_tsu,

    folio_css: body?.folio_css,
    libro_css: body?.libro_css,
    fojas_css: body?.fojas_css,

    folio_cex: body?.folio_cex,
    libro_cex: body?.libro_cex,
    fojas_cex: body?.fojas_cex,

    // FORMATO DE TITULACION LIC 
    fecha_tramite_lic: body?.fecha_tramite_lic,
    tit_lic_an: body?.tit_lic_an,
    tit_lic_cb: body?.tic_lic_cb,
    no_adeudo_lic: body?.no_adeudo_lic,
    liberacion_lic: body?.liberacion_lic,
    autorizacion_imp_lic: body?.autorizacion_imp_lic,
    curp_lic: body?.curp_lic,
    fotografias_lic: body?.fotografias_lic,
    pago_titulacion_lic: body?.pago_titulacion_lic,
    FOLIO_PAGO_TIT_LIC: body?.FOLIO_PAGO_TIT_LIC,
    cedula_tsu: body?.cedula_tsu,
    EMPRESA_ESTADIA_LIC: body?.EMPRESA_ESTADIA_LIC,
    asesor_empresarial_lic: body?.asesor_empresarial_lic,
    fecha_inicio_est_lic: body?.fecha_inicio_est_lic,
    FECHA_FIN_EST_LIC: body?.FECHA_FIN_EST_LIC,
    fecha_liberacion_est_lic: body?.fecha_liberacion_est_lic,
    fecha_autorizacion_lic: body?.fecha_autorizacion_lic,
    asesor_acad_lic: body?.asesor_acad_lic,
    fin_tramite_lic: body?.fin_tramite_lic,
    folio_titulacion_lic: body?.folio_titulacion_lic,

    // Estatus de datos--->:%
    ESTATUS_DOCTOS_TSU: body?.ESTATUS_DOCTOS_TSU,
    CARRERACOMPLETO: body?.CARRERACOMPLETO,
    ESTATUS_DOCTOS_TSU_FECHA: body?.ESTATUS_DOCTOS_TSU_FECHA,
    NIVELCOMPLETO: body?.NIVELCOMPLETO,
    NUM_CEDULA_TSU: body?.NUM_CEDULA_TSU,
    NUM_CEDULA_LIC: body?.NUM_CEDULA_LIC,

  };

  await Alumno.findByIdAndUpdate(body?.matricula, data);

  res.redirect(`/alumnos/${body?.matricula}`);
};

AlumnosAdminCtr.updatePhoto = async (req = request, res = response) => {
  let id = req.params.id;

  if (req.files?.fotografia) {
    await Alumno.findByIdAndUpdate(id, {
      fotografia: req.files.fotografia.data,
    });
    res.redirect(`/alumnos/${id}`);
  } else {
    res.redirect(`/alumnos/${id}`);
  }
};

AlumnosAdminCtr.doctos = async (req = request, res = response) => {
  const alumno = await Alumno.findById(req.params.id);
  res.render("alumno/documentos/doctos-screen", {
    numeroalumno: alumno?.NUMEROALUMNO,
    nombre: alumno?.NOMBRE,
  });
};

AlumnosAdminCtr.boletas = async (req, res) => {
  const alumno = await Alumno.findById(req.params.id);
  res.render("alumno/boletas/boletas-screen", alumno);
};



module.exports = {
  AlumnosAdminCtr,
};
