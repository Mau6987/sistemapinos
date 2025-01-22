import React from 'react'
import { BrowserRouter,Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'
import TableUsuarios from './components/tables/TableUsuarios'
import TableCargaAgua from './components/tables/TableCargaAgua'
import TableTipoDeCamion from './components/tables/TableTipoDeCamion'
import ClienteHome from './components/ClienteHome';
import TableEditarPerfil from './components/tables/TablaEditarPerfil';
import TableCargasAguaCliente from './components/tables/TableCargaAguaCliente';
import TableConductoresPropietario from './components/tables/TableConductores';
import TableCargasPropietario  from './components/tables/TableCargasPropietario'
import TablePagosCargaAgua from './components/tables/TablePagosCargaAgua'
import TablePagoCliente from './components/tables/TablePagoCliente'
import TablePagoPropietario from './components/tables/TablePagoPropietario'
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Login/>} />                          
        <Route path='/Home'element={<Home/>}/>
        <Route path='/ClienteHome'element={<ClienteHome/>}/>
        <Route path='/HomePro'element={<ClienteHome/>}/>

        <Route path='/conductores'element={<TableConductoresPropietario/>}/>
        <Route path='/cargasconductores'element={<TableCargasPropietario/>}/>

        <Route path= '/pagos' element={<TablePagosCargaAgua/>}></Route>
        <Route path= '/usuarios' element={<TableUsuarios/>}></Route>
        <Route path= '/cargagua' element={<TableCargaAgua/>}></Route>
        <Route path= '/tiposDeCamion' element={<TableTipoDeCamion/>}></Route>
        <Route path= '/editarperfil' element={<TableEditarPerfil/>}></Route>

        <Route path= '/cargaguaCliente' element={<TableCargasAguaCliente/>}></Route>
        <Route path= '/pagosCliente' element={< TablePagoCliente/>}></Route>
        <Route path= '/pagosConductores' element={<TablePagoPropietario/>}></Route>
      </Routes>
    </BrowserRouter>
    
  )
}
export default AppRoutes