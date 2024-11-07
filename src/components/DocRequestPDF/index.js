import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import "./styles.css";

const styles = StyleSheet.create({
  headerText: {
    fontSize: 8,
    fontWeight: "bold",
  },
  clientText: {
    fontSize: 8,
    textAlign: "left",
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "100%",
    fontSize: 7,
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

export default function DocRequestrPDF({ request }) {

  return (
    request && (
      <Document
        title={`${request?.nitClient}-${(request?.nameClient)}`}
        author="Gran Langostino S.A.S"
        subject="Solicitud Autorización de Precio"
        keywords="Solicitud Autorización de Precio langostino"
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
                fontSize: 7,
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Helvetica-Bold",
                  fontWeight: "extrabold",
                  fontSize:9
                }}
              >
                SOLICITUD AUTORIZACION DE PRECIO
              </Text>
            </View>
            <View style={styles.table}>
              <View style={{ ...styles.tableRow, alignItems: "center" }}>
                <View
                  style={{
                    ...styles.columnWidth3,
                    gap: 4,
                    fontSize:8
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
                <View style={styles.columnWidth2}>
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
                    <Text style={{ paddingBottom: 4 }}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Nombre:{" "}
                      </Text>
                      {request?.nameClient}
                    </Text>
                    <Text style={{ paddingBottom: 4 }}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Nit:{" "}
                      </Text>
                      {request?.nitClient}
                    </Text>
                    <Text style={{ paddingBottom: 4 }}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Sucursal:{" "}
                      </Text>
                      {request?.branchClient}
                    </Text>
                  </View>
                </View>
                <View style={styles.columnWidth2}>
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
                      Remitente
                    </Text>
                    <Text style={{ paddingBottom: 4 }}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Instalación:{" "}
                      </Text>
                      {request?.install}
                    </Text>
                    <Text style={{ paddingBottom: 4 }}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Enviado por:{" "}
                      </Text>
                      {request?.createdBy}
                    </Text>
                    <Text style={{ paddingBottom: 4 }}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Fecha Envio:{" "}
                      </Text>
                      {new Date(request?.createdAt).toLocaleString("es-CO")}
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
                height: "100%",
              }}
            >
              <View
                style={{
                  ...styles.tableRow,
                  fontFamily: "Helvetica-Bold",
                  backgroundColor: "#d6d6d6",
                  fontSize:7
                }}
              >
                <View style={styles.columnWidth0}>
                  <Text style={{fontWeight: 500, overflow: "hidden", border: "1px solid black", padding: "12px 5px"}}>REF.</Text>
                </View>
                <View style={styles.columnWidth2}>
                  <Text style={{fontWeight: 500, overflow: "hidden", border: "1px solid black", padding: "12px 5px"}}>DESCRIPCION</Text>
                </View>
                <View style={{width:'87px' , height:'100%'}}>
                  <Text style={{fontWeight: 500, overflow: "hidden", border: "1px solid black", padding: "12px 5px"}}>CANTIDAD</Text>
                </View>
                <View style={styles.columnWidth0}>
                  <Text style={{fontWeight: 500, overflow: "hidden", border: "1px solid black", padding: "12px 5px"}}>UM</Text>
                </View>
                <View style={{width:'120px'}}>
                  <Text style={styles.tableCell}>COSTO PROMEDIO</Text>
                </View>
                <View style={{width:'120px'}}>
                  <Text style={styles.tableCell}>PRECIO DE LISTA</Text>
                </View>
                <View style={{width:'80px'}}>
                  <Text style={styles.tableCell}>MARGEN ACTUAL</Text>
                </View>
                <View style={{width:'120px'}}>
                  <Text style={styles.tableCell}>PRECIO POR AUTORIZAR</Text>
                </View>
                <View style={{width:'80px'}}>
                  <Text style={styles.tableCell}>NUEVO MARGEN</Text>
                </View>
              </View>
              
              {/* <View style={{ width: "130px" }}>
                  <Text >{JSON.stringify(request)}</Text>
                </View> */}
              
              <View style={{ display: "flex", height: "50vh" }}>
                {request?.items.map((elem) => (
                  <View style={styles.tableRow}>
                    <View style={styles.columnWidth0}>
                      <Text style={styles.tableCell}>{elem.id}</Text>
                    </View>
                    <View style={styles.columnWidth2}>
                      <Text style={styles.tableCell}>{elem.description}</Text>
                    </View>
                    <View style={{width:'87px'}}>
                      <Text style={styles.tableCell}>
                        {elem?.RequestProduct.amount}
                      </Text>
                    </View>
                    <View style={styles.columnWidth0}>
                      <Text style={styles.tableCell}>{elem.um}</Text>
                    </View>
                    <View style={{width:'120px'}}>
                      <Text style={styles.tableCell}>
                        $ {Number(elem?.RequestProduct.cost).toLocaleString()}
                      </Text>
                    </View>
                    <View style={{width:'120px'}}>
                      <Text style={styles.tableCell}>
                        $ {Number(elem?.RequestProduct.price).toLocaleString()}
                      </Text>
                    </View>
                    <View style={{width:'80px'}}>
                      <Text style={styles.tableCell}>
                        {Number(elem?.RequestProduct.currentMargen)} %
                      </Text>
                    </View>
                    <View style={{width:'120px'}}>
                      <Text style={styles.tableCell}>
                        $ {(elem?.RequestProduct.priceAuth).toLocaleString()}
                      </Text>
                    </View>
                    <View style={{width:'80px'}}>
                      <Text style={styles.tableCell}>
                        {Number(elem?.RequestProduct.newMargen)} %
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            {/* <View
              style={{
                ...styles.tableRow,
                backgroundColor: "#d6d6d6",
                fontSize: 7,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  ...styles.tableRow,
                  fontFamily: "Helvetica-Bold",
                  backgroundColor: "#d6d6d6",
                }}
              >
                <View style={styles.columnWidth4}>
                  <Text style={styles.tableCell}>TOTAL</Text>
                </View>
                <View style={{ width: "109px !important" }}>
                  <Text style={styles.tableCell}>${Number(request?.total).toLocaleString()}</Text>
                </View>
              </View>
            </View> */}
            <View style={{ height: 130, fontSize: 7 , marginTop:12}}>
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
                    fontSize:8
                  }}
                >
                  Observaciones
                </Text>
                <Text style={{padding: 10,fontSize:8}}>{request?.observations}</Text>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    )
  );
}
