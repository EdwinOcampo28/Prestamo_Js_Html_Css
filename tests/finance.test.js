const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const context = {
  console,
  document: { addEventListener() {}, getElementById() { return null; } },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  requestAnimationFrame(fn) { fn(); },
  confirm() { return true; }, alert() {}, Blob, URL,
  setTimeout, clearTimeout, Date, Math, Number, String, Array, Object, JSON
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'Calculadora.Js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'PagarCuota.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'recalcularYRenderizar.js'), 'utf8'), context);

function calcularCronograma(monto, tasaMensual, n, tipo = 'cuota', abono = 0) {
  return vm.runInContext(`(() => {
    totalPrestamo = ${monto};
    montoInicial = ${monto};
    interesAnualPrestamo = ${tasaMensual * 12};
    cuotasTotales = ${n};
    capitalCuotas = new Array(cuotasTotales).fill(0);
    interesCuotas = new Array(cuotasTotales).fill(0);
    cuotasPagadasEstado = new Array(cuotasTotales).fill(false);
    const indices = Array.from({length: cuotasTotales}, (_, i) => i);
    actualizarCuotasPendientesPorCuota(indices, ${monto}, ${tasaMensual});
    const inicial = {capital: capitalCuotas.reduce((a,b)=>a+b,0), interes: interesCuotas.reduce((a,b)=>a+b,0), cuota: calcularCuotaNivelada(${monto}, ${tasaMensual}, ${n})};
    if (${abono} > 0) {
      const saldoNuevo = ${monto} - ${abono};
      const activos = Array.from({length: cuotasTotales}, (_, i) => i);
      if ('${tipo}' === 'plazo') actualizarCuotasPendientesPorPlazo(activos, saldoNuevo, ${tasaMensual}, inicial.cuota);
      else actualizarCuotasPendientesPorCuota(activos, saldoNuevo, ${tasaMensual});
    }
    return { capital: capitalCuotas.reduce((a,b)=>a+b,0), interes: interesCuotas.reduce((a,b)=>a+b,0), capitales: [...capitalCuotas], intereses: [...interesCuotas], cuota: inicial.cuota };
  })()`, context);
}

test('la cuota nivelada es positiva y finita con interés', () => {
  const cuota = vm.runInContext('calcularCuotaNivelada(2200000, 0.24 / 12, 29)', context);
  assert.ok(Number.isFinite(cuota) && cuota > 0);
});

test('la amortización suma exactamente el capital original', () => {
  const r = calcularCronograma(2200000, 0.02, 29);
  assert.equal(r.capital, 2200000);
  assert.ok(r.capitales.every(n => Number.isInteger(n) && n >= 0));
  assert.ok(r.intereses.every(n => Number.isInteger(n) && n >= 0));
});

test('un préstamo al 0% no genera intereses y amortiza todo el capital', () => {
  const r = calcularCronograma(1000000, 0, 10);
  assert.equal(r.capital, 1000000);
  assert.equal(r.interes, 0);
  assert.ok(r.capitales.every(n => n >= 0));
});

test('un abono para reducir cuota conserva el capital restante', () => {
  const r = calcularCronograma(2200000, 0.02, 29, 'cuota', 350000);
  assert.equal(r.capital, 1850000);
  assert.ok(r.capitales.every(n => n >= 0));
});

test('un abono para reducir plazo conserva el capital restante', () => {
  const r = calcularCronograma(2200000, 0.02, 29, 'plazo', 350000);
  assert.equal(r.capital, 1850000);
  assert.ok(r.capitales.every(n => n >= 0));
});

test('las fechas no dependen de un día inexistente del mes', () => {
  const fecha = vm.runInContext(`generarFechaObjeto(new Date('2026-01-15T12:00:00'), 0, 31).getDate()`, context);
  assert.equal(fecha, 28);
});

test('el botón de cálculo acepta un préstamo válido sin interés y guarda todo el capital', () => {
  const elements = {
    monto: {value:'1000000'}, interes:{value:'0'}, cuotas:{value:'10'}, diaPago:{value:'31'},
    tipoAbono:{value:'cuota'}, abonoCapital:{value:''}
  };
  const ctx = {
    console, document:{addEventListener(){},getElementById(id){return elements[id] || (elements[id]={value:'',innerText:'',style:{},dataset:{}});}},
    localStorage:{getItem(){return null},setItem(){},removeItem(){}}, requestAnimationFrame(fn){fn()},
    alert(){}, confirm(){return true}, Blob, URL, Date, Math, Number, String, Array, Object, JSON
  };
  vm.createContext(ctx);
  for (const file of ['Calculadora.Js','PagarCuota.js','recalcularYRenderizar.js','Calcular.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx);
  }
  vm.runInContext('reconstruirTabla = () => {}; actualizarEstado = () => {}; guardarPrestamo = () => true; renderHistorial = () => {};',ctx);
  vm.runInContext('calcular()',ctx);
  assert.equal(vm.runInContext('totalPrestamo',ctx),1000000);
  assert.equal(vm.runInContext('capitalCuotas.reduce((a,b)=>a+b,0)',ctx),1000000);
  assert.equal(vm.runInContext('interesCuotas.reduce((a,b)=>a+b,0)',ctx),0);
});

test('el cálculo rechaza cuotas fraccionarias y no cambia el préstamo existente', () => {
  const elements = {monto:{value:'1000000'},interes:{value:'12'},cuotas:{value:'3.5'},diaPago:{value:'15'}};
  let alertas = 0;
  const ctx = {console,document:{addEventListener(){},getElementById(id){return elements[id] || (elements[id]={value:'',innerText:'',style:{},dataset:{}});}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},alert(){alertas++},confirm(){return true},Date,Math,Number,String,Array,Object,JSON,Blob,URL,requestAnimationFrame(fn){fn()}};
  vm.createContext(ctx);
  for (const file of ['Calculadora.Js','PagarCuota.js','recalcularYRenderizar.js','Calcular.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx);
  vm.runInContext('totalPrestamo = 765432',ctx);
  vm.runInContext('reconstruirTabla = () => {}; actualizarEstado = () => {}; guardarPrestamo = () => true; renderHistorial = () => {};',ctx);
  vm.runInContext('calcular()',ctx);
  assert.equal(alertas,1);
  assert.equal(vm.runInContext('totalPrestamo',ctx),765432);
});
