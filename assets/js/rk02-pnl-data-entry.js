// =====================================================
// RK02 PNL DATA ENTRY
// FPB DUTY COMMAND CENTER V2
// TEST CONNECTION
// =====================================================


document.addEventListener(
"DOMContentLoaded",
()=>{


console.log(
"RK02 PNL DATA ENTRY LOADED"
);


// Paparan ujian pengguna

const nama =
document.getElementById(
"namaPengguna"
);


if(nama){

nama.textContent =
"ADMIN FPB";

}


const jawatan =
document.getElementById(
"jawatanPengguna"
);


if(jawatan){

jawatan.textContent =
"KETUA UNIT";

}



const peranan =
document.getElementById(
"paparPeranan"
);


if(peranan){

peranan.textContent =
"KETUA UNIT";

}



});
