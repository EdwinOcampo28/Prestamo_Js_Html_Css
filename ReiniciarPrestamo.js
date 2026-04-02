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