function recalcularCuota({saldo, interesMensual, tabla, fechaBase, diaPago}){

    let cuotasRestantes = 0;
    for(let i=0;i<cuotasTotales;i++){
        if(!cuotasPagadasEstado[i]) cuotasRestantes++;
    }

    if(cuotasRestantes <= 0) return saldo;

    let nuevaCuota;

    if(interesMensual === 0){
        nuevaCuota = saldo / cuotasRestantes;
    }else{
        nuevaCuota = saldo *
        (interesMensual*Math.pow(1+interesMensual,cuotasRestantes)) /
        (Math.pow(1+interesMensual,cuotasRestantes)-1);
    }

    for(let i=0;i<cuotasTotales;i++){

        const fechaTexto = generarFecha(fechaBase, i, diaPago);

        if(cuotasPagadasEstado[i]){
            renderFilaPagada(tabla, i, fechaTexto);
            continue;
        }

        if(saldo <= 0){
            renderFilaCancelada(tabla, i, fechaTexto);
            continue;
        }

        const interesMes = saldo * interesMensual;
        let capital = nuevaCuota - interesMes;

        if(capital > saldo || i === cuotasTotales-1){
            capital = saldo;
        }

        saldo -= capital;
        saldo = Math.max(0,saldo);

        interesCuotas[i] = interesMes;
        capitalCuotas[i] = capital;

        renderFilaPendiente(tabla, i, fechaTexto, capital, interesMes, saldo);
    }

    return saldo;
}