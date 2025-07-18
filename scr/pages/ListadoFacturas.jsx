import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ScrollView, TextInput, Image, TouchableOpacity } from 'react-native';
import { Table, Row } from 'react-native-table-component';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importing FontAwesome icons

import logos from '../../assets/logo.png';
import axiosInstance from '../utils/api';

const ListadoFacturas = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const tableHead = ['Fecha', 'Documento', 'Nombre del Cliente', 'Subtotal', 'IVA', 'Total', 'Acciones'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        //const response = await axios.get('http://localhost:8000/productos?db=cliente1'); // Cambia la URL según tu configuración
        const response = await axiosInstance.get('/sige/factura_producto/');
        setData(response.data);
        setFilteredData(response.data); // Initialize filtered data with all data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filterItemsByDate = () => {
    if (selectedDate) {
      const filtered = data.filter(item => item.fecha_emision === selectedDate);
      setFilteredData(filtered);
    } else {
      setFilteredData(data); // Reset to all data if no date is selected
    }
  };

  const handleEdit = (documento) => {
    // Navigate to edit screen with the selected document
    navigation.navigate('EditFactura', { documento });
  };

  const handleDownloadPDF = (documento) => {
    // Logic to download PDF
    console.log('Download PDF for:', documento);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Image source={logos} style={styles.icon} />
        <Text style={styles.title}>Dr. Cabrera</Text>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuIcon}>
          <Icon name="bars" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Ingrese la fecha (YYYY-MM-DD)"
        value={selectedDate}
        onChangeText={setSelectedDate}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <Button title="Filtrar"  style={styles.button} onPress={filterItemsByDate} />
      <ScrollView horizontal>
        <View >
          {filteredData.map((documento, index) => (
            <View key={index} style={styles.documentContainer}>
              {/* First Row: Document Number, Client Name, Emission Date */}
                <Row 
                data={[
                  <Text style={styles.clientName}>{documento.nombre_cliente}</Text>, // Client Name
                  <Text style={styles.emissionDate}>Fecha: {documento.i502_fec_emision}</Text> // Emission Date
                 ]} 
                style={styles.row} 
                textStyle={styles.text} 
                widthArr={[270,80]} // Adjust widths as needed
              />
              <Row 
                data={[
                  <Text style={styles.clientci}>{documento.i502_cliente}</Text>, // Client Name
                  <Text style={styles.total}>{`$${documento.i502_total}`}</Text>, // Total formatted as currency
                
                ]} 
                style={styles.row} 
                textStyle={styles.text} 
                widthArr={[290, 100]} // Adjust widths as needed
              />
              
              {/* Second Row: Total, Subtotal, VAT */}
              <Row 
                data={[
                  <Text style={styles.documentNumber}>Nro: {documento.i502_numero}</Text>, // Document Number
                  <View style={styles.actionContainer}>
                    <TouchableOpacity onPress={() => handleEdit(documento)}>
                      <Icon name="edit" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDownloadPDF(documento)}>
                      <Icon name="file-pdf-o" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                ]} 
                style={styles.row} 
                textStyle={styles.text} 
                widthArr={[290, 50, 50]} // Adjust widths as needed
              />
              
              {/* Third Row: Action Icons */}
            
              <View style={styles.separator} />
            </View>
             
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('NuevaFactura')}>
          <Icon name="plus" size={20} color="#e9f7ef" />
          <Text style={styles.buttonText}>Nuevo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Pacientes')}>
          <Icon name="users" size={20} color="#e9f7ef" />
          <Text style={styles.buttonText}>Pacientes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Reportes')}>
          <Icon name="file-text" size={20} color="#e9f7ef" />
          <Text style={styles.buttonText}>Reportes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  head: {
    height: 40,
    backgroundColor: '#f1f8ff',
  },
  row: {
    height: 30,
    backgroundColor: '#e9f7ef',
  },
  text: {
    margin: 6,
  },
  icon: {
    left: 5,
    width: 181,
    height: 45,
    marginRight: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 11,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#031578',
    
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5, // Add margin to separate buttons
  },
  buttonText: {
    marginLeft: 5, // Space between icon and text
    fontSize: 16,
   color: '#e9f7ef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  menuIcon: {
    marginLeft: 10,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  clientName: {
    fontSize: 12, // Larger font size for client name
    fontWeight: 'bold',
  },
  clientci: {
    fontSize: 11, // Larger font size for client name
    
  },
  total: {
    fontSize: 20, // Regular font size for total
    color: '#1e2460', // Highlighted color for total
  },
  emissionDate: {
    fontSize: 11, // Regular font size for emission date
  },
  documentNumber: {
    fontSize: 12, // Smaller font size for document number
  },
  documentContainer: {
  marginTop: 10, // Reducido de 40 a 10
  marginRight: 10, // Reducido de 30 a 10
  padding: 10, // Reducido de 20 a 10
  width: 480,
  borderRadius: 8,
  alignSelf: 'flex-end',
  backgroundColor: '#e9f7ef'//'#dde8cb',
  },
separator: {
  height: 1,
  backgroundColor: '#ccc', // Color of the separator line
  marginVertical: 10, // Space above and below the line
},
  
});

export default ListadoFacturas;
