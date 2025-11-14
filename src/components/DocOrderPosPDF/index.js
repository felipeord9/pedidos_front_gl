import { Document, Page, View, Text, StyleSheet , Font } from "@react-pdf/renderer";
import React, { useRef, useEffect, useState } from 'react';
import "./styles.css";

const styles = StyleSheet.create({
  headerText: {
    fontSize: 6,
    fontWeight: "extrabold",
  },
  clientText: {
    fontSize: 6,
    textAlign: "left",
    fontWeight: "extrabold",
  },
  table: {
    display: "table",
    width: "100%",
    fontSize: 6,
    marginTop: 6,
  },
  tableRow: {
    flexDirection: "row",
    fontSize:7.5,
  },
  tableCell: {
    fontWeight: 500,
    overflow: "hidden",
    border: "1px solid black",
    padding: "2px 2px",
  },
  columnWidth0: {
    width: "100%",
  },
  columnWidth1: {
    width: "100%",
  },
  columnWidth2: {
    width: "100%",
  },
  columnWidth3: {
    width: "100%",
    display:'flex',
    flexDirection:'column',
    justifyContent:'space-between'
  },
  columnWidth4: {
    width: "100%",
  },
  textCliente:{
    display:'fixed',
    flexDirection:'column',

  }
});

export default function DocOrderPosPDF({ order }) {
  const formater = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = "$1.";
    let arr = number.toString().split(".");
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join(".") : arr[0];
  };

  const idParser = (id) => {
    let numeroComoTexto = id.toString();
    while (numeroComoTexto.length < 8) {
      numeroComoTexto = "0" + numeroComoTexto;
    }
    return numeroComoTexto;
  };

  const textoRef = useRef(null);
  const [necesitaMargin, setNecesitaMargin] = useState(false);

  useEffect(() => {
    const textoElement = textoRef.current;
    if (textoElement) {
      // Verificar si el texto se desborda
      const desborda = textoElement.clientHeight < textoElement.scrollHeight;
      setNecesitaMargin(desborda);
    }
  }, []);

  const zoom = 1.25;

  return (
    order && (
      <Document
        title={`${order?.coId}-PDV-${idParser(order?.rowId)}`}
        author="Gran Langostino S.A.S"
        subject="Pedido de Venta"
        keywords="pedido venta langostino"
        creator="Gran Langostino S.A.S"
        producer="Gran Langostino S.A.S"
        pageMode="fullScreen"
      >
        <Page size={{width:195}} >
          <View
            style={{
              fontFamily: "Times-Bold",
              color:'#000000',
              display: "flex",
              flexDirection: "column",
              padding: "12px",
              textAlign: "left",
              fontWeight:'bold'
            }}
          >
            <View
              style={{
                fontSize: 9,
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: 'extrabold',
                }}
              >
                PEDIDO DE VENTA
              </Text>
              <Text style={{ fontSize:8, marginBottom:2, marginTop:2 }}>
                Nota: Este documento no corresponde a una factura
              </Text>
            </View>
            <View style={{...styles.table, paddingBottom:0}}>
              <View style={{ flexDirection:'column', alignItems: "center" , paddingBottom:2}}>
                <View
                  style={{
                    ...styles.columnWidth3,
                    gap: 1,
                    fontSize:7.5,
                    
                  }}
                >
                  <Text style={{ fontWeight: 'extrabold' }}>
                    El Gran Langostino S.A.S
                  </Text>
                  <Text style={{ fontWeight: 'extrabold' }}>
                    Nit: 835001216
                  </Text>
                  <Text>Tel: 5584982 - 3155228124</Text>
                </View>
                <View 
                  style={{...styles.columnWidth1, display:'flex' , justifyContent:'flex-end' ,  textAlign: 'right' , paddingBottom:2, marginBottom:0}}
                >
                  <View>
                    <Text
                      style={{
                        ...styles.tableRow,
                        fontWeight: 'extrabold',
                        padding: 3,
                        paddingRight:0,
                        paddingBottom:1,
                        paddingTop:1
                      }}
                    >
                      No.{order?.coId}-PDV-{idParser(order?.rowId)}
                    </Text>
                    <Text style={{ ...styles.tableRow, padding: 1 , paddingRight:0 , paddingTop:1 , paddingBottom:0 }}>
                      <Text style={{ fontWeight: 'extrabold' }}>
                        Fecha:{" "}
                      </Text>
                      {new Date(order?.createdAt).toLocaleString("es-CO")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={{
                border: 1,
                borderColor: "#000",
                borderStyle: "solid",
                marginVertical: 6,
                marginTop:1
              }}
            ></View>
            
            <View
              style={{
                ...styles.table,
                padding: 0,
                margin: 0,
              }}
            >
              <View style={{ flexDirection:'column', gap: 5 }}>
                {/* cliente */}
                <View style={styles.columnWidth3}>
                  <View
                    style={{
                      position: "relative",
                      border: 1,
                      borderColor: "#000",
                      borderStyle: "solid",
                      borderRadius: 5,
                      paddingTop: 2,
                      padding: 5,
                      paddingBottom:3,
                      gap: 1,
                      display:'flex',
                      justifyContent:'space-between',
                      alignContent:'space-between',
                      textAlign:'justify',
                      flexDirection:'column',
                      height:'auto',
                      fontSize:7
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: 'extrabold',
                        backgroundColor: "#ffffff",
                        position: "absolute",
                        top: "-5px",
                        left: "25px",
                        paddingHorizontal: 10,
                        fontSize:7
                      }}
                    >
                      Cliente
                    </Text>
                    <Text style={{ display:'flex', flexDirection:'row' }}>
                      <Text style={{ fontWeight: 'extrabold'}}>
                        Nombre:{" "}
                      </Text>
                      <Text>
                        {order?.clientDescription}
                      </Text>
                    </Text>
                    <Text style={{  }}>
                      <Text style={{ fontWeight: 'extrabold' }}>
                        Sucursal:{" "}
                      </Text>
                      {order?.branchDescription}
                    </Text>  
                    {order.clientPosDescription !== null &&
                      <Text>
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>
                          Cliente POS:{" "}
                        </Text>
                        {order?.clientPosDescription}
                      </Text>
                    } 
                    {order.clientPosDirection !== null &&
                      <Text>
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>
                          Dirección:{" "}
                        </Text>
                        {order?.clientPosDirection}
                      </Text>
                    }
                    <Text style={{ }}>
                      <Text style={{ fontWeight: 'extrabold' }}>
                        Nit:{" "}
                      </Text>
                      {order?.clientId}
                    </Text>
                  </View>
                </View>
                {/* factura */}
                <View style={styles.columnWidth2}>
                  <View
                    style={{
                      border: 1,
                      borderColor: "#000",
                      borderStyle: "solid",
                      borderRadius: 5,
                      padding: 5,
                      paddingTop:0,
                      paddingBottom:3,
                      height:'auto',
                      display:'flex',
                      justifyContent:'space-between',
                      alignItems:'baseline',
                      fontSize:7
                    }}
                  >
                    <Text style={{ paddingBottom: 1 , marginTop:2 }}>
                      <Text style={{ fontWeight: 'extrabold' }}>
                        C.O:{" "}
                      </Text>
                      {order?.coId}
                    </Text>
                    <Text style={{ paddingBottom: 1 }}>
                      <Text style={{ fontWeight: 'extrabold' }}>
                        Orden Compra:{" "}
                      </Text>
                      {order?.purchaseOrder}
                    </Text>
                    <Text style={{ paddingBottom: 1 }}>
                      <Text style={{ fontWeight: 'extrabold'}}>
                        Fecha Entrega:{" "}
                      </Text>
                      {new Date(order?.deliveryDate).toLocaleString("es-CO")}
                    </Text>
                    <Text style={{ paddingBottom: 1 }}>
                      <Text style={{ fontWeight: 'extrabold'}}>
                        Vendedor:{" "}
                      </Text>
                      {order?.sellerDescription}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {/* tabla */}
            <View
              style={{
                ...styles.table,
                border: 1,
                borderColor: "#000",
                borderStyle: "solid",
                height: "auto",
              }}
            >
              <View
                style={{
                  ...styles.tableRow,
                  fontWeight: 'extrabold',
                }}
              >
                <View style={{width:'63%'}}>
                  <Text style={styles.tableCell}>Ref.</Text>
                </View>
                <View style={styles.columnWidth2}>
                  <Text style={styles.tableCell}>Descr.</Text>
                </View>
                <View style={{width:'65%'}}>
                  <Text style={styles.tableCell}>Cant.</Text>
                </View>
                <View style={{width:'55%'}}>
                  <Text style={{...styles.tableCell}}>UM.</Text>
                </View>
                <View style={{ width: "150px" }}>
                  <Text style={styles.tableCell}>Precio</Text>
                </View>
                <View style={styles.columnWidth1}>
                  <Text style={styles.tableCell}>Total</Text>
                </View>
              </View>
              <View style={{ display: "flex", height: "50vh" }}>
                {order?.items.map((elem) => (
                  <View style={styles.tableRow}>
                    <View style={{width:'63%'}}>
                      <Text style={styles.tableCell}>{elem.id}</Text>
                    </View>
                    <View style={styles.columnWidth2}>
                      <Text style={styles.tableCell}>{elem.description}</Text>
                    </View>
                    <View style={{width:'65%'}}>
                      <Text style={styles.tableCell}>
                        {Number(elem.OrderProduct.amount)}
                      </Text>
                    </View>
                    <View style={{width:'55%'}}>
                      <Text style={{...styles.tableCell}}>{elem.um}</Text>
                    </View>
                    <View style={{ width: "150px" }}>
                      <Text style={styles.tableCell}>
                        {formater(elem.OrderProduct.price)}
                      </Text>
                    </View>
                    <View style={styles.columnWidth1}>
                      <Text style={styles.tableCell}>
                        {formater(
                          parseFloat(elem.OrderProduct.amount) *
                            parseInt(elem.OrderProduct.price)
                        )}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <View
              style={{
                ...styles.tableRow,
                fontSize: 7,
                marginBottom: 10,
              }}
            >
              <View style={styles.columnWidth4}>
                <Text style={{...styles.tableCell, paddingTop:3, fontSize:7.2}}>TOTAL</Text>
              </View>
              <View style={{ width: "109px !important" , height:40 }}>
                <Text style={{...styles.tableCell, paddingTop:3, fontSize:7.2 }}>${formater(order?.total)}</Text>
              </View>
            </View>
            <View style={{ height: 'auto', fontSize: 8 }}>
              <View
                style={{
                  position: "relative",
                  border: 1,
                  borderColor: "#000",
                  borderStyle: "solid",
                  borderRadius: 5,
                }}
              >
                <Text
                  style={{
                    fontWeight: 'extrabold',
                    backgroundColor: "#ffffff",
                    position: "absolute",
                    top: "-5px",
                    left: "25px",
                    paddingHorizontal: 10,
                  }}
                >
                  Observaciones
                </Text>
                <Text style={{padding: 5 , fontSize: 8}}>{order?.observations}</Text>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    )
  );
}
