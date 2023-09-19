import * as MdIcons from "react-icons/md"
import * as TbIcons from "react-icons/tb"

export const NavBarData = [
  {
    title: "Mis Pedidos",
    path: "/inicio",
    icon: <MdIcons.MdOutlineInventory />,
    cName: "nav-text",
    access: ['admin', 'vendedor', 'agencia']
  },
  {
    title: "Usuarios",
    path: "/usuarios",
    icon: <TbIcons.TbFileInvoice />,
    cName: "nav-text",
    access: ['admin']
  },
];