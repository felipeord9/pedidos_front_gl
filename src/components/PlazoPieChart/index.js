import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from 'recharts';

const processPlazoData = (data) => {
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; 
  const counts = data.reduce((acc, item) => {
    const plazoKey = `${item.plazo} día(s)`;
    acc[plazoKey] = (acc[plazoKey] || { value: 0, color: '' });
    acc[plazoKey].value += 1;
    if (!acc[plazoKey].color) acc[plazoKey].color = colors[Object.keys(acc).length - 1]; // Asignar color dinámicamente
    return acc;
  }, {});
  
  // Convertir a array de objetos, añadiendo el nombre
  return Object.keys(counts).map(key => ({ 
      name: key, 
      value: counts[key].value,
      color: counts[key].color
  }));
};

const PlazoPieChart = ({ suggestions }) => {
  const chartData = processPlazoData(suggestions);
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // 🔹 Detectar si es pantalla pequeña
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return (
    <div className='mt-1'>
      <h6>Reporte de plazo por pedido</h6>
      <ResponsiveContainer width="100%" height={isMobile ? 310 : 250}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%" // Centro X
            cy="50%" // Centro Y
            outerRadius={100}
            fill="#8884d8"
            labelLine={false}
            label={renderCustomizedLabel} // Etiqueta con porcentaje
          >
            {/* Asignar el color a cada segmento usando la propiedad 'color' de los datos */}
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`Registros: ${value}`, name]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlazoPieChart;