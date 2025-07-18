import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//scr\pages

import NuevaFactura from './scr/pages/NuevaFactura';
//C:\FRONTEND\sige-vtas\facVtaSer\scr\pages\ListadoFacturas.jsx
import ListadoFacturas from './scr/pages/ListadoFacturas'

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ListadoFacturas">
        <Stack.Screen name="ListadoFacturas" component={ListadoFacturas} />
        <Stack.Screen name="NuevaFactura" component={NuevaFactura} />
      </Stack.Navigator>
    </NavigationContainer>
  );w
};

export default App;