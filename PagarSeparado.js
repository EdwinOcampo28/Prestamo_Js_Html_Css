function pagarSeparado(){

let interesAntes = interesPagado;

for(let i=0;i<interesCuotas.length;i++){
    if(!cuotasPagadasEstado[i]){
        interesAntes += interesCuotas[i];
    }
}

let cuotasAntes = 0;

for(let i=0;i<capitalCuotas.length;i++){
    if(!cuotasPagadasEstado[i]){
        cuotasAntes++;
    }
}

let abono = parseFloat(document.getElementById("abonoCapital")?.value);

if(!abono || abono<=0 || isNaN(abono)){
    alert("Ingresa un valor de abono");
    return;
}

if(abono > totalPrestamo){
    alert("El abono no puede ser mayor al saldo pendiente ($" + dinero(totalPrestamo) + ")");
    return;
}

/* =========================
   🔥 DETECTOR AUTOMÁTICO
========================= */
const EPSILON = 1;
let tipoOperacion = "normal";

if(abono >= totalPrestamo - EPSILON){
    tipoOperacion = "liquidacion_total";
}

/* =========================
   APLICAR ABONO
========================= */

if(tipoOperacion === "liquidacion_total"){
    abono = totalPrestamo; // 🔥 exactitud total
}

totalPrestamo -= abono;
totalPrestamo = Math.max(0,totalPrestamo);

capitalPagado += abono;
pagado = capitalPagado + interesPagado;

/* =========================
   🔥 LIQUIDACIÓN TOTAL
========================= */
if(tipoOperacion === "liquidacion_total"){

    let interesRestanteAntes = 0;

    for(let i=0;i<interesCuotas.length;i++){
        if(!cuotasPagadasEstado[i]){
            interesRestanteAntes += interesCuotas[i];
        }
    }

    for(let i=0;i<cuotasTotales;i++){
        if(!cuotasPagadasEstado[i]){
            cuotasPagadasEstado[i] = true;
            capitalCuotas[i] = 0;
            interesCuotas[i] = 0;
        }
    }

    const ahorroTotal = Math.round(interesTotalOriginal - interesPagado);
    const ahorroIndividual = Math.round(interesRestanteAntes);

    actualizarTexto("interesAhorrado", "$" + dinero(ahorroTotal));

    document.getElementById("interesOriginal").innerText="$"+dinero(interesTotalOriginal);
    document.getElementById("interesConAbono").innerText="$"+dinero(interesPagado);
    document.getElementById("ahorroTotal").innerText="$"+dinero(ahorroTotal);
    document.getElementById("cuotasReducidas").innerText =
    cuotasAntes + " cuotas menos (plazo: 0)";

    historialAbonos.push({
        valor: abono,
        fecha: new Date().toLocaleString("es-CO"),
        tipo: "liquidación total",
        ahorro: ahorroIndividual
    });

    reconstruirTabla();
    guardarPrestamo();
    actualizarEstado();
    renderHistorial();

    alert("Préstamo liquidado completamente ✅");

    return;
}

/* =========================
   RECÁLCULO NORMAL
========================= */

const tipo = document.getElementById("tipoAbono")?.value || "cuota";
const interesAnual = parseFloat(document.getElementById("interes")?.value)/100 || 0;
const interesMensual = interesAnual/12;

let saldo = totalPrestamo;

const tabla = document.getElementById("tabla");
if(!tabla) return;

tabla.innerHTML="";

const fechaBase = new Date();

/* =========================
   RECÁLCULO
========================= */

if(tipo==="cuota"){

    const cuotasRestantes = cuotasTotales - cuotasPagadas;

    let nuevaCuota;

    if(interesMensual === 0){
        nuevaCuota = saldo / cuotasRestantes;
    }else{
        nuevaCuota = saldo *
        (interesMensual*Math.pow(1+interesMensual,cuotasRestantes)) /
        (Math.pow(1+interesMensual,cuotasRestantes)-1);
    }

    for(let i=0;i<cuotasTotales;i++){

        const fecha = new Date(fechaBase);
        fecha.setMonth(fecha.getMonth()+(i+1));
        fecha.setDate(parseInt(document.getElementById("diaPago")?.value));

        const fechaTexto = fecha.toLocaleDateString("es-CO");

        if(cuotasPagadasEstado[i]){
            tabla.innerHTML+=`
            <tr class="fila-pagada">
            <td>${i+1}</td>
            <td>${fechaTexto}</td>
            <td>$${dinero(capitalCuotas[i]+interesCuotas[i])}</td>
            <td>$${dinero(interesCuotas[i])}</td>
            <td>$${dinero(capitalCuotas[i])}</td>
            <td>$0</td>
            <td>Pagado</td>
            <td>✔</td>
            </tr>`;
            continue;
        }

        if(saldo <= 0){
            tabla.innerHTML+=`
            <tr class="fila-cancelada">
            <td>${i+1}</td>
            <td>${fechaTexto}</td>
            <td>$0</td>
            <td>$0</td>
            <td>$0</td>
            <td>$0</td>
            <td>Cancelada</td>
            <td>-</td>
            </tr>`;
            continue;
        }

        const interesMes = saldo * interesMensual;
        let capital = nuevaCuota - interesMes;

        if(capital > saldo) capital = saldo;

        saldo -= capital;
        saldo = Math.max(0,saldo);

        interesCuotas[i] = interesMes;
        capitalCuotas[i] = capital;

        tabla.innerHTML+=`
        <tr id="fila${i+1}">
        <td>${i+1}</td>
        <td>${fechaTexto}</td>
        <td>$${dinero(Math.round(capital+interesMes))}</td>
        <td>$${dinero(Math.round(interesMes))}</td>
        <td>$${dinero(Math.round(capital))}</td>
        <td>$${dinero(Math.round(saldo))}</td>
        <td id="estado${i + 1}">Pendiente</td>
        <td>
        <button onclick="pagarCuota(${i+1},this)">Pagar</button>
        </td>
        </tr>`;
    }

}else{

for(let i=0;i<cuotasTotales;i++){

    const fecha = new Date(fechaBase);
    fecha.setMonth(fecha.getMonth()+(i+1));
    fecha.setDate(parseInt(document.getElementById("diaPago")?.value));

    const fechaTexto = fecha.toLocaleDateString("es-CO");

    if(cuotasPagadasEstado[i]){
        tabla.innerHTML+=`
        <tr class="fila-pagada">
        <td>${i+1}</td>
        <td>${fechaTexto}</td>
        <td>$${dinero(capitalCuotas[i]+interesCuotas[i])}</td>
        <td>$${dinero(interesCuotas[i])}</td>
        <td>$${dinero(capitalCuotas[i])}</td>
        <td>$0</td>
        <td>Pagada</td>
        <td>✔</td>
        </tr>`;
        continue;
    }

    if(saldo <= 0){
        tabla.innerHTML+=`
        <tr class="fila-cancelada">
        <td>${i+1}</td>
        <td>${fechaTexto}</td>
        <td>$0</td>
        <td>$0</td>
        <td>$0</td>
        <td>$0</td>
        <td>Cancelada</td>
        <td>-</td>
        </tr>`;
        continue;
    }

    const interesMes = saldo * interesMensual;
    let capital = capitalCuotas[i];

    if(capital > saldo) capital = saldo;

    saldo -= capital;
    saldo = Math.max(0,saldo);

    interesCuotas[i] = interesMes;

    tabla.innerHTML+=`
    <tr id="fila${i+1}">
    <td>${i+1}</td>
    <td>${fechaTexto}</td>
    <td>$${dinero(Math.round(capital+interesMes))}</td>
    <td>$${dinero(Math.round(interesMes))}</td>
    <td>$${dinero(Math.round(capital))}</td>
    <td>$${dinero(Math.round(saldo))}</td>
    <td id="estado${i + 1}">Pendiente</td>
    <td>
    <button onclick="pagarCuota(${i+1},this)">Pagar</button>
    </td>
    </tr>`;
}
}

/* =========================
   COMPARADOR FINAL CORRECTO
========================= */

let interesRestanteNuevo = 0;

for(let i=0;i<interesCuotas.length;i++){
    if(!cuotasPagadasEstado[i]){
        interesRestanteNuevo += interesCuotas[i];
    }
}

let interesTotalNuevo = interesPagado + interesRestanteNuevo;

let ahorro = Math.round(interesTotalOriginal - interesTotalNuevo);
if(ahorro < 0) ahorro = 0;

let ahorroIndividual = Math.round(interesAntes - interesTotalNuevo);
if(ahorroIndividual < 0) ahorroIndividual = 0;

let cuotasDespues = 0;

for(let i=0;i<capitalCuotas.length;i++){
    if(!cuotasPagadasEstado[i] && capitalCuotas[i]+interesCuotas[i]>0){
        cuotasDespues++;
    }
}

let cuotasReducidas = Math.max(0, cuotasAntes - cuotasDespues);

actualizarTexto("interesAhorrado", "$" + dinero(ahorro));

document.getElementById("interesOriginal").innerText="$"+dinero(interesTotalOriginal);
document.getElementById("interesConAbono").innerText="$"+dinero(interesTotalNuevo);
document.getElementById("ahorroTotal").innerText="$"+dinero(ahorro);

document.getElementById("cuotasReducidas").innerText =
cuotasReducidas + " cuotas menos (plazo: " + cuotasDespues + ")";

historialAbonos.push({
  valor: abono,
  fecha: new Date().toLocaleString("es-CO"),
  tipo: tipo,
  ahorro: ahorroIndividual
});

alert("Abono aplicado correctamente");

guardarPrestamo();
actualizarEstado();
renderHistorial();
}