function aplicarAbono(ctx){

    let {abono, tipoOperacion, cuotasAntes} = ctx;

    if(tipoOperacion === "liquidacion_total"){
        abono = totalPrestamo;
    }

    totalPrestamo -= abono;
    totalPrestamo = Math.max(0,totalPrestamo);

    capitalPagado += abono;
    pagado = capitalPagado + interesPagado;

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

        return "liquidado";
    }

    return "continuar";
}

function pagarSeparado(){

    const contexto = prepararYValidarAbono();
    if(!contexto) return;

    const resultado = aplicarAbono(contexto);
    if(resultado === "liquidado") return;

    recalcularYRenderizar(contexto);
}