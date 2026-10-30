/* PRESTAMO WEB · persistencia IndexedDB */
(() => {
 const DB_NAME='prestamo_web_db', VERSION=1;
 const STORES=['usuarios','prestamos','cuotas','abonos','auditoria','solicitudes_prestamo','notificaciones_ocultas'];
 let dbPromise;
 function open(){ if(dbPromise)return dbPromise; dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,VERSION);req.onupgradeneeded=()=>{const db=req.result;for(const name of STORES)if(!db.objectStoreNames.contains(name))db.createObjectStore(name,{keyPath:'id',autoIncrement:true});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});return dbPromise; }
 async function all(store){const db=await open();return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);});}
 async function put(store,row){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite'),r=tx.objectStore(store).put(row);r.onsuccess=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);});}
 async function remove(store,id){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(Number(id));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
 async function clear(store){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
 async function replace(data){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORES,'readwrite');for(const s of STORES){const os=tx.objectStore(s);os.clear();(data[s]||[]).forEach(row=>os.put(row));}tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
 async function seed(){const marker=localStorage.getItem('prestamo_web_seed_v1');if(marker)return;const existing=await all('usuarios');if(existing.length){localStorage.setItem('prestamo_web_seed_v1','1');return;}if(!window.PRESTAMO_INITIAL_DATA)throw new Error('No se encontró el paquete inicial de datos.');await replace(window.PRESTAMO_INITIAL_DATA);localStorage.setItem('prestamo_web_seed_v1','1');}
 window.PrestamoDB={open,all,put,remove,clear,replace,seed,stores:STORES};
})();
