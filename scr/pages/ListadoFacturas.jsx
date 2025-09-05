import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TextInput, Image, TouchableOpacity, Platform } from 'react-native';
import { Row } from 'react-native-table-component';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import logodr from '../../assets/logodr.png';
import axiosInstance from '../utils/api';
const ListadoFacturas = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // ahora es Date o null
  const [filteredData, setFilteredData] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [vistoIds, setVistoIds] = useState(new Set()); // para marcar vistos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/sige/factura_producto/');
        const sortedData = response.data.sort((a, b) => new Date(b.i502_fec_emision) - new Date(a.i502_fec_emision));
        setData(sortedData);
        setFilteredData(sortedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  const filterItemsByDate = () => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const filtered = data.filter(item => item.i502_fec_emision.startsWith(dateStr));
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };
  const onChangeDate = (event, selected) => {
    setShowDatePicker(Platform.OS === 'ios'); // en android se cierra al seleccionar
    if (selected) {
      setSelectedDate(selected);
    }
  };
  const handleEdit = (documento) => {
    navigation.navigate('EditFactura', { documento });
  };
  const handleDownloadPDF = (documento) => {
    console.log('Download PDF for:', documento);
  };
  const toggleVisto = (id) => {
    setVistoIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  return (
    <View style={styles.container}>
      {/* Logo y razón social */}
      <View style={styles.titleContainer}>
        <Image source={logodr} style={styles.icon} />
        <Text style={styles.razonSocial}>Razón Social Aquí</Text>
      </View>
      {/* Selector de fecha y botón filtrar */}
      <View style={styles.buscarContainer}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
          <Text style={{ color: selectedDate ? '#000' : '#999' }}>
            {selectedDate ? selectedDate.toISOString().split('T')[0] : 'Seleccione fecha'}
          </Text>
        </TouchableOpacity>
        <Button title="Filtrar" onPress={filterItemsByDate} />
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}
      {/* Botones de navegación */}
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
      {/* Lista de facturas */}
      <ScrollView style={{ marginTop: 0 }}>
        {filteredData.map((documento, index) => {
          const isVisto = vistoIds.has(documento.i502_numero);
          return (
            <TouchableOpacity
              key={index}
              style={[styles.documentContainer, isVisto && styles.vistoContainer]}
              onPress={() => toggleVisto(documento.i502_numero)}
              activeOpacity={0.8}
            >
                  <View style={styles.rowFactura}>
                {/* Iconos a la izquierda */}
                <View style={styles.iconosContainer}>
                  <TouchableOpacity onPress={() => handleEdit(documento)} style={styles.iconButton}>
                    <Icon name="edit" size={20} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDownloadPDF(documento)} style={styles.iconButton}>
                    <Icon name="file-pdf-o" size={20} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
                 {/* Texto a la derecha */}
                <View style={styles.textContainer}>
                  <Text style={styles.clientName}>{documento.nombre_cliente}</Text>
                  <View style={styles.textContainer2}>
                      <Text style={styles.emissionDate}>Fecha: {documento.i502_fec_emision}</Text>
                      <Text style={styles.emissionDate}>  No.{documento.i502_numero}</Text>
                   </View>
                </View>
                {/* Total a la derecha */}
                <Text style={styles.total}>{`$${documento.i502_total}`}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
        </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    flex: 1,
    padding: 21,
    backgroundColor: '#fff',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 15,
  },
  icon: {
    width: 141,
    height: 111,
    resizeMode: 'contain',
  },
   razonSocial: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#031578',
  },
  buscarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
    flex: 1,
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
    marginHorizontal: 5,
  },
  buttonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#e9f7ef',
  },
   documentContainer: {
    marginTop: 5,
    marginRight: 5,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e9f7ef',
  },
  vistoContainer: {
    backgroundColor: '#ffa500', // naranja
  },
  rowFactura: {
    flexDirection: 'row',
    alignItems: 'center',
  },
   iconosContainer: {
    flexDirection: 'row',
    width: 70,
    justifyContent: 'space-around',
  },
  iconButton: {
    paddingHorizontal: 5,
  },
  textContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  textContainer2: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 10,
  },
   clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#031578',
  },
  emissionDate: {
    fontSize: 12,
    color: '#555',
  },
  total: {
    fontSize: 22,
    color: '#f5ac40ff',
    
  },
  });
export default ListadoFacturas;