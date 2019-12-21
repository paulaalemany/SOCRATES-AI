const mysql = require('mysql');
const config = require('./config.json');
const conec = 0; // 0 es la externa y 1 es la de amazon.
var contra = '1234';

var dbPool  = mysql.createPool(config[conec]
);

/**
 * Lanza la querry especificada y retorna el resultado en el callback.
 * @param {String} query 
 * @param {Function} callback 
 */
function query(query,callback = function(){}){
  dbPool.getConnection(function(error,db) {
    if (error) {
      console.error('Error en la conexión para ' + query);
      throw error;
    }
    db.query(query, function (error, results) {
      if(error) {
        console.error("Error en la consulta para: "+query);
        throw error; 
      }
      if(db.state == "connected"){
        db.release();}
      callback(results);
    });
    if(db.state == "connected"){
      db.release();}
  });
}


var sql = `CREATE TABLE IF NOT EXISTS historial (kpi VARCHAR(55) NOT NULL, country VARCHAR(55), month VARCHAR(55),  year INT , tmp TIMESTAMP)`;
query(sql,function(){});

sql = `CREATE TABLE IF NOT EXISTS relaciones (kpiA VARCHAR(55) NOT NULL, countryA VARCHAR(55), monthA VARCHAR(55),
  yearA INT ,kpiB VARCHAR(55) NOT NULL, countryB VARCHAR(55), monthB VARCHAR(55), yearB INT , str INT);`;
query(sql,function(){console.log("Conectado a la base de datos.");});


/**
 * Función que compara las etiquetas acabadas en A y B comparando sus valores y devolviendo si son diferentes.
 * @param {JSON} object Objecto que contiene etiquetas A y B.
 */
function pairCheck(object, callback)
{
  var ob = Object.entries(object);
  var wasTrue = false;
  ob.forEach(rowi => {
    ob.forEach(rowj => {
      if(rowi[0].slice(0,-1) == rowj[0].slice(0,-1))
      {
        var a = rowi[1];
        var b = rowj[1];
        //console.log(a + " " + b);
        var va1 = (a != b);
        var va2 = !(a == null && b == null);
        if(va2)
        {
          if(va1)
          {
            //console.log("True for "+rowi[0].slice(0,-1)+":"+a+" != "+b); //DEBUG Eliminar
            wasTrue = true;
          }
        }
      }
    });
  });
  callback(wasTrue,object);
}

/**
 * Parse el objeto Object para convertirlo en una cadena escapada de caracteres lista para usarse en un WHERE Mysql.
 * @param {JSON} object Objecto a convertir en cadena.
 * @param {String} conector Conector opcional, por defecto AND.
 */
function prepareForWHERE(object,conector = "AND") 
{
  var result = new String();
  Object.entries(object).forEach(row => {
    if(row[0] != "str")
    {
      if(row[1] == null)
        result += row[0] + " IS NULL "+conector+" ";
      else
        result += row[0] + " = " + mysql.escape(row[1]) + " "+conector+" ";
    }
  });
  return result.slice(0,-4);
}

module.exports = {
  /**
   * Agrega una nueva KPI al sistema con sus dimensiones y mantiene actualizadas sus relaciones.
   * @param {JSON} values Valores que insertará, ha de ser un objeto con al menos un atributo kpi, opcionalmente country, month y year u otros.
   */
  addNewKPI: function (values) {
      //Agrego al historial
      values.tmp = new Date();
      query('INSERT INTO historial SET '+mysql.escape(values)+';',function(){});

      //Actualizo relaciones
      var date = values.tmp;
      var date2 = new Date(date);
      date2.setHours(date.getHours()-1);
      newData = {
        kpiB: values.kpi,
        countryB: values.country,
        monthB: values.month,
        yearB: values.year,
        str: 1
      };
      
      query("SELECT kpi, country, month ,  year , count(*) AS repetits FROM historial WHERE tmp < "+mysql.escape(date)+" AND "+mysql.escape(date2)+" < tmp GROUP BY kpi, country, month , year;",function(results) {
        results.forEach(row => {
          newRow =  {
            kpiA: row.kpi,
            countryA: row.country,
            monthA: row.month,
            yearA: row.year
          };
          var chekRow = newRow;
          Object.assign(chekRow,newData); 
          pairCheck(chekRow,function(check,testedRow){
            if(check)
            {
              query("SELECT str FROM relaciones WHERE "+prepareForWHERE(testedRow)+";",function(results2){
                if(results2.length == 0)
                {
                  testedRow.str = row.repetits;
                  query("INSERT INTO relaciones SET "+mysql.escape(testedRow)+";");
                }
                else
                {
                  var stre = results2[0].str + row.repetits;
                  query("UPDATE relaciones SET str = "+ stre +" WHERE "+prepareForWHERE(testedRow)+";");
                }
              });
            }
          });
         });
      });
  },
  /**
   * Resetea las tablas de la base de datos si la contraseña es la correcta.
   * @param {String} paswd Contraseña para resetear las tablas
   */
  resetTable: function (paswd) {
    if(paswd == contra)
    {
        query('TRUNCATE FROM historial;');
        query('TRUNCATE FROM relaciones;');
    }
  },

  /**
   * Devuelve las sugerencias en un json ordenado por fuerza para los valores pasados.
   * @param {JSON} values 
   * @param {Function} callback 
   */
  getSug: function (values,callback){
    query("SELECT kpiB AS kpi, countryB AS country,monthB AS month, yearB AS year, str FROM relaciones WHERE "+prepareForWHERE(values)+" ORDER BY str DESC;",callback);
  },

  /**
   * Función syncrona que invoca el historial de una hora anterior a partir de una fecha. Usar como getHist(date, function(result){ CONTENIDO DE LA FUNCIóN });
   * @param {Date} date Integer, fecha limite a la que filtrar los datos o -1 para usar la fecha actual.
   * @param {Function} callback Función de callback sobre la que retornar el resultado.
   */
  getHist: function(date = -1, callback){
    if(date == -1){date = new Date();}
    else{date = new Date(date);}
    var date2 = new Date(date);
    date2.setHours(date.getHours()-1);
      query("SELECT * FROM historial WHERE tmp < "+mysql.escape(date)+" AND "+mysql.escape(date2)+" < tmp;",function(results) {
        callback(results);
      });

  }
}
