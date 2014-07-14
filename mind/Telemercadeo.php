<?php
if (!defined('verificacion_entrada') || !verificacion_entrada) die('No es un punto de acceso vlido');

require_once 'controlador/BDControlador.php';
require_once 'clases/Campania/Campania.php';

class Telemercadeo extends BDControlador {

	var $id;
	var $campania_id;
	var $etapa_id;
	var $base_id;
	var $consumidor_id;
	var $causal_tmk_id;
	var $usuario_id;
	var $fecha_telemercadeo;
	var $gestiones;
	var $prioridad;
	var $telefono_gestion;
	var $observaciones;
	var $activo;

	var $nombre_tabla = "telemercadeo";
	var $directorio_modulo = 'Telemercadeo';

	var $campos = array('id','campania_id','etapa_id','base_id','consumidor_id','causal_tmk_id','usuario_id','fecha_telemercadeo',
						'gestiones','prioridad','telefono_gestion','observaciones','activo');

	function _construct() {
		parent :: Manejador_BD();
	}

	public function obtenerRegistroBarridoInicial($campania_id, $etapa_id, $base_id){
		if($campania_id && $etapa_id && $base_id){
			$sql =	"SELECT 
						telemercadeo.id 
					FROM 
						telemercadeo 
						LEFT JOIN ocupacion ON(ocupacion.telemercadeo_id = telemercadeo.`id`)
					WHERE 
						telemercadeo.`campania_id` = {$campania_id} 
						AND telemercadeo.`etapa_id` = {$etapa_id} 
						AND telemercadeo.`base_id` = {$base_id}
						AND telemercadeo.`causal_tmk_id` IS NULL
						AND ocupacion.telemercadeo_id IS NULL
						AND telemercadeo.activo = 1
					ORDER BY
						telemercadeo.`prioridad` DESC";
			//__P($sql,1);
			return $GLOBALS['db_cliente']->GetOne($sql);
		}
	}
	
	public function obtenerRegistroBarridoPosterior($campania_id, $etapa_id, $base_id){
		if($campania_id && $etapa_id && $base_id){
			$sql =	"SELECT 
						telemercadeo.id 
					FROM 
						telemercadeo
						INNER JOIN causal_tmk ON(telemercadeo.`causal_tmk_id` = causal_tmk.`id`)
						INNER JOIN campania_causal ON(campania_causal.`campania_id` = telemercadeo.`campania_id` 
						AND telemercadeo.`etapa_id` = campania_causal.`etapa_id` AND causal_tmk.`id` = campania_causal.`causal_tmk_id`)
						LEFT JOIN ocupacion ON(ocupacion.telemercadeo_id = telemercadeo.`id`)
					WHERE 
						telemercadeo.`campania_id` = {$campania_id} 
						AND telemercadeo.`etapa_id` = {$etapa_id} 
						AND telemercadeo.`base_id` = {$base_id}
						AND ocupacion.telemercadeo_id IS NULL
						AND campania_causal.`definitiva` = 0
						AND telemercadeo.activo = 1
					ORDER BY
						telemercadeo.`prioridad` DESC,
						telemercadeo.`fecha_telemercadeo` ASC";
			return $GLOBALS['db_cliente']->GetOne($sql);
		}
	}
	
	public function obtenerDatosCampaniaEtapa($campania_id, $etapa_id){
		if($campania_id && $etapa_id){
			$sql =	"SELECT 
						id AS campania_etapa_id, 
						tiempo_gestion_registro, 
						administrar_telefonos, 
						administrar_direcciones,
						historial_telemercadeo, 
						administrar_emails
					FROM 
						campania_etapa
					WHERE 
						campania_id = {$campania_id} AND etapa_id = {$etapa_id}
						AND activo = 1 ";
			$resultado = $GLOBALS['db_cliente']->Execute($sql);
			return $resultado->FetchRow();
		}
	}
	
	public function obtenerNombreGuion($campania_id, $etapa_id, $base_id){
		if($campania_id && $etapa_id && $base_id){
			$sql =	"SELECT 
						nombre
					FROM 
						guion
					WHERE
						campania_id = {$campania_id}
						AND etapa_id = {$etapa_id}
						AND base_id = {$base_id}
						AND activo = 1";
			return $GLOBALS['db_cliente']->GetOne($sql);
		}
	}
	
	public function actualizarCampaniaCampo($tabla, $campo, $valor, $condicion){
		if($tabla && $campo && $condicion){
			if($valor){
				$update = "UPDATE {$tabla} SET {$campo} = '{$valor}' WHERE {$condicion}";
				return $GLOBALS['db_cliente']->Execute($update);
			}else
				return true;
		}
	}
	
	public function buscarRegistrosTelemercadeo ($campania_id, $etapa_id, $where=""){
		
		if($campania_id && $etapa_id){
			
			$campania = new Campania();
			$campania->recuperar($campania_id);
			
			$sql =	"SELECT 
						t.id AS telemercadeo_id,
						t.`base_id`,
						(SELECT nombre FROM base WHERE base.`id` = t.`base_id`) AS base,
						t.`etapa_id`,
						(SELECT nombre FROM etapa WHERE etapa.`id` = t.`etapa_id`) AS etapa,
						t.`fecha_telemercadeo`,
						v.`causal_id`,
						c.nombre_completo,
						IF(c.no_documento_v > 0, c.no_documento_v, c.no_documento ) AS no_documento ,
						v.`grupo_causal`,
						v.`causal`,
						t.`consumidor_id`,
						t.`campania_id`,
						t.`usuario_id`,
						t.`causal_tmk_id`,
						t.`telefono_gestion`
					FROM 
						telemercadeo t INNER JOIN {$campania->tabla_base} b 
						ON(t.`campania_id` = b.`campania_id` AND t.`base_id` = b.`base_id` AND t.`consumidor_id` = b.`consumidor_id`)
						INNER JOIN consumidor c ON(c.`id` = t.`consumidor_id`)
						LEFT JOIN v_causales v ON(t.`campania_id` = v.`campania_id` AND t.`etapa_id` = v.`etapa_id` AND t.`causal_tmk_id` = v.`causal_id`)
					WHERE
						t.`campania_id` = {$campania_id} AND t.`etapa_id` = {$etapa_id} AND t.`activo` = 1
						{$where}
					ORDER BY
						t.`id`";
			//__P($sql,1);
			$resultado = $GLOBALS['db_cliente']->Execute($sql);
			return $resultado->GetArray();
		}
	}
	
	public function buscarRegistroTelemercadeo($campania_id, $etapa_id, $base_id, $consumidor_id){
		if($campania_id && $etapa_id && $base_id && $consumidor_id){
			
			$sql =	"SELECT
						id
					FROM
						telemercadeo
					WHERE
						campania_id = {$campania_id}
						AND etapa_id = {$etapa_id}
						AND base_id = {$base_id}
						AND consumidor_id = {$consumidor_id}";
			//__P($sql,1);
			return $GLOBALS['db_cliente']->GetOne($sql);
		}
	}
	
	public function limpiarGestionTelemercadeo($telemercadeo_id){
		if($telemercadeo_id > 0){
			$update =	"UPDATE telemercadeo 
						SET causal_tmk_id = NULL, fecha_telemercadeo = NULL, usuario_id = NULL,
						telefono_gestion = NULL, observaciones = NULL
						WHERE id = {$telemercadeo_id}";
			//__P($sql,1);
			$resultado = $GLOBALS['db_cliente']->Execute($update);
		}
		
	}
	
	public function insertarRegistro($campania_id, $etapa_id, $base_id, $consumidor_id){
		if($campania_id > 0 && $etapa_id > 0 && $base_id > 0 && $consumidor_id > 0){
			
			$insert =	"INSERT INTO telemercadeo 
						SET campania_id = '{$campania_id}', etapa_id = '{$etapa_id}', 
						base_id = '{$base_id}', consumidor_id = '{$consumidor_id}' ";
			//__P($insert,1);
			$resultado = $GLOBALS['db_cliente']->Execute($insert);
		}
		
	}
	
	public function actualizarMasivoPrioridad($prioridad, $telemercadeos){
		$update =	"UPDATE telemercadeo
					SET prioridad = '{$prioridad}'
					WHERE id IN({$telemercadeos})";
		
		$resultado = $GLOBALS['db_cliente']->Execute($update);
	}
	
	public function obtenerRegistrosParaGestion($campania_id, $etapa_id, $base_id){
		
		$sql =	"SELECT 
					t.`id` AS telemercadeo_id,
					t.`consumidor_id`,
					t.`fecha_telemercadeo`,
					t.`usuario_id`,
					v.`grupo_causal`,
					v.`causal`,
					c.`no_documento`,
					c.`registro_basico`,
					t.`observaciones` 
				FROM 
					telemercadeo t LEFT JOIN v_causales v 
					ON(t.`campania_id` = v.`campania_id` AND t.`etapa_id` = v.`etapa_id` AND t.`causal_tmk_id` = v.`causal_id`)
					INNER JOIN consumidor c ON(c.`id` = t.`consumidor_id`)
				WHERE
					t.`campania_id` = {$campania_id} 
					AND t.`etapa_id` = {$etapa_id} 
					AND t.`base_id` = {$base_id}
					AND t.`activo` = 1
					AND (v.`causal_id` IS NULL OR v.`definitiva` = 0)
				ORDER BY
					t.`fecha_telemercadeo`";
		
		//__P($sql,1);
		$resultado = $GLOBALS['db_cliente']->Execute($sql);
		return $resultado->GetArray();
	}
	
	public function buscarGestionRegistros ($campania_id, $where=""){
	
		if($campania_id > 0){
				
			$campania = new Campania();
			$campania->recuperar($campania_id);
				
			$sql =	"SELECT
						t.id AS telemercadeo_id,
						t.`base_id`,
						(SELECT nombre FROM base WHERE base.`id` = t.`base_id`) AS base,
						t.`etapa_id`,
						(SELECT nombre FROM etapa WHERE etapa.`id` = t.`etapa_id`) AS etapa,
						t.`fecha_telemercadeo`,
						c.nombre_completo,
						IF(c.no_documento_v > 0, c.no_documento_v, c.no_documento ) AS no_documento ,
						c.`registro_basico`,
						t.`consumidor_id`,
						t.`campania_id`,
						t.`usuario_id`,
						t.`causal_tmk_id`,
						t.`telefono_gestion`,
						kg.`nombre` AS grupo_causal,
						k.`nombre` AS causal,
						(SELECT causal_auditoria_id FROM auditoria WHERE auditoria.`telemercadeo_id` = t.`id`  AND auditoria.`activo`= 1) AS causal_auditoria_id,
						(SELECT nombre FROM auditoria_causal WHERE auditoria_causal.`id` = causal_auditoria_id  AND auditoria_causal.`campania_id` = t.`campania_id`) AS causal_definitiva,						
						(SELECT GROUP_CONCAT(telefono.`numero`) FROM telefono 
						WHERE telefono.`consumidor_id` = t.`consumidor_id` ) telefonos
					FROM
						telemercadeo t 	
						INNER JOIN causal_tmk k ON(k.`id` = t.`causal_tmk_id`)
						INNER JOIN causal_tmk kg ON(kg.`id` = k.`grupo_causal_id`)
						INNER JOIN consumidor c ON(c.`id` = t.`consumidor_id`)
					WHERE
						t.`campania_id` = {$campania_id} AND t.`activo` = 1  {$where}
					ORDER BY
						t.`fecha_telemercadeo`";
			//__P($sql,1);
			$resultado = $GLOBALS['db_cliente']->Execute($sql);
			return $resultado->GetArray();
		}
	}
	
	public function  verificarRegistroRecuperacion($base_id, $consumidor, $etapa){
		$sql = "SELECT id FROM telemercadeo WHERE base_id = {$base_id} AND etapa_id = {$etapa} AND consumidor_id = {$consumidor}";
		
		$resultado = $GLOBALS['db_cliente']->GetOne($sql);
		return $resultado;
	}
	
	public function obtenerRegistrosRecuperacion($campania_id, $etapa_id, $usuario){
		$sql = "SELECT
					t.id AS 'tmk', t.consumidor_id, b.nombre AS 'base', t.base_id, t.campania_id,
					c.nombre_completo,v.grupo_causal,v.causal
				FROM
					telemercadeo t
					LEFT JOIN v_causales v ON(
						v.campania_id = t.campania_id AND v.etapa_id = t.etapa_id	AND v.causal_id = t.causal_tmk_id)
					INNER JOIN consumidor c ON(c.id = t.consumidor_id)
					INNER JOIN base b ON(b.id = t.base_id)
				WHERE
					t.campania_id  = {$campania_id} AND t.etapa_id = {$etapa_id} AND t.usuario_id = {$usuario} AND (v.grupo_causal_id NOT IN (5,6) OR t.causal_tmk_id IS NULL)";
		
		$resultado = $GLOBALS['db_cliente']->Execute($sql);
		return $resultado->GetArray();
	}
	
	public function obtenerGestionInbound($campania_id, $etapa_id, $usuario, $fecha, $franja){
		
		if($etapa_id == 1){
			$sql = " SELECT
						t.id as tmk,
						t.consumidor_id as consumidor,
						c.no_documento as cedula,
						c.nombre_completo as nombre,
						t.observaciones as observaciones,
						t.fecha_telemercadeo as fecha_telemercadeo
					FROM telemercadeo t
						INNER JOIN consumidor c ON t.consumidor_id = c.id
					WHERE 
						t.campania_id = {$campania_id}  
						AND t.etapa_id = {$etapa_id}
						AND  usuario_id = {$usuario}
						AND t.causal_tmk_id = 47
					ORDER BY t.fecha_telemercadeo";
		}
		else if($etapa_id == 4){
			$sql = "SELECT
						t.id as tmk,
						t.consumidor_id as consumidor,
						c.no_documento as cedula,
						c.nombre_completo as nombre,
						tv.fecha_telemercadeo as fecha_telemercadeo,
            			ci.fecha_instalacion as fecha_instalacion,
			           	tv.usuario_id as usuario_tmk,
			            ci.integral as integral,
			            t.causal_tmk_id as causal,
			            (SELECT nombre FROM causal_tmk where id = t.causal_tmk_id) as nombre_causal
					FROM telemercadeo t
						INNER JOIN consumidor c ON t.consumidor_id = c.id
	          			INNER JOIN claro_inbound ci ON (t.campania_id = ci.campania_id AND t.base_id = ci.base_id AND t.consumidor_id = ci.consumidor_id)
	          			INNER JOIN telemercadeo tv ON (t.campania_id = tv.campania_id AND tv.etapa_id = 1 AND t.consumidor_id = tv.consumidor_id)
					WHERE
						t.campania_id = {$campania_id} 
						AND t.etapa_id = {$etapa_id}
						AND DATE(tv.fecha_telemercadeo) = '{$fecha}'
						AND (t.causal_tmk_id = 47 OR t.causal_tmk_id = 49 OR t.causal_tmk_id IS NULL) AND tv.causal_tmk_id = 20
					ORDER BY tv.fecha_telemercadeo, t.causal_tmk_id";
		}
		else if($etapa_id == 5){	
			$sql = "SELECT 
						t.id AS tmk,
						t.consumidor_id AS consumidor,
						co.no_documento AS cedula,
						co.nombre_completo AS nombre,
						DATE(t2.fecha_telemercadeo) AS fecha_confirmacion,
						DATE(t.fecha_telemercadeo) AS fecha_reprogramada,
						c.franja_confirmada AS franja
					FROM 
						telemercadeo t 
						INNER JOIN claro_inbound c ON(c.campania_id = t.campania_id and t.consumidor_id = c.consumidor_id)
						INNER JOIN consumidor co ON(co.id = t.consumidor_id)
						LEFT  JOIN telemercadeo t2 ON(t.campania_id = t2.campania_id AND t2.etapa_id = 4 AND t.consumidor_id = t2.consumidor_id)
					WHERE 
						t.campania_id = {$campania_id} 
						AND t.etapa_id = {$etapa_id}
						AND (t.causal_tmk_id IS NULL OR t.causal_tmk_id = 49)
						AND DATE(c.fecha_instalacion_confirmada) = '{$fecha}' AND c.franja_confirmada = '{$franja}'
					ORDER BY c.fecha_instalacion_confirmada, c.franja_confirmada";
		}		
		$resultado = $GLOBALS['db_cliente']->Execute($sql);
		return $resultado->GetArray();
	}
	
}
?>