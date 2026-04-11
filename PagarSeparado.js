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

if(abono>totalPrestamo) abono = totalPrestamo;

const tipo = document.getElementById("tipoAbono")?.value || "cuota";

const interesAnual = parseFloat(document.getElementById("interes")?.value)/100 || 0;
const interesMensual = interesAnual/12;

let interesNuevoRestante = 0;

// ✅ aplicar abono correctamente
totalPrestamo -= abono;
capitalPagado += abono;
pagado = capitalPagado + interesPagado;

// ✅ ESTE ES EL SALDO REAL (NO TOCAR MÁS)
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
            </tr>
            `;
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
            </tr>
            `;
            continue;
        }

        const interesMes = saldo * interesMensual;
        let capital = nuevaCuota - interesMes;

        if(capital > saldo) capital = saldo;

        saldo -= capital;
        saldo = Math.max(0,saldo);

        interesCuotas[i] = interesMes;
        capitalCuotas[i] = capital;

        interesNuevoRestante += interesMes;

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
        <button onclick="pagarCuota(${i+1},this)">
        Pagar
        </button>
        </td>
        </tr>
        `;
    }

}else{

/* REDUCIR PLAZO */

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
        </tr>
        `;
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
        </tr>
        `;
        continue;
    }

    const interesMes = saldo * interesMensual;
    let capital = capitalCuotas[i];

    if(capital > saldo) capital = saldo;

    saldo -= capital;
    saldo = Math.max(0,saldo);

    interesCuotas[i] = interesMes;
    capitalCuotas[i] = capital;

    interesNuevoRestante += interesMes;

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
    <button onclick="pagarCuota(${i+1},this)">
    Pagar
    </button>
    </td>
    </tr>
    `;
}
}

/* comparadores (igual que tú) */

let interesDespues = interesPagado;

for(let i=0;i<interesCuotas.length;i++){
    if(!cuotasPagadasEstado[i]){
        interesDespues += interesCuotas[i];
    }
}

let cuotasDespues=0;

for(let i=0;i<capitalCuotas.length;i++){
    if(!cuotasPagadasEstado[i] && capitalCuotas[i]+interesCuotas[i]>0){
        cuotasDespues++;
    }
}

let ahorro = Math.round(interesAntes - interesDespues);
let cuotasReducidas = cuotasAntes - cuotasDespues;

document.getElementById("interesOriginal").innerText="$"+dinero(interesAntes);
document.getElementById("interesConAbono").innerText="$"+dinero(interesDespues);
document.getElementById("ahorroTotal").innerText="$"+dinero(ahorro);
document.getElementById("cuotasReducidas").innerText=cuotasReducidas;

alert("Abono aplicado correctamente");

guardarPrestamo();
actualizarEstado();

}