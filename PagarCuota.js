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