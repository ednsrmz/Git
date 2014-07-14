var variables_configuracion = Ext.util.JSON.decode(json_configuracion_plugin);
	for(var k=0; k < variables_configuracion.length; k++){
		eval(variables_configuracion[k].variable +" = '"+ variables_configuracion[k].valor +"';" );
}
	
Ext.QuickTips.init();
	
	var datos_actuales = new Ext.form.Label({
		id: 'datos_actuales',
        anchor : '100%',
		html: ''
    })

	var cupo_otorgado = new Ext.form.Label({
		id: 'cupo_otorgado',
		anchor : '100%',
    	html: ''
	})
	
	var cupo_asignado = new Ext.form.Label({
		id: 'cupo_asignado',
        anchor : '100%',
		html: ''
    })

	var check_selection = new Ext.grid.CheckboxSelectionModel({
		checkOnly: true,
		singleSelect: false,
		header: ' ',
		listeners: {'rowdeselect': function (selectionModel, rowIndex, record ){
			record.set('cupo','');
			record.set('beneficio','');
			record.set('ciclo','');
			record.set('tipo','');
			record.set('oferta_id','');
			record.set('beneficio_id','');
			record.set('cuota_manejo_plena','');
			record.set('cuota_manejo','');
		}},
    });

	var store_oferta = new Ext.data.SimpleStore({
        fields: ['categoria_id','oferta','cupo','beneficio','ciclo', 'tipo','oferta_id','beneficio_id','cuota_manejo', 'cuota_manejo_plena'],
    });
	
	var grilla_venta_tarjeta = new Ext.grid.EditorGridPanel({
		id: 'grilla_venta_tarjeta',
		store: store_oferta,
		columnLines: true,
		viewConfig: {forceFit: true },
		frame: true,
		autoScroll: true,
		autoHeight: true,
		enableHdMenu: false,
		autoWidth: true,
		sm: check_selection,
		style: "margin-left: auto; margin-right: auto;",
		listeners: {afteredit: cargarDatos, beforeedit: cargarBeneficios },
		forceValidation: true,
		plugins: new Ext.ux.plugins.GridValidator,
		columns: [
			check_selection, 
			{header: "Franquicia Oferta", dataIndex: 'oferta', sortable: false},                  
       		{header: "Cupo Asignado", dataIndex: 'cupo', sortable: false, renderer: Ext.util.Format.usMoney, editor: editorCupoAsignado(store_oferta)},
			{header: "Tipo TDC", dataIndex: 'tipo', sortable: false},
			{header: "Beneficio", dataIndex: 'beneficio', sortable: false, editor: editorBenficio()},
			{header: "Cuota Manejo", dataIndex: 'cuota_manejo', sortable: false, renderer: Ext.util.Format.usMoney},
			{header: "Ciclo", dataIndex: 'ciclo', sortable: false, editor:ediorCiclos()},
		],
	});
	
	var panel_tarjetas = new Ext.form.FormPanel({
        id: 'panel_tarjetas',
        width: 710,
        autoHeight: true,
		frame: true,
        style: "margin-left: auto; margin-right: auto;",
        renderTo: 'div_panel_venta_tarjeta',
        items: 	[
			{
				xtype: 'fieldset',
				id: 'datos_adicionales',
				autoHeight: true,
				title: 'Dartos Adicionales',
				bodyStyle: 'background-color:#FFF;padding: 5px',
				items: [datos_actuales, cupo_otorgado,cupo_asignado]
			},{
				xtype: 'fieldset',
				title: 'Oferta Tarjeta',
				bodyStyle: 'background-color:#FFF;padding: 0px',
				items: [grilla_venta_tarjeta],
			}
		]
    });
	
	Ext.get('panel_tarjetas').mask('Cargano Ofertas','x-mask-loading')
	
	Ext.Ajax.request({				
		url: 'index.php?modulo=VentaTarjetas&accion=ObtenerOferta&content=true',
		async: false,
		method: 'POST',
		params: {'consulta': 'obtenerCategoria','base_id': base_id, 'consumidor_id': consumidor_id },
		success: function(response, options){
			
			if(response.responseText != " []"){
				oferta = Ext.util.JSON.decode(response.responseText);
				
				for(var i=0; i < oferta.length; i++){
					var tarjeta = oferta[i];
					Ext.getDom('cupo_otorgado').innerHTML = "<br><p style='color: #000080; font-weight: bold;', align='left'>Cupo Otorgado: $"  + number_format(tarjeta['cupo_total'],0) + "</p>"
					Ext.getCmp('cupo_otorgado').value = tarjeta['cupo_total']
					Ext.getDom('cupo_asignado').innerHTML = "<p style='color: #804000; font-weight: bold;'align='left'>Cupo Asigando: $ 0</p>";
					
					if(Ext.getCmp(tarjeta.id) == undefined){
						var nuevo_registro = new Ext.data.Record({
				        	oferta: tarjeta['oferta'],
							categoria_id: tarjeta['categoria_id'],
				            tipo: '',
				            cupo: '',
							oferta_id:'',
							beneficio: '',
							beneficio_id: '',
							cuota_manejo: '',
							cuota_manejo_plena: '',
							ciclo: '',
				  		});
				        store_oferta.add(nuevo_registro);
						Ext.get('panel_tarjetas').unmask();
					}
				}
			}else{
				m_error('No hay ofertas para este consumidor')
				Ext.get('panel_tarjetas').unmask();				
			} 
		}
})


function editorCupoAsignado(store){	
	return new Ext.form.NumberField({
		allowBlank: false,
		allowDecimals: false,
		allowNegative: false,
	});
}

function editorBenficio(){
	
	var store_beneficio = new Ext.data.JsonStore({
        url: 'index.php?modulo=VentaTarjetas&accion=ObtenerOferta&content=true',
        root: 'datos',
        fields: ['nombre','id']
	});
	
	return new Ext.form.ComboBox({
		id: 'combo_beneficio',
		store: store_beneficio,
		displayField: 'nombre',
		valueField: 'nombre',
		triggerAction: 'all',
		mode: 'local',
		selectOnFocus: true,
		typeAhead: true,
		forceReload: true,
		forceSelection:true,
		loadingText: "Obteniendo datos ...",
		forceSelection: true,
		listWidth: 150,
        allowBlank: false
	});
}

function ediorCiclos(){
	
	return new Ext.form.ComboBox({
		id: 'combo_ciclo',
		store: new Ext.data.SimpleStore({
        	fields: ['ciclo'],
			data:['1','2']
		}),
		displayField: 'ciclo',
		valueField: 'ciclo',
		triggerAction: 'all',
		mode: 'local',
		selectOnFocus: true,
		typeAhead: true,
		forceSelection:true,
        allowBlank: false
	});
}

function cargarBeneficios(e){

	if (e.field == 'beneficio') {
		
		if(e.record.get('oferta_id') == ''){
			m_error('Primero debe otorgar el cupo para cargar los beneficios')
		}else {
			Ext.getCmp('combo_beneficio').store.load({
				params: {'consulta': 'obtenerBeneficios', 'oferta_id': e.record.get('oferta_id')},
			})
		}
	}
}

function cargarDatos(a){

	if (a.field == 'cupo'){
		
		a.record.set('tipo', '')
		a.record.set('beneficio', '')
		a.record.set('beneficio_id', '')
		a.record.set('cuota_manejo', '')
		a.record.set('cuota_manejo_plena', '')
		a.record.set('ciclo', '')

		var cupo_usado = 0;
		
		if(a.record.get('cupo') > Ext.getCmp('cupo_otorgado').value){
			Ext.getDom('cupo_asignado').innerHTML = "<p style='color: #804000; font-weight: bold;'align='left'>Cupo Asigando: $ 0</p>";
			a.record.set('cupo', '')
			a.record.set('tipo', '')
			a.record.set('oferta_id', '')
			a.record.set('beneficio', '')
			a.record.set('beneficio_id', '')
			a.record.set('cuota_manejo', '')
			a.record.set('cuota_manejo_plena', '')
			a.record.set('ciclo', '')
			m_error('El cupo debe ser menor a <b>$'+ number_format(Ext.getCmp('cupo_otorgado').value,0) +'</b>')
			return false
		}
		
		if (a.record.get('categoria_id') == 1) {
			if (a.record.get('cupo') < 400000 || a.record.get('cupo') > 50000000) {
				a.record.set('cupo', '')
				a.record.set('tipo', '')
				a.record.set('oferta_id', '')
				a.record.set('beneficio', '')
				a.record.set('beneficio_id', '')
				a.record.set('cuota_manejo', '')
				a.record.set('cuota_manejo_plena', '')
				a.record.set('ciclo', '')
				Ext.getDom('cupo_asignado').innerHTML = "<p style='color: #804000; font-weight: bold;'align='left'>Cupo Asigando: $ 0</p>";
				m_error('El cupo no es valido para el tipo de tarjeta <b>' + a.record.get('oferta') + '</b>')
				return false
			}
		}else if (a.record.get('categoria_id') == 2) {
			if (a.record.get('cupo') < 400000 || a.record.get('cupo') > 200000000) {
				a.record.set('cupo', '')
				a.record.set('tipo', '')
				a.record.set('oferta_id', '')
				a.record.set('beneficio', '')
				a.record.set('beneficio_id', '')
				a.record.set('cuota_manejo', '')
				a.record.set('cuota_manejo_plena', '')
				a.record.set('ciclo', '')		
				Ext.getDom('cupo_asignado').innerHTML = "<p style='color: #804000; font-weight: bold;'align='left'>Cupo Asigando: $ 0</p>";		
				m_error('El cupo no es valido para el tipo de tarjeta <b>' + a.record.get('oferta') + '</b>')
				return false
			}
		}else if (a.record.get('categoria_id') == 3) {
			if (a.record.get('cupo') < 1000000 || a.record.get('cupo') > 99999997952) {
				a.record.set('cupo', '')
				a.record.set('tipo', '')
				a.record.set('oferta_id', '')
				a.record.set('beneficio', '')
				a.record.set('beneficio_id', '')
				a.record.set('cuota_manejo', '')
				a.record.set('cuota_manejo_plena', '')
				a.record.set('ciclo', '')		
				Ext.getDom('cupo_asignado').innerHTML = "<p style='color: #804000; font-weight: bold;'align='left'>Cupo Asigando: $ 0</p>";		
				m_error('El cupo no es valido para el tipo de tarjeta <b>' + a.record.get('oferta') + '</b>')
				return false
			}
		}else if(a.record.get('categoria_id') == 4){
			if (a.record.get('cupo') < 400000 || a.record.get('cupo') > 50000000) {
				a.record.set('cupo', '')
				a.record.set('tipo', '')
				a.record.set('oferta_id', '')
				a.record.set('beneficio', '')
				a.record.set('beneficio_id', '')
				a.record.set('cuota_manejo', '')
				a.record.set('cuota_manejo_plena', '')
				a.record.set('ciclo', '')
				Ext.getDom('cupo_asignado').innerHTML = "<p style='color: #804000; font-weight: bold;'align='left'>Cupo Asigando: $ 0</p>";				
				m_error('El cupo no es valido para el tipo de tarjeta <b>' + a.record.get('oferta') + '</b>')
				return false
			}
		}else if(a.record.get('categoria_id') == 5){
			if (a.record.get('cupo') < 400000 || a.record.get('cupo') > 20000000) {
				a.record.set('cupo', '')
				a.record.set('tipo', '')
				a.record.set('oferta_id', '')
				a.record.set('beneficio', '')
				a.record.set('beneficio_id', '')
				a.record.set('cuota_manejo', '')
				a.record.set('cuota_manejo_plena', '')
				a.record.set('ciclo', '')
				Ext.getDom('cupo_asignado').innerHTML = "<p style='color: #804000; font-weight: bold;'align='left'>Cupo Asigando: $ 0</p>";				
				m_error('El cupo no es valido para el tipo de tarjeta <b>' + a.record.get('oferta') + '</b>')
				return false
			}
		}else if(a.record.get('categoria_id') == 6){
			if (a.record.get('cupo') < 200000 || a.record.get('cupo') > 1200000) {
				a.record.set('cupo', '')
				a.record.set('tipo', '')
				a.record.set('oferta_id', '')
				a.record.set('beneficio', '')
				a.record.set('beneficio_id', '')
				a.record.set('cuota_manejo', '')
				a.record.set('cuota_manejo_plena', '')
				a.record.set('ciclo', '')
				Ext.getDom('cupo_asignado').innerHTML = "<p style='color: #804000; font-weight: bold;'align='left'>Cupo Asigando: $ 0</p>";			
				m_error('El cupo no es valido para el tipo de tarjeta <b>' + a.record.get('oferta') + '</b>')
				return false
			}			
		}else if(a.record.get('categoria_id') == 7){
			if (a.record.get('cupo') < 200000 || a.record.get('cupo') > 4900000) {
				a.record.set('cupo', '')
				a.record.set('tipo', '')
				a.record.set('oferta_id', '')
				a.record.set('beneficio', '')
				a.record.set('beneficio_id', '')
				a.record.set('cuota_manejo', '')
				a.record.set('cuota_manejo_plena', '')
				a.record.set('ciclo', '')
				Ext.getDom('cupo_asignado').innerHTML = "<p style='color: #804000; font-weight: bold;'align='left'>Cupo Asigando: $ 0</p>";			
				m_error('El cupo no es valido para el tipo de tarjeta <b>' + a.record.get('oferta') + '</b>')
				return false
			}				
		}else if(a.record.get('categoria_id') == 8){
			if (a.record.get('cupo') < 10000000 || a.record.get('cupo') > 200000000) {
				a.record.set('cupo', '')
				a.record.set('tipo', '')
				a.record.set('oferta_id', '')
				a.record.set('beneficio', '')
				a.record.set('beneficio_id', '')
				a.record.set('cuota_manejo', '')
				a.record.set('cuota_manejo_plena', '')
				a.record.set('ciclo', '')
				Ext.getDom('cupo_asignado').innerHTML = "<p style='color: #804000; font-weight: bold;'align='left'>Cupo Asigando: $ 0</p>";	
				m_error('El cupo no es valido para el tipo de tarjeta <b>' + a.record.get('oferta') + '</b>')
				return false
			}
		}else if(a.record.get('categoria_id') == 9){
			if (a.record.get('cupo') < 400000 || a.record.get('cupo') > 10000000) {
				a.record.set('cupo', '')
				a.record.set('tipo', '')
				a.record.set('oferta_id', '')
				a.record.set('beneficio', '')
				a.record.set('beneficio_id', '')
				a.record.set('cuota_manejo', '')
				a.record.set('cuota_manejo_plena', '')
				a.record.set('ciclo', '')
				Ext.getDom('cupo_asignado').innerHTML = "<p style='color: #804000; font-weight: bold;'align='left'>Cupo Asigando: $ 0</p>";	
				m_error('El cupo no es valido para el tipo de tarjeta <b>' + a.record.get('oferta') + '</b>')
				return false
			}
		}
		
		Ext.getCmp('grilla_venta_tarjeta').getStore().each(function(record){
			if(record.get('cupo') > 0){
				cupo_usado = cupo_usado + parseFloat(record.get('cupo'));
			}
		});
		
		Ext.getDom('cupo_asignado').innerHTML = "<p style='color: #804000; font-weight: bold;'align='left'>Cupo Asignado: $"+ number_format(cupo_usado,0) +"</p>";
		
		if(Ext.getCmp('cupo_otorgado').value < cupo_usado){
			m_error('La suma de los cupos asignados supera el cupo otorgado')
			a.record.set('cupo', '')	
			Ext.getDom('cupo_asignado').innerHTML = "<p style='color: #804000; font-weight: bold;'align='left'>Cupo Asigando: $ 0</p>";
			return false
		}
			
		Ext.Ajax.request({				
			url: 'index.php?modulo=VentaTarjetas&accion=ObtenerOferta&content=true',
			async: false,
			method: 'POST',
			params: {'oferta': a.record.get('oferta'), 'cupo': a.record.get('cupo'), 'categoria_id': a.record.get('categoria_id'),'consulta': 'obtenerOfeta'},
			success: function(response, options){
				tipo_tdc = Ext.util.JSON.decode(response.responseText);
					for (var i = 0; i < tipo_tdc.length; i++) {
						var tipo_tarjeta = tipo_tdc[i]
						a.record.set('tipo', tipo_tarjeta['tipo'])
						a.record.set('oferta_id', tipo_tarjeta['oferta_id'])
						a.record.set('cuota_manejo_plena', tipo_tarjeta['cuota_maneja'])
						a.record.set('cuota_manejo', tipo_tarjeta['cuota_maneja'])
					}
				}
		})
	}
	
	if(a.field == 'beneficio'){
		var editor_celda = a.grid.getColumnModel().getCellEditor(a.column, a.row).field;
		var indice_seleccionado = editor_celda.selectedIndex;
		var registro = editor_celda.store.getAt(indice_seleccionado);
		var descuento;
		
		if(a.record.get('beneficio') == 'Dualidad'){
			descuento =  (a.record.get('cuota_manejo_plena')*0.7)
			a.record.set('cuota_manejo', descuento)
		
		}else if (a.record.get('beneficio') == 'Multifranquicia'){
			descuento = (a.record.get('cuota_manejo_plena')*0.5)
			a.record.set('cuota_manejo', descuento)
		
		}else if (a.record.get('beneficio') == 'Ejecutivo'){
			a.record.set('cuota_manejo', 0)

		}else if (a.record.get('beneficio') == 'Credito Vehiculo Sufi'){
			descuento = (a.record.get('cuota_manejo_plena')*0.5)
			a.record.set('cuota_manejo', descuento)
		
		}else if (a.record.get('beneficio') == 'Cpt'){
			a.record.set('cuota_manejo', 0)
		
		}else if (a.record.get('beneficio') == 'Aval'){
			a.record.set('cuota_manejo', a.record.get('cuota_manejo_plena'))

		}else if (a.record.get('beneficio') == 'Exoneracion 50% Esso'){
			descuento = (a.record.get('cuota_manejo_plena')*0.5)
			a.record.set('cuota_manejo', descuento)
		}
		
		if(registro.get('id') != '')
			a.record.set('beneficio_id', registro.get('id'));
		else{
			m_error('Este Beneficio no aplica para este tipo de tarjeta');
			a.record.set('beneficio', '');
			a.record.set('beneficio_id', '');
			a.record.set('ciclo', '');
		}
	}
}

function validadorPluginVentaTarjeta(){
	var tarjetas_seleccionada = Ext.getCmp('grilla_venta_tarjeta').getSelectionModel().getSelections();
		
	if(tarjetas_seleccionada.length > 0){
		var jsonData = "[";
		
		for (a =0; a < tarjetas_seleccionada.length; a++){
			tarjeta = tarjetas_seleccionada[a].data
			
			if (tarjeta.cupo == '') {
				m_error('Falta el cupo para la tarjeta <b>' + tarjeta.oferta +'</b>')
				return false
			}
			 
			var categoria = parseFloat(tarjeta.categoria_id	.replace(/,/g,''));
			
			
			if (categoria == 4 && tarjeta.beneficio == '') {
				m_error('Falta el benefico para la tarjeta <b>' + tarjeta.oferta +'</b>')
				return false
			}
			
			if (tarjeta.ciclo == '') {
				m_error('Falta el ciclo para la tarjeta <b>' + tarjeta.oferta +'</b>')
				return false
			}
			
			jsonData += Ext.util.JSON.encode(tarjeta) + ",";
		}
		
		jsonData = jsonData.substring(0,jsonData.length-1) + "]";
		Ext.getDom("input_plugin_ventatarjeta").value = jsonData;
		
	}else{
		m_error('Si es interesado debe seleccionar al menos una oferta');
		return false;
	}
	
	return true
}