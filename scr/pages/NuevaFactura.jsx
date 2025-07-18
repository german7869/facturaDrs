import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, ScrollView, Text, Image, Alert, FlatList } from 'react-native';
import logo from '../../assets/logo.png';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import axiosInstance from '../utils/api';
import { TouchableOpacity } from 'react-native';

const NuevaFactura = ({ route, navigation }) => {
  const [invoice, setInvoice] = useState('');
  const [rows, setRows] = useState([{ cantidad: '', producto: '', precio: '', valor: '' }]);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [filteredProducts, setFilteredProducts] = useState([]); // Estado para productos filtrados
   const [totals, setTotals] = useState({ subtotal: 0, iva: 0, total: 0 });
  
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
    if (invoice.trim() === '') {
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

  const handleClienteChange = (itemValue) => {
    setClienteSeleccionado(itemValue);
  };

  const { subtotal, iva, total } = calculateTotals();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.nav}>
        <Image source={logo} style={styles.icon} />
        <TouchableOpacity onPress={handleAddInvoice} style={styles.iconButton}>
          <Icon name="floppy-o" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.numfec}>
        <Text style={styles.numeroF}>Factura de venta Nro 001-002-000003</Text>
        <Text style={styles.fechaF}>Fecha: {new Date().toLocaleDateString()}</Text>
      </View>
      <View style={styles.cliente}>
        <Icon name="user" size={30} color="#000" />
        <Picker
          selectedValue={clienteSeleccionado}
          onValueChange={handleClienteChange}
        >
          <Picker.Item label="Seleccione un Cliente" value="" />
          {clientes.map((cliente) => (
            <Picker.Item key={cliente.i501_codigo} label={cliente.i501_nombre} value={cliente.i501_ruc} />
          ))}
        </Picker>
        <Icon name="search" size={18} color="#900" />
        <Icon name="plus" size={18} color="#900" />
      </View>

      <View style={styles.detalle}>
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
                    newRows[index].producto = item.i301_nombre; // Asigna el nombre del producto
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
            <Icon name="plus" size={16} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.subtotals}>
        <Text style={styles.Tsubtotals}>Subtotal </Text>
        <Text style={styles.Tsubtotals}> ${subtotal.toFixed(2)}</Text>
      </View>
      <Text>Desscuentos:  </Text>
      <Text>Impuesto IVA 15%: ${iva.toFixed(2)}</Text>
      <View style={styles.totals}>
        <Text style={styles.Ttotals}>Total: ${total.toFixed(2)}</Text>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: 390,
  },
  cliente: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    padding: 1,
    borderRadius: 8,
     
  },
  numfec: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    padding: 1,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  subtotals: {
    flexDirection: 'row',
    marginTop: 10,
    marginRight: 10,
    padding: 10,
    width: 380,
    backgroundColor: '#031578',
    borderRadius: 8,
     alignSelf: 'flex-start'
  },
  totals: {
    flexDirection: 'row',
    marginTop: 10,
    marginRight: 10,
    padding: 10,
    width: 380,
    backgroundColor: '#031578',
    borderRadius: 8,
   
     alignSelf: 'flex-start'
  },
  Ttotals: {
     color: '#e9f7ef',
     fontSize: 22,
     
  },
  Tsubtotals: {
     color: '#e9f7ef',
     fontSize: 14,
     
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space between items
    alignItems: 'center', // Center items vertically
    marginTop: 0
  },
  buttonContainer: {
    
    marginTop: 10,
  
    alignSelf: 'flex-end', // Centra el botón
  },
  
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#D3D3D3',
    borderRadius: 8,
  },
  numeroF: {
    marginTop: 10,
    marginRight: 20,
    padding: 10,
    fontSize: 18,
  },
  fechaF: {
    marginTop: 10,
    marginRight: 20,
    padding: 10,
    fontSize: 10,
  },
  detalle: {
    marginTop: 20,
  },
  icon: {
    width: 100,
    height: 50,
    resizeMode: 'contain',
  },
 
  serviceInput: {
    flex: 1,
    height: 40,
    borderColor: 'transparent', // No border
    borderWidth: 0,
    marginRight: 10,
    paddingHorizontal: 10,
    width: 200,
       fontSize: 12, // Smaller font size
    placeholderTextColor: 'gray', // Optional: color for placeholder
  },
  priceInput: {
    width: 80, // Adjust width as needed
    height: 40,
    borderColor: 'transparent', // No border
    borderWidth: 0,
    paddingHorizontal: 5,
    fontSize: 14, // Smaller font size
    textAlign: 'center', // Center the dollar sign
  },
  quantityInput: {
    width: 50, // Adjust width as needed
    height: 40,
    borderColor: 'transparent', // No border
    borderWidth: 0,
    paddingHorizontal: 5,
    fontSize: 14, // Smaller font size
    textAlign: 'center', // Center the quantity
  },
 
});



export default NuevaFactura;
