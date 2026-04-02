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