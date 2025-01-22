import { openDB } from 'idb';

// Inicializar la base de datos
const dbPromise = openDB('app-db', 23, { // Cambia la versión al número más reciente
  upgrade(db, oldVersion) {
    console.log('Actualizando la base de datos...');
    if (!db.objectStoreNames.contains('cargasAguaPropietario')) {
      db.createObjectStore('cargasAguaPropietario', { keyPath: 'id' });
      console.log('Object store "cargasAguaPropietario" creado.');
    }
  

    if (!db.objectStoreNames.contains('perfil')) {
      db.createObjectStore('perfil', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('usuarios')) {
      db.createObjectStore('usuarios', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('tiposDeCamion')) {
      db.createObjectStore('tiposDeCamion', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('cargasAgua')) {
      db.createObjectStore('cargasAgua', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('propietarios')) {
      db.createObjectStore('propietarios', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('pagos')) {
      db.createObjectStore('pagos', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('CargaAguaDeuda')) {
      db.createObjectStore('CargaAguaDeuda', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('cargasAguaCliente')) {
      db.createObjectStore('cargasAguaCliente', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('PagoCliente')) {
      db.createObjectStore('PagoCliente', { keyPath: 'id' });
    }
    
    if (!db.objectStoreNames.contains('Conductores')) {
      db.createObjectStore('Conductores', { keyPath: 'id' });
      console.log('Object store "Conductores" creado.');
    }
    if (!db.objectStoreNames.contains('PagoPropietario')) {
      db.createObjectStore('PagoPropietario', { keyPath: 'id' });
      console.log('Object store "PagoPropietario" creado.');
    }
  },
});
// -------------------- Funciones Generales --------------------

// Guardar un registro en una tabla
export const saveRecord = async (storeName, record) => {
  const db = await dbPromise;
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.put(record);
  await tx.done;
};

// Obtener todos los registros de una tabla
export const getAllRecords = async (storeName) => {
  const db = await dbPromise;
  return db.getAll(storeName);
};

// Eliminar un registro por ID
export const deleteRecord = async (storeName, id) => {
  const db = await dbPromise;
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.delete(id);
  await tx.done;
};

// Obtener un registro por ID
export const getRecordById = async (storeName, id) => {
  const db = await dbPromise;
  return db.get(storeName, id);
};

// -------------------- Funciones Específicas --------------------

// Perfil
export const saveProfile = async (profile) => saveRecord('perfil', profile);
export const getProfile = async () => {
  const idUser = localStorage.getItem('idUser');
  return getRecordById('perfil', idUser);
};

// Tipos de Camión
export const saveTipoCamion = async (tipoCamion) => saveRecord('tiposDeCamion', tipoCamion);
export const getTiposDeCamion = async () => getAllRecords('tiposDeCamion');
export const deleteTipoCamion = async (id) => deleteRecord('tiposDeCamion', id);

// Usuarios
export const saveUsuario = async (usuario) => saveRecord('usuarios', usuario);
export const getUsuarios = async () => getAllRecords('usuarios');
export const deleteUsuario = async (id) => deleteRecord('usuarios', id);

// Cargas de Agua
export const saveCargaAgua = async (cargaAgua) => saveRecord('cargasAgua', cargaAgua);
export const getCargasAgua = async () => getAllRecords('cargasAgua');
export const deleteCargaAgua = async (id) => deleteRecord('cargasAgua', id);
export const getCargaAguaById = async (id) => getRecordById('cargasAgua', id);

// Propietarios
export const savePropietario = async (propietario) => saveRecord('propietarios', propietario);
export const getPropietarios = async () => getAllRecords('propietarios');
export const deletePropietario = async (id) => deleteRecord('propietarios', id);

// Pagos
export const savePagos = async (pagos) => saveRecord('pagos', pagos);
export const getPagos = async () => getAllRecords('pagos');
export const deletePagos = async (id) => deleteRecord('pagos', id);
export const getPagosById = async (id) => getRecordById('pagos', id);

// Carga Agua Deuda
export const saveCargaAguaDeuda = async (cargaAguaDeuda) => saveRecord('CargaAguaDeuda', cargaAguaDeuda);
export const getCargaAguaDeuda = async () => getAllRecords('CargaAguaDeuda');
export const deleteCargaAguaDeuda = async (id) => deleteRecord('CargaAguaDeuda', id);

// Cargas Agua Cliente
export const saveCargaAguaCliente = async (cargaAguaCliente) => {
  const db = await dbPromise;
  if (!db.objectStoreNames.contains('cargasAguaCliente')) {
    console.error('El object store "cargasAguaCliente" no existe');
    return;
  }
  const tx = db.transaction('cargasAguaCliente', 'readwrite');
  await tx.store.put(cargaAguaCliente);
  await tx.done;
};
export const getCargasAguaCliente = async () => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('cargasAguaCliente', 'readonly');
    const records = await tx.store.getAll();
    console.log('Datos desde IndexedDB:', records);
    return records || [];
  } catch (error) {
    console.error('Error al obtener datos de IndexedDB:', error);
    return [];
  }
};

export const deleteCargaAguaCliente = async (id) => deleteRecord('CargaAguaCliente', id);
export const getCargaClienteAguaById = async (id) => getRecordById('CargaAguaCliente', id);

// Guardar datos en IndexedDB
export const  savePagoCliente = async (registro) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('PagoCliente', 'readwrite');
    await tx.store.put(registro);
    await tx.done;
    console.log('Registro guardado en IndexedDB:', registro);
  } catch (error) {
    console.error('Error al guardar el registro en IndexedDB:', error);
  }
};

// -----------------------------------------------------------------------
export const getPagoCliente = async () => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('PagoCliente', 'readonly');
    const records = await tx.store.getAll();
    console.log('Datos obtenidos de IndexedDB:', records);
    return records;
  } catch (error) {
    console.error('Error al obtener datos de IndexedDB:', error);
    return [];
  }
};
// -----------------------------------------------------------------------
export const getCargasAguaPropietario = async () => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('cargasAguaPropietario', 'readonly');
    const records = await tx.store.getAll();
    console.log('Datos obtenidos de IndexedDB:', records);
    return records;
  } catch (error) {
    console.error('Error al obtener datos de IndexedDB:', error);
    return [];
  }
};
export const  saveCargasAguaPropietario = async (registro) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('cargasAguaPropietario', 'readwrite');
    await tx.store.put(registro);
    await tx.done;
    console.log('Registro guardado en IndexedDB:', registro);
  } catch (error) {
    console.error('Error al guardar el registro en IndexedDB:', error);
  }
};
//--------------------------------------------------------------------------------
export const getConductores = async () => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('Conductores', 'readonly');
    const records = await tx.store.getAll();
    console.log('Datos obtenidos de IndexedDB:', records);
    return records;
  } catch (error) {
    console.error('Error al obtener datos de IndexedDB:', error);
    return [];
  }
};
export const saveConductores = async (registro) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('Conductores', 'readwrite');
    await tx.store.put(registro);
    await tx.done;
    console.log('Registro guardado en IndexedDB:', registro);
  } catch (error) {
    console.error('Error al guardar el registro en IndexedDB:', error);
  }
};
//--------------------------------------------------------------------------------
export const getPagoPropietario = async () => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('PagoPropietario', 'readonly');
    const records = await tx.store.getAll();
    console.log('Datos obtenidos de IndexedDB:', records);
    return records;
  } catch (error) {
    console.error('Error al obtener datos de IndexedDB:', error);
    return [];
  }
};
export const savePagoPropietario = async (registro) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('PagoPropietario', 'readwrite');
    await tx.store.put(registro);
    await tx.done;
    console.log('Registro guardado en IndexedDB:', registro);
  } catch (error) {
    console.error('Error al guardar el registro en IndexedDB:', error);
  }
};
