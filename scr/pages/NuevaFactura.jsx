import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, ScrollView, Text, Image, Alert, FlatList } from 'react-native';
import logo from '../../assets/logo.png';
import logodr from '../../assets/logodr.png';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import axiosInstance from '../utils/api';
import { TouchableOpacity } from 'react-native';

const NuevaFactura = ({ route, navigation }) => {
  const [invoice, setInvoice] = useState('');
  const [rows, setRows] = useState([{ cantidad: '', producto: '', precio: '', valor: '' }]);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]); // ISO date string
const [numero, setNumero] = useState('');
const [por_impuesto, setPorImpuesto] = useState(0);
const [valcontado, setValcontado] = useState(0);
const [valanticipo, setValanticipo] = useState(0);
const [valcredito, setValcredito] = useState(0);
const [subtotalcer, setsubtotalcer] = useState(0);
const [subtotalimp, setSubtotalimp] = useState(0);
const [valtarjetacre, setValtarjetacre] = useState(0);
const [valtarjetadeb, setValtarjetadeb] = useState(0);
const [pordescuento, setPordescuento] = useState(0);
const [valdescuento, setValdescuento] = useState(0);

const [responsable, setResponsable] = useState('ADM');
const [bloqueado, setBloqueado] = useState('F');
const [anulado, setAnulado] = useState('F');
const [observacion, setObservacion] = useState('N');
const [vendedor, setVendedor] = useState('');
const [valcheque, setValcheque] = useState(0);
const [validado, setValidado] = useState('F');
const [documento, setDocumento] = useState('FV12');
const [borrador, setBorrador] = useState('V');
const [cliente, setCliente] = useState('');



  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [idcreado, setIdecreado] = useState(''); // Estado para el término de búsqueda
  const [searchTermC, setSearchTermC] = useState(''); // Estado para el término de búsqueda
  const [filteredProducts, setFilteredProducts] = useState([]); // Estado para productos filtrados
  const [filteredClientes, setFilteredClientes] = useState([]); // Estado para productos filtrados
  const [totals, setTotals] = useState({ subtotal: 0, iva: 0, total: 0 });
  
  
  
  useEffect(() => {
    const numeofactura = async () => {
        try {
          const response = await axiosInstance.post('/sige/nrofactura/', {
             documento: documento, // Usar el documento seleccionado
          });
          setNumero(response.data.siguiente_numero);
          
        } catch (err) {
          setError('Error al obtener el siguiente número');
          console.error(err);
        }
     
    };

    numeofactura();
  }, []);

  const handleInputChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);

    // Filtrar productos cuando se cambia el texto
    if (field === 'producto') {
      setSearchTerm(value);
      const filtered = productos.filter(producto =>
        producto.i301_nombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
     if (field === 'precio' ) {
      const { subtotal, iva, total } = calculateTotals(newRows);
      setTotals({ subtotal, iva, total });
      newRows[index]['valor'] = value;
      newRows[index]['cantidad'] = 1;
    }
  };

  useEffect(() => {
    const clienteslist = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/sige/cliente_list/');
        setClientes(response.data);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
        Alert.alert('Error', 'No se pudieron cargar los clientes. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    clienteslist();
  }, []);

  useEffect(() => {
    const productolist = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/sige/productos_list/');
        setProductos(response.data);
      } catch (error) {
        console.error('Error al obtener productos:', error);
        Alert.alert('Error', 'No se pudieron cargar los productos. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    productolist();
  }, []);

  const handleAddInvoice = () => {
    if (numero.trim() === '') {
      alert('Please enter an invoice number.');
      return;
    }
    addInvoice(invoice);
    resetForm();
    navigation.goBack();
  };

  const resetForm = () => {
    setInvoice('');
    setRows([{ cantidad: '', producto: '', precio: '', valor: '' }]);
    setSearchTerm(''); // Resetear el término de búsqueda
    setFilteredProducts([]); // Limpiar productos filtrados
  };

  const addRow = () => {
    setRows([...rows, { cantidad: '1', producto: '', precio: '', valor: '' }]);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    rows.forEach(row => {
      const cantidad = parseFloat(row.cantidad) || 1;
      const precio = parseFloat(row.precio) || 0;
      subtotal += cantidad * precio;
    });
    const iva = subtotal * 0.15; // 15% of IVA
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const handleclienteChange = (value) => {
    
      setSearchTermC(value);
      const filteredC = clientes.filter(cliente =>
        cliente.i501_nombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredClientes(filteredC);
    
  };

  const { subtotal, iva, total } = calculateTotals();

   const handleSubmit = async () => {
    
    if (parseFloat(total) <= 0) {
      setError('El total debe y el total haber deben ser iguales.');
      return; // Prevent form submission
    }
    const formData = new FormData();
    formData.append('i502_fec_emision', fecha);
    formData.append('i502_numero', numero);
    formData.append('i502_documento', documento);
    formData.append('i502_cliente', cliente);
    formData.append('i502_vendedor', vendedor);
    formData.append('i502_observacion', observacion);
    formData.append('i502_anulado', anulado);
    formData.append('i502_bloqueado', bloqueado);
    formData.append('i502_validado', validado);
    formData.append('i502_borrador', borrador);
    formData.append('i502_responsable', responsable);
    formData.append('i502_val_contado', valcontado);
    formData.append('i502_val_credito', valcredito);
    formData.append('i502_val_cheque', valcheque);
    formData.append('i502_val_tarjeta_cre', valtarjetacre);
    formData.append('i502_val_tarjeta_deb', valtarjetadeb);
    formData.append('i502_subtotal_imp', subtotalimp);
    formData.append('i502_subtotal_cer', subtotalcer);
    formData.append('i502_val_descuento', valdescuento);
    formData.append('i502_por_descuento', pordescuento);

    formData.append('i502_val_anticipo', valanticipo);
    formData.append('i502_por_impuesto_iva', por_impuesto);
    
    formData.append('i502_total', totals.total);
    formData.append('i502_val_impuesto_iva', totals.iva);
    formData.append('i502_subtotal', totals.subtotal);
    
    
    for (let pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }
    
    
    try {
    
        const response = await axiosInstance.post('/sige/factura_cliente_list/', formData, {
          headers: {  'Content-Type': 'multipart/form-data' }
        });
    
        console.log('Respuesta del servidor:', response.data);
      
        if (response.data && response.data.i502_id) {
          setIdecreado(response.data.i502_id);
          console.log('i502_id:', response.data.i502_id);
          // si HAN INGRESADO CTA DE BANCO GRABA MOVIMIENTOS CHeque
                    
           const detailPromises = rows.map(async (item,index) => {
           try {
        const responsedet = await axiosInstance.post(`/sige/detalle_venta_list/`, {
          i503_factura: response.data.i502_id,
          i503_producto: item.producto,
          i503_cantidad: item.cantidad,
          i503_valor: item.valor,
          i503_precio_lis: item.precio,
          i503_precio: item.precio,
          i503_bodega: '01',
          i503_cos_real:  0,
          i503_impuesto: 1,
          i503_unidad_medida: 'UNI',
          i503_sec_ingreso:1,
          i503_val_descuento:0,
          i503_por_descuento:0
            });
        return responsedet.data; // o lo que necesites retornar
              } catch (error) {
        if (error.response) {
          console.log(`Error en detalle ${index} - status:`, error.responsedet.status);
          console.log(`Error en detalle ${index} - data:`, error.responsedet.data);
        } else if (error.request) {
          console.log(`Error en detalle ${index} - no response:`, error.request);
        } else {
          console.log(`Error en detalle ${index} - message:`, error.message);
        }
        // Opcional: puedes lanzar el error para que Promise.all falle o manejarlo aquí
        throw error; // o return null para continuar con otros
              }
              });
              await Promise.all(detailPromises);
                    
            } 
          
            }
        catch (error) {
          if (error.response) {
          // El servidor respondió con un código de estado fuera del rango 2xx
            console.log('Error status:', error.response.status);
            console.log('Error data:', error.response.data);
            } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
              console.log('No response:', error.request);
            } else {
              // Otro error
              console.log('Error', error.message);
            }
          };
      };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.nav}>
        <Image source={logodr} style={styles.icon} />
        <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
          <Icon name="floppy-o" size={15} color="#fff" />
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.numfec}>
          <Text style={styles.fechaF}>Fecha: {new Date().toLocaleDateString()}</Text>
          <Text style={styles.numeroF}>Factura {documento} Nro 001-002 {numero}</Text>
          
      </View>
     <View style={styles.cliente}>
        <Icon name="user" size={30} color="#000" />
        <TextInput
            style={styles.cliente2}
            placeholder="Cliente"
            value={searchTermC} // Use searchTermC for the input value
            onChangeText={(value) => handleclienteChange(value)}
        />
  {searchTermC && filteredClientes.length > 0 && ( // Check if there are filtered clients
    <FlatList
      data={filteredClientes}
      keyExtractor={(item) => item.i501_ruc} 
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => {
          setCliente(item.i501_ruc); // Set the selected client
          setSearchTermC(item.i501_nombre); // Set the input value to the selected client's name
          setFilteredClientes([]); // Clear the filtered clients
        }}>
          <Text>{item.i501_nombre}</Text>
        </TouchableOpacity>
      )}
    />
  )}
  
  <Icon name="plus" size={18} color="#900" />
</View>

      <View style={styles.detalle}>
      <View style={styles.detalleh}>
        <Text style={styles.detallehText}>Descripcion</Text>
        <Text style={styles.detallehTextPrecio}>Valor</Text>
      </View>
        {rows.map((row, index) => (
          <View key={index} style={styles.row}>
            <TextInput
              style={styles.serviceInput}
              placeholder="Servicio"
              value={row.producto}
              onChangeText={(value) => handleInputChange(index, 'producto', value)}
            />
            {searchTerm && (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.i301_codigo} // Asegúrate de que cada producto tenga un ID único
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => {
                    const newRows = [...rows];
                    newRows[index].producto = item.i301_codigo; // Asigna el nombre del producto
                    newRows[index].precio = item.i301_pre_lista; // Asigna el precio del producto
                    
                    setRows(newRows);
                    setSearchTerm(''); // Limpiar el término de búsqueda
                    setFilteredProducts([]); // Limpiar productos filtrados
                  }}>
                    <Text>{item.i301_nombre}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TextInput
              style={styles.priceInput}
              placeholder="$"
              value={row.precio}
              onChangeText={(value) => handleInputChange(index, 'precio', value)}
              keyboardType="numeric"
            />
          
          </View>
        ))}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={addRow} style={styles.iconButton}>
            <Icon name="plus" size={16} color="#031578" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.totals}>
      <View style={styles.subtotals}>
        <Text style={styles.Tsubtotals}>Subtotal </Text>
        <Text style={styles.Tsubtotals}> ${subtotal.toFixed(2)}</Text>
      </View>
      
      <Text >Subtotal 0% : ${subtotalcer.toFixed(2)} </Text>
      <Text >Subtotal 15% : ${subtotalimp.toFixed(2)} </Text>
      <Text>Impuesto IVA 15%: ${iva.toFixed(2)}</Text>
      
        <Text style={styles.Ttotals}>Total: ${total.toFixed(2)}</Text>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
 nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    paddingVertical: 10,
  },
  icon: {
    width: 150,
    height: 90,
 
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#031578',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  numfec: {
    
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  numeroF: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fechaF: {
    fontSize: 12,
    color: '#555',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 310,
    borderRadius: 8,
  },
  cliente: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 395,
    borderRadius: 8,
  },
  cliente2: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    fontSize: 14,
  },
  totals: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginRight:10,
  
  },
   subtotals: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  Ttotals: {
    backgroundColor: '#031578',
    color: '#e9f7ef',
    fontWeight: 'bold',
    fontSize: 24,
    flex: 1,
    textAlign: 'right',
    paddingRight:10,
    marginRight:1,
    width:200,
    borderRadius:8,
  
  },
  addButton: {
    marginLeft: 8,
    padding: 6,
  },
  detalleh: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#031578',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  detallehText: {
    color: '#e9f7ef',
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  detallehTextPrecio: {
    color: '#e9f7ef',
    fontWeight: 'bold',
    fontSize: 14,
    width: 80,
    textAlign: 'center',
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    paddingHorizontal: 10,
  },
  serviceInput: {
    flex: 1, // Ocupa todo el espacio disponible
    height: 40,
    fontSize: 12,
    paddingHorizontal: 4,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    
  },
  priceInput: {
    width: 80, // Ancho fijo para alinear con subtotales
    height: 40,
    marginLeft: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 14,
    textAlign: 'center',
  },
  subtotals: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    width: 100, // Ancho similar al input precio para alineación
    marginRight: 20,
  },
});

 export default NuevaFactura;
