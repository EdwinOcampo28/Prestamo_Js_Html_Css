// Generar PDF
function generarPDF(){

const { jsPDF } = window.jspdf;

let doc = new jsPDF();

doc.setFontSize(18);
doc.text("Simulación de préstamo",20,20);

doc.setFontSize(12);

doc.text("Total pagado: "+document.getElementById("totalPagado").innerText,20,40);
doc.text("Saldo pendiente: "+document.getElementById("saldoPendiente").innerText,20,50);

let filas = document.querySelectorAll("#tabla tr");

let y=70;

doc.text("Tabla de amortización",20,60);

filas.forEach((fila)=>{

let columnas = fila.querySelectorAll("td");

let texto="";

columnas.forEach((col)=>{
texto+=col.innerText+"   ";
});

doc.text(texto,20,y);

y+=8;

if(y>280){
doc.addPage();
y=20;
}

});

doc.save("prestamo_completo.pdf");

}
  doc.text(
    "Saldo pendiente: " +
      document.getElementById("saldoPendiente").innerText,
    20,
    50
  );

  doc.save("prestamo.pdf");