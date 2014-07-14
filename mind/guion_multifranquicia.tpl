{literal}
<script language="javascript">
	var producto_actual = '{/literal}{$registro.producto_actual}{literal}'
	var beneficio = '{/literal}{$registro.beneficio}{literal}'
	var cedula_codificada = '{/literal}{$cedula_codificada}{literal}';
	var cedula_mostrar = '{/literal}{$cedula_mostrar}{literal}';
	var nombre_completo = '{/literal}{$registro.nombre}{literal}';
	var ejecutivo = '{/literal}{$registro.ejecutivo}{literal}'
	var nomina = '{/literal}{$registro.nomina_bancolombia}{literal}'
	var nombre_usuario = '{/literal}{$nombre_usuario}{literal}';
</script>
{/literal}

<script language="javascript" src="{$ruta_smarty}guiones/cliente_3/campania_{$registro.campania_id}/{$guion}.js"></script>

<h1 align='center' style='color: #804000;'><b>GUION BANCOLOMBIA MULTIFRANQUICIA</b></h1>
<br>

<fieldset style='padding: 15px; '>
	<legend>Comunica Cliente:</legend><br>
	
	<p>Buenos días / tardes / noches Sr(a) <b style="color:#6f6f6f;">{$registro.nombre}</b>, le habla <b>{$nombre_usuario}</b> Asesor de <b>BANCOLOMBIA</b>, 
	¿cómo se encuentra el día de hoy?  (Espere respuesta) Gracias por atenderme... </p><br>
		
	<p>Sr(a) <b style="color:#6f6f6f;">{$registro.nombre}</b>, le informo que esta llamada esta siendo grabada y monitoreada para efectos de medir la calidad en nuestro servicio.<br><br>	
	El propósito de mi llamada es felicitarlo por el excelente manejo que ha presentado con sus productos financieros con <b>BANCOLOMBIA</b> e informarle que le ha(n) sido otorgada(s) la(s) 
	tarjeta(s) de crédito <b style='color:#804000;'>{$registro.oferta}</b> con un cupo total de <b style='color:#804000'>${$registro.cupo|number_format:0}</b> 
	</p><br>
	
	<p>El cupo otorgado puede ser utilizado <b>100%</b> en avances en efectivo, puede realizar compras a nivel nacional e internacional<br><br>
	
	Sr(a) <b style="color:#6f6f6f;">{$registro.nombre}</b>, actualmente sus ingresos son superiores a <b style='color:#408080;'>{$registro.ingresos_requeridos}</b> 
	<b style='color:#804000;'>(ingresos requeridos para la oferta)</b>
	<select name='actualizable_request[confirmacion_ingresos]' onchange='abrirguion(this.value)' id='confirmacion_ingresos'>
		<option value=''>--</option>
		<option value='Si'>Si</option>
		<option value='No'>No</option>
	</select>
	</p><br><br>
	
	<div id='nomina' style='display:none;' >
	<p>Sr(a) <b style="color:#6f6f6f;">{$registro.nombre}</b>, me confirma su ocupacion?
	
	<select name='actualizable_request[ocupacion]' id='ocupacion' onchange='activarEmpresas(this.value)'>
		<option value=''>--</option>
		<option value='Empleados'>Empleados</option>
		<option value='Independientes Declarante'>Independientes Declarante</option>
		<option value='Independientes Prestador Servicio'>Independientes Prestador Servicio</option>
		<option value='Pensionado'>Pensionado</option>
	</select>
	</p><br>

	{if $registro.ejecutivo == 1}
		<p>Sr(a) <b style="color:#6f6f6f;">{$registro.nombre}</b>, le informo usted contará con dos años sin cuota de manejo  y después de los dos años
		 tendrá una exoneración del 70% en la cuota de manejo en estas nuevas tarjeta de crédito. <b style='color:#ff0000;'>(Este beneficio aplica para todas las tarjetas de credito)</b>
		</p><br>
	{else if $registro.ejecutivo == 0}
	
		<p>Sr(a) <b style="color:#6f6f6f;">{$registro.nombre}</b>, quisiera confirmar algunos datos para saber si podemos otorgarle algunos beneficios adicionales.Usted me puede confirmar
		la empresa para la cual trabaja? <b style='color:#804040;'>(Validar si aplica o no ejecutivo empresarial).</b></p><br>
		
		<p style='color:#408080'><b>NOTA:</b> Por favor escriba una palabra de minimo 4 letras para que se muestre un listado de empresas que contenga esa palabra digitada para una busqueda mas rapida</p><br>
		<div id='panel_empresas'></div>
		<br>
	{/if}
	
	
	{if $registro.nomina_bancolombia == 1}
		<p>Sr(a) <b style="color:#6f6f6f;">{$registro.nombre}</b>, usted no tiene que presentar documentación solamente tener su cedula original al momento de la entrega de la TC.
		</p><br>
	
	{else if $registro.nomina_bancolombia == 0}
		<p>Sr(a) <b style="color:#6f6f6f;">{$registro.nombre}</b>, Adicionalmente, para la entrega de su tarjeta de crédito debemos actualizar su información de ingresos para lo cual necesitamos anexar su 
		certificado de ingresos. Además de esto usted deberá firmar un pagare, un contrato y diligenciar formato de actualización de información.
	
			<select name='actualizable_request[documento_recoger]' id='documento'>
				<option value=''>--</option>
				<option value='1'>Carta Laboral</option>
				<option value='4'>Declaración de Renta</option>
				<option value='9'>Carta de honorarios o prestación de servicios</option>
				<option value='6'>Colillas de Pago Para Jubilados o Carta de la Empresa</option>
				<option value='2'>Certificado de Ingresos y Retenciones</option>
			</select>
		</p><br>
	{/if}
	</div>
</fieldset><br>

<div id ="plugin_venta_tarjeta">{include_php file="web/plantillas/plugins/ventaTarjeta/inicio.php"}</div><br>

<fieldset style='padding: 15px; display:none; ' id="div_sucursal_seleccion">
	<legend>Seleccon Sucursal</legend><br>
	
	<p>Sr(a) <b style="color:#6f6f6f;">{$registro.nombre}</b>, queremos ajustar la fecha de pago de su tarjeta a sus necesidades de flujo de caja. Por este motivo necesitomos 
	que nos informe cuándo quiere que le haga corte su tarjeta y cuando quiere que sea su fecha de pago
	</p><br>
	
	<p>Sr(a) <b style="color:#6f6f6f;">{$registro.nombre}</b>, en qué sucursal quiere que le radiquemos su tarjeta de crédito? , esta sucursal puede ser diferente a la sucursal 
	en la que ud tiene radicados sus otros productos.<b style='color:#804000;'>Recuerde que la oficina seleccionada debe estar ubicada en la ciudad donde va a recibir la TDC</b>
	</p><br><br>
	
	<div id='div_sucursal'></div><br>	
	
</fieldset><br>

<fieldset style='padding: 15px; display:none; ' id="div_despedida_interesado">
	<legend>Despedida Interesado</legend><br>

	<p>RECUERDE !Si el cliente esta interesado en la adquicion de la tarjeta por favor informale los pasos para la activacion!</p><br>
	<p style='color:#008000; ' onclick="cargar_window('div_activacion_tarjeta','Pasos Activacios TC','',450)">
	     PASOS ACTIVACIÓN TARJETA (click para abrir)</p><br>
	<p>Todos los papeles y pagarés se enviarán para  verificación al área de riesgo del Banco. </p><br>

    <p>Le deseo que tenga un buen día y gracias por su compra.</p><br>
</fieldset><br>

<fieldset style='padding: 15px; display:none;' id="div_despedida_no_interesado">
	<legend>Despedida Interesado</legend><br>
	
	<p>Sr(a) <b style="color:#6f6f6f;">{$registro.nombre}</b>, le quiero informar que para la oferta que hemos diseñado para usted en este momento sus 
	   ingresos no cumplen con las condiciones de los productos ofertados, lo invito a visitar nuestra página en internet 
	   www.bancolombia.com  o acercarse a cualquiera de nuestras sucursales en donde lo asesoran con un portafolio diseñado especialmente 
	   para atender sus necesidades.</p><br>
    
	<p>Muchas gracias por su tiempo.</p><br>

<p style='color: #0000a0; font-weight: bold;'>Si El Cliente No Esta Interesado:</p><br>
    <p>Podríamos saber el motivo por el cual no desea adquirir la  tarjeta? Relacionar negativa del  cliente con los estados de 
	   comunicación con el cliente. Ver Anexo 2. Estados  para informe <br /><br />
	   Lo invitamos a conocer el portafolio de productos que  Bancolombia tienen para satisfacer todas sus necesidades visitándonos 
	   en la página <a href="http://www.bancolombia.com/"TARGET="_new">www.bancolombia.com</a> o  acercándose a nuestras sucursales fisicas Bancolombia.</p><br>
    <p>Muchas gracias por su tiempo  </p><br>	
</fieldset>


<div id="div_activacion_tarjeta" class="x-hide-display">
	<p align="center"><img src="web/plantillas/guiones/cliente_3/campania_8/informacion/activacionTarjeta.png"/></p><br>
</div>

<input type="hidden" name="actualizable_request[operador]" value="" id="input_operador">
<input type="hidden" name="actualizable_request[direccion_entrega]" value="" id="input_direccion">


<p><br><br><br><br></p>
<p><br><br><br><br></p>