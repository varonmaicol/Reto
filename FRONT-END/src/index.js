// Importaciones necesarias para inicializar la aplicación React
import React from 'react'; // Biblioteca React
import ReactDOM from 'react-dom/client'; // API de React para renderizar en el DOM
import './index.css'; // Estilos globales
import App from './App'; // Componente principal

// Crea el root de React apuntando al elemento con id 'root'
const root = ReactDOM.createRoot(document.getElementById('root'));
// Renderiza la aplicación en modo estricto para detectar problemas
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);