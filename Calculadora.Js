let chart;

let totalPrestamo = 0;
let totalDeuda = 0;
let pagado = 0;

let cuotasTotales = 0;
let cuotasPagadas = 0;

let capitalPagado = 0;
let interesPagado = 0;

let capitalCuotas = [];
let interesCuotas = [];
let cuotasPagadasEstado = [];

function dinero(num){
return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
}

function actualizarEstado(){

let saldoPendiente = totalPrestamo - capitalPagado;
if(saldoPendiente < 0) saldoPendiente = 0;

let progreso = (pagado / totalDeuda) * 100;
if(progreso > 100) progreso = 100;

document.getElementById("saldoPendiente").innerText="$"+dinero(saldoPendiente.toFixed(0));
document.getElementById("capitalPagado").innerText="$"+dinero(capitalPagado.toFixed(0));
document.getElementById("interesPagado").innerText="$"+dinero(interesPagado.toFixed(0));
document.getElementById("totalPagado").innerText="$"+dinero(pagado.toFixed(0));
document.getElementById("progresoPrestamo").innerText=progreso.toFixed(0)+"%";

document.getElementById("barraProgreso").style.width=progreso+"%";
}

function calcular(){

let monto = parseFloat(document.getElementById("monto").value);
let interesAnual = parseFloat(document.getElementById("interes").value) / 100;
let cuotas = parseInt(document.getElementById("cuotas").value);
let diaPago = parseInt(document.getElementById("diaPago").value);

if(isNaN(monto) || isNaN(interesAnual) || isNaN(cuotas) || isNaN(diaPago)){
alert("Completa todos los campos correctamente");
return;
}

totalPrestamo = monto;
cuotasTotales = cuotas;

pagado = 0;
cuotasPagadas = 0;

capitalPagado = 0;
interesPagado = 0;

capitalCuotas = [];
interesCuotas = [];
cuotasPagadasEstado = new Array(cuotas).fill(false);

let interesMensual = interesAnual / 12;

let cuota =
monto *
(interesMensual * Math.pow(1 + interesMensual, cuotas)) /
(Math.pow(1 + interesMensual, cuotas) - 1);

let saldo = monto;

let tabla = document.getElementById("tabla");
tabla.innerHTML="";

let labels = [];
let saldos = [];

let totalInteres = 0;

let fechaBase = new Date();

for(let i=1;i<=cuotas;i++){

let interesMes = saldo * interesMensual;
let capital = cuota - interesMes;

saldo -= capital;
if(saldo < 0) saldo = 0;

capitalCuotas.push(capital);
interesCuotas.push(interesMes);

totalInteres += interesMes;

let fecha = new Date(fechaBase);
fecha.setMonth(fecha.getMonth()+i);
fecha.setDate(diaPago);

let fechaTexto = fecha.toLocaleDateString("es-CO");

let hoy = new Date();

let estado="Pendiente";
let clase="";

if(hoy > fecha){
estado="Vencida";
clase="vencida";
}

labels.push("Cuota "+i);
saldos.push(saldo);

tabla.innerHTML += `
<tr id="fila${i}" class="${clase}">
<td>${i}</td>
<td>${fechaTexto}</td>
<td>$${dinero(cuota.toFixed(0))}</td>
<td>$${dinero(interesMes.toFixed(0))}</td>
<td>$${dinero(capital.toFixed(0))}</td>
<td>$${dinero(saldo.toFixed(0))}</td>
<td id="estado${i}">${estado}</td>
<td>
<button onclick="pagarCuota(${i},this)">Pagar</button>
</td>
</tr>
`;
}

totalDeuda = monto + totalInteres;

if(chart){
chart.destroy();
chart = null;
}

chart = new Chart(document.getElementById("grafica"),{
type:"line",
data:{
labels:labels,
datasets:[
{
label:"Saldo restante",
data:saldos
}
]
}
});

actualizarEstado();
}

function pagarCuota(numero,boton){

if(cuotasPagadasEstado[numero-1]) return;

cuotasPagadasEstado[numero-1]=true;

let capital = capitalCuotas[numero-1];
let interes = interesCuotas[numero-1];

capitalPagado += capital;
interesPagado += interes;

pagado = capitalPagado + interesPagado;

cuotasPagadas++;

document.getElementById("estado"+numero).innerText="Pagada";
boton.disabled=true;

actualizarEstado();
}

function reiniciar(){

document.getElementById("tabla").innerHTML="";

document.getElementById("saldoPendiente").innerText="$0";
document.getElementById("capitalPagado").innerText="$0";
document.getElementById("interesPagado").innerText="$0";
document.getElementById("totalPagado").innerText="$0";
document.getElementById("progresoPrestamo").innerText="0%";

document.getElementById("barraProgreso").style.width="0%";

capitalCuotas=[];
interesCuotas=[];
cuotasPagadasEstado=[];

pagado=0;
cuotasPagadas=0;

capitalPagado=0;
interesPagado=0;

if(chart){
chart.destroy();
chart=null;
}
}

function pagarSeparado(){

let abono = parseFloat(document.getElementById("abonoCapital").value);

if(!abono || abono<=0){
alert("Ingresa un valor de abono");
return;
}

let tipo = document.getElementById("tipoAbono").value;

capitalPagado += abono;
pagado = capitalPagado + interesPagado;

totalPrestamo -= abono;
totalDeuda -= abono;

if(totalPrestamo < 0) totalPrestamo = 0;
if(totalDeuda < 0) totalDeuda = 0;

let interesAnual = parseFloat(document.getElementById("interes").value) / 100;
let interesMensual = interesAnual / 12;

let cuotasRestantes = cuotasTotales - cuotasPagadas;

if(cuotasRestantes <= 0){
alert("El préstamo ya está pagado");
return;
}

let saldo = totalPrestamo;

let labels = [];
let saldos = [];

if(tipo === "cuota"){

let nuevaCuota =
saldo *
(interesMensual * Math.pow(1 + interesMensual, cuotasRestantes)) /
(Math.pow(1 + interesMensual, cuotasRestantes) - 1);

for(let i=cuotasPagadas;i<cuotasTotales;i++){

let interesMes = saldo * interesMensual;
let capital = nuevaCuota - interesMes;

saldo -= capital;
if(saldo < 0) saldo = 0;

capitalCuotas[i] = capital;
interesCuotas[i] = interesMes;

let fila = document.getElementById("fila"+(i+1));
if(!fila) continue;

let celdas = fila.getElementsByTagName("td");

celdas[2].innerText="$"+dinero(nuevaCuota.toFixed(0));
celdas[3].innerText="$"+dinero(interesMes.toFixed(0));
celdas[4].innerText="$"+dinero(capital.toFixed(0));
celdas[5].innerText="$"+dinero(saldo.toFixed(0));

labels.push("Cuota "+(i+1));
saldos.push(saldo);
}
}

if(tipo === "plazo"){

let cuotaOriginal = capitalCuotas[cuotasPagadas] + interesCuotas[cuotasPagadas];

let i = cuotasPagadas;

while(saldo > 0 && i < cuotasTotales){

let interesMes = saldo * interesMensual;
let capital = cuotaOriginal - interesMes;

saldo -= capital;
if(saldo < 0) saldo = 0;

capitalCuotas[i] = capital;
interesCuotas[i] = interesMes;

let fila = document.getElementById("fila"+(i+1));
if(!fila) break;

let celdas = fila.getElementsByTagName("td");

celdas[2].innerText="$"+dinero(cuotaOriginal.toFixed(0));
celdas[3].innerText="$"+dinero(interesMes.toFixed(0));
celdas[4].innerText="$"+dinero(capital.toFixed(0));
celdas[5].innerText="$"+dinero(saldo.toFixed(0));

labels.push("Cuota "+(i+1));
saldos.push(saldo);

i++;
}

cuotasTotales = i;
}

if(chart){
chart.destroy();
}

chart = new Chart(document.getElementById("grafica"),{
type:"line",
data:{
labels:labels,
datasets:[
{
label:"Saldo restante",
data:saldos
}
]
}
});

actualizarEstado();

document.getElementById("abonoCapital").value="";

alert("Abono aplicado correctamente");
}