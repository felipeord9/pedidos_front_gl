import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import "./styles.css";

const styles = StyleSheet.create({
  headerText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  clientText: {
    fontSize: 11,
    textAlign: "left",
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "100%",
    fontSize: 8,
    marginTop: 6,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    fontWeight: 500,
    overflow: "hidden",
    border: "1px solid black",
    padding: "8px 5px",
  },
  columnWidth0: {
    width: "10%",
  },
  columnWidth1: {
    width: "25%",
  },
  columnWidth2: {
    width: "50%",
  },
  columnWidth3: {
    width: "75%",
  },
  columnWidth4: {
    width: "100%",
  },
});

export default function DocOrderPDF({ order }) {
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
        <Page size={"A4"}>
          <View
            style={{
              fontFamily: "Helvetica",
              display: "flex",
              flexDirection: "column",
              padding: "15px",
              textAlign: "left",
            }}
          >
            <View
              style={{
                fontSize: 13,
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Helvetica-Bold",
                  fontWeight: "extrabold",
                }}
              >
                PEDIDO DE VENTA
              </Text>
              <Text style={{ fontSize:8, marginBottom:2, marginTop:5 }}>
                Nota: Este documento no corresponde a una factura
              </Text>
            </View>
            <View style={styles.table}>
              <View style={{ ...styles.tableRow, alignItems: "center" }}>
                <View
                  style={{
                    ...styles.columnWidth3,
                    gap: 4,
                  }}
                >
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>
                    El Gran Langostino S.A.S
                  </Text>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>
                    Nit: 835001216
                  </Text>
                  <Text>Tel: 5584982 - 3155228124</Text>
                </View>
                <View style={styles.columnWidth1}>
                  <View
                    style={{
                      display: "table",
                      border: "1 solid #000",
                    }}
                  >
                    <Text
                      style={{
                        ...styles.tableRow,
                        fontFamily: "Helvetica-Bold",
                        backgroundColor: "#d6d6d6",
                        padding: 5,
                      }}
                    >
                      No.{order?.coId}-PDV-{idParser(order?.rowId)}
                    </Text>
                    <Text style={{ ...styles.tableRow, padding: 3 }}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
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
                marginVertical: 10,
              }}
            ></View>
            <View
              style={{
                ...styles.table,
                padding: 0,
                margin: 0,
              }}
            >
              <View style={{ ...styles.tableRow, gap: 15 }}>
                <View style={styles.columnWidth3}>
                  <View
                    style={{
                      position: "relative",
                      border: 1,
                      borderColor: "#000",
                      borderStyle: "solid",
                      borderRadius: 5,
                      padding: 7,
                      gap: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Helvetica-Bold",
                        backgroundColor: "#ffffff",
                        position: "absolute",
                        top: "-5px",
                        left: "25px",
                        paddingHorizontal: 10,
                      }}
                    >
                      Cliente
                    </Text>
                    <Text>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Nombre:{" "}
                      </Text>
                      {order?.clientDescription}
                    </Text>
                    <Text>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
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
                    <Text>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Nit:{" "}
                      </Text>
                      {order?.clientId}
                    </Text>
                  </View>
                </View>
                <View style={styles.columnWidth2}>
                  <View
                    style={{
                      border: 1,
                      borderColor: "#000",
                      borderStyle: "solid",
                      borderRadius: 5,
                      padding: 7,
                    }}
                  >
                    <Text style={{ paddingBottom: 10 }}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        C.O:{" "}
                      </Text>
                      {order?.coId}
                    </Text>
                    <Text style={{ paddingBottom: 10 }}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Orden Compra:{" "}
                      </Text>
                      {order?.purchaseOrder}
                    </Text>
                    <Text style={{ paddingBottom: 10 }}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Fecha Entrega:{" "}
                      </Text>
                      {new Date(order?.deliveryDate).toLocaleString("es-CO")}
                    </Text>
                    <Text style={{ paddingBottom: 5 }}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Vendedor:{" "}
                      </Text>
                      {order?.sellerDescription}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={{
                ...styles.table,
                border: 1,
                borderColor: "#000",
                borderStyle: "solid",
                height: "70%",
              }}
            >
              <View
                style={{
                  ...styles.tableRow,
                  fontFamily: "Helvetica-Bold",
                  backgroundColor: "#d6d6d6",
                }}
              >
                <View style={styles.columnWidth0}>
                  <Text style={styles.tableCell}>Ref.</Text>
                </View>
                <View style={styles.columnWidth2}>
                  <Text style={styles.tableCell}>Descripción</Text>
                </View>
                <View style={styles.columnWidth1}>
                  <Text style={styles.tableCell}>Cantidad</Text>
                </View>
                <View style={styles.columnWidth0}>
                  <Text style={styles.tableCell}>UM</Text>
                </View>
                <View style={styles.columnWidth1}>
                  <Text style={styles.tableCell}>Precio Un</Text>
                </View>
                <View style={{ width: "130px" }}>
                  <Text style={styles.tableCell}>Valor Total</Text>
                </View>
              </View>
              <View style={{ display: "flex", height: "50vh" }}>
                {order?.items.map((elem) => (
                  <View style={styles.tableRow}>
                    <View style={styles.columnWidth0}>
                      <Text style={styles.tableCell}>{elem.id}</Text>
                    </View>
                    <View style={styles.columnWidth2}>
                      <Text style={styles.tableCell}>{elem.description}</Text>
                    </View>
                    <View style={styles.columnWidth1}>
                      <Text style={styles.tableCell}>
                        {elem.OrderProduct.amount}
                      </Text>
                    </View>
                    <View style={styles.columnWidth0}>
                      <Text style={styles.tableCell}>{elem.um}</Text>
                    </View>
                    <View style={styles.columnWidth1}>
                      <Text style={styles.tableCell}>
                        ${formater(elem.OrderProduct.price)}
                      </Text>
                    </View>
                    <View style={{ width: "130px" }}>
                      <Text style={styles.tableCell}>
                        $
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
                backgroundColor: "#d6d6d6",
                fontSize: 8,
                marginBottom: 10,
              }}
            >
              <View style={styles.columnWidth4}>
                <Text style={styles.tableCell}>TOTAL</Text>
              </View>
              <View style={{ width: "109px !important" }}>
                <Text style={styles.tableCell}>${formater(order?.total)}</Text>
              </View>
            </View>
            <View style={{ height: 130, fontSize: 8 }}>
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
                    fontFamily: "Helvetica-Bold",
                    backgroundColor: "#ffffff",
                    position: "absolute",
                    top: "-5px",
                    left: "25px",
                    paddingHorizontal: 10,
                  }}
                >
                  Observaciones
                </Text>
                <Text style={{padding: 10}}>{order?.observations}</Text>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    )
  );
}
