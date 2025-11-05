import React, { useState, useMemo, useEffect } from 'react';
// 🛑 Importar componentes de Bar Chart
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer , Cell } from 'recharts';

// Colores consistentes para los plazos
const PLAZO_COLORS = {
    'Si': '#0088FE',
    'No': '#00C49F',
};

// ----------------------------------------------------
// Función para procesar y filtrar datos (se mantiene igual, es universal)
// ----------------------------------------------------
const useChartData = (data, selectedCoId) => {
    return useMemo(() => {
        // 1. Filtrar por coId si se selecciona uno
        const filteredData = selectedCoId 
            // NOTA: Asumiendo que el campo de filtro es 'coId' o 'idCreator'
            ? data.filter(item => item.coId === selectedCoId)
            : data;

        // 2. Contar la frecuencia de cada plazo en los datos filtrados
        const counts = filteredData.reduce((acc, item) => {
            const plazoKey = `${item.fotoLocal === true ? 'Si' : 'No'}`;
            acc[plazoKey] = (acc[plazoKey] || 0) + 1;
            return acc;
        }, {});

        // 3. Convertir a formato Recharts, aplicando colores y nombres
        // Para el Bar Chart, el formato ideal es: [{ name: 'Plazo X', Registros: 5, color: '#...' }]
        const chartData = Object.keys(counts).map(key => ({
            name: key, 
            Registros: counts[key], // Cambiado de 'value' a 'Registros' para claridad
            color: PLAZO_COLORS[key] || '#999999'
        }));
        
        // El Bar Chart funciona mejor con un solo array que contiene todos los datos.
        // Pero el formato actual es más simple para la visualización de una sola serie de barras.
        return { chartData, totalRecords: filteredData.length };
    }, [data, selectedCoId]); 
};

// ----------------------------------------------------
// Componente principal
// ----------------------------------------------------
const InteractiveFotoXco = ({ suggestions , selectedCoId }) => {
    
    // NOTA: Asumo que selectedCoId viene de un prop externo y contiene la estructura { id: 'value' }
    const coIdToFilter = (selectedCoId && selectedCoId.id) ? selectedCoId.id : '';
    
    // Uso el hook para obtener los datos
    const { chartData, totalRecords } = useChartData(suggestions, coIdToFilter);

    // Opcional: detección de pantalla pequeña
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div style={{ padding: '10px' }}>
            {/* Opcional: Aquí iría tu control de selección (si no lo manejas fuera) */}
            
            <ResponsiveContainer width="100%" height={isMobile ? 310 : 250}>
                {/* 🛑 CAMBIO 1: Usar BarChart */}
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    {/* 🛑 CAMBIO 2: Añadir ejes */}
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                        allowDecimals={false} // Los registros son números enteros
                    />

                    <Tooltip 
                        formatter={(value, name) => [`Registros: ${value}`]}
                    />
                    <Legend />

                    {/* 🛑 CAMBIO 3: Usar el componente Bar */}
                    <Bar dataKey="Registros">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default InteractiveFotoXco;