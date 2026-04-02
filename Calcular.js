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