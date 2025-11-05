import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory';

export function DiagramaBarras({ suggestions }) {
    const BarChart = () => (
        <VictoryChart
            height={chartHeight}
            width={chartWidth}
            theme={VictoryTheme.material}
            domainPadding={18}
        >
        <VictoryAxis
            label="Centro de operación"
            style={{
                axisLabel: { padding: 30, fontWeight: "bold" },
                tickLabels: { fontSize: 13, angle: -30, padding: 8 },
            }}
        />
        <VictoryAxis
            dependentAxis
            label="Total"
            tickFormat={(t) => Number.isInteger(t) ? t : null} // 🔹 Solo enteros
            style={{
                axisLabel: { padding: 20, fontWeight: "bold" },
                tickLabels: { fontSize: 13 },
            }}
        />
        <VictoryBar
            data={fullData}
            x="coId"
            y="total"
            style={{
            data: {
                fill: ({ index }) => colors[index % colors.length],
                width: 28,
            },
            labels: { fontSize: 13, fill: "#333" },
            }}
            labels={({ datum }) => datum.total} // 🔹 Mostrar el total (incluso si es 0)
        />
        </VictoryChart>
    );

    const groupedData = useMemo(() => {
        const countMap = {};
        suggestions.forEach(item => {
        countMap[item.coId] = (countMap[item.coId] || 0) + 1;
        });
        // Convertir a formato de arreglo que Recharts entiende
        return Object.entries(countMap).map(([coId, total]) => ({ coId, total }));
    }, []);

    // 🔹 Lista de todos los coId que deben aparecer, en el orden deseado
    const allCoIds = [
        "005", "008", "012", "013", "014", "015", "016", "017",  
        "023", "027", "030", "034", "038", "039",
    ];

    // 🔹 Combinar los datos reales con los faltantes (total = 0)
    const fullData = allCoIds.map((id) => {
        const found = groupedData.find((item) => item.coId === id);
        return found ? found : { coId: id, total: 0 };
    });

    // 🔹 Paleta de colores distinta por barra
    const colors = [
        "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
        "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ab",
        "#86bc86", "#d37295", "#fabfd2", "#9e755f",
    ];

    // 🔹 Detectar si es pantalla pequeña
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 🔹 Dimensiones
    const chartWidth = isMobile ? 700 : 900;
    const chartHeight = isMobile ? 250 : 330;

    return(
        <div 
            className="d-flex p-0 m-0"
            style={{ width: isMobile ? chartWidth : '100%' }}
        >
            <BarChart />
        </div>
    )
}