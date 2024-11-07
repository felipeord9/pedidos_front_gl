import * as MdIcons from "react-icons/md"
import * as AiIcons from "react-icons/ai"
import * as FaIcons from "react-icons/fa"
import * as LiaIcons from "react-icons/lia"
import { MdRequestPage } from "react-icons/md";

export const NavBarData = [
  {
    title: "Mis Pedidos",
    path: "/inicio",
    icon: <MdIcons.MdOutlineInventory />,
    cName: "nav-text",
    access: ['admin', 'vendedor', 'agencia']
  },
  {
    title: "Solicitudes",
    path: "/solicitudes",
    icon: <MdRequestPage  />,
    cName: "nav-text",
    access: ['admin', 'aprobador', 'precios']
  },
  {
    title: "Mis solicitudes", 
    path: "/solicitudes",
    icon: <MdRequestPage  />,
    cName: "nav-text",
    access: ['vendedor','agencia']
  },
  {
    title: "Usuarios",
    path: "/usuarios",
    icon: <AiIcons.AiOutlineUser />,
    cName: "nav-text",
    access: ['admin']
  },
  {
    title: "Clientes POS",
    path: "/pos/clientes",
    icon: <LiaIcons.LiaUsersSolid />,
    cName: "nav-text",
    access: ['admin']
  },
  {
    title: "Sucursales POS",
    path: "/pos/sucursales",
    icon: <AiIcons.AiOutlineBranches />,
    cName: "nav-text",
    access: ['admin']
  },
  {
    title: "Vendedores POS",
    path: "/pos/vendedores",
    icon: <FaIcons.FaUserSecret />,
    cName: "nav-text",
    access: ['admin']
  },
];