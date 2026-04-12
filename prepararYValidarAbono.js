function prepararYValidarAbono(){

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
        return null;
    }

    if(abono > totalPrestamo){
        alert("El abono no puede ser mayor al saldo pendiente ($" + dinero(totalPrestamo) + ")");
        return null;
    }

    const EPSILON = 1;
    let tipoOperacion = "normal";

    if(abono >= totalPrestamo - EPSILON){
        tipoOperacion = "liquidacion_total";
    }

    return {
        abono,
        tipoOperacion,
        interesAntes,
        cuotasAntes
    };
}