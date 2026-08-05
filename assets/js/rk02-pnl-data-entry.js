// =====================================================
// RK02-PNL-DATA-ENTRY.JS
// FPB DUTY COMMAND CENTER V2
// PART 1/3
// =====================================================


// =====================================================
// GLOBAL
// =====================================================

let pengguna = null;

let dataAnggota = [];
let dataOrganisasi=[];
let dataPosKawalan = [];
let dataOperasiPos = null;



// =====================================================
// SENARAI BULAN
// =====================================================

const SENARAI_BULAN = [

    "",
    "JANUARI",
    "FEBRUARI",
    "MAC",
    "APRIL",
    "MEI",
    "JUN",
    "JULAI",
    "OGOS",
    "SEPTEMBER",
    "OKTOBER",
    "NOVEMBER",
    "DISEMBER"

];




// =====================================================
// DOM READY
// =====================================================

document.addEventListener(

"DOMContentLoaded",

async()=>{


console.log(
"RK02 & PNL SYSTEM READY"
);


await mula();


}

);





// =====================================================
// MULA SISTEM
// =====================================================

async function mula(){


try{


    bacaPengguna();


    tetapkanBulanSemasa();


    pasangEventUtama();



    await muatPosKawalan();


    isiDropdownHeaderPos();



    await muatAnggota();



    paparJadualRK02();


    paparPosTampungan();



    kiraSemua();



    console.log(
    "RK02 SYSTEM BERJAYA DIMULAKAN"
    );


}


catch(error){


    console.error(
    "RALAT SISTEM:",
    error
    );


    alert(
    "Sistem gagal dimulakan"
    );


}


}





// =====================================================
// BACA PENGGUNA LOGIN
// =====================================================

function bacaPengguna(){


const data =

localStorage.getItem("pengguna")
||
localStorage.getItem("currentUser");



if(!data){

console.warn(
"TIADA DATA PENGGUNA"
);

return;

}



try{


pengguna = JSON.parse(data);



console.log(
"DATA KETUA POS:",
pengguna
);



}

catch(error){


console.error(
"DATA PENGGUNA ROSAK",
error
);


pengguna=null;


}




// papar maklumat header

setText(
"namaPengguna",
pengguna.nama || "-"
);



setText(
"jawatanPengguna",
pengguna.jawatan || "-"
);



setText(
"unitPengguna",
pengguna.unit || "-"
);



setText(
"kodNamaPos",
pengguna.poskhidmat || "-"
);



}






// =====================================================
// BULAN SEMASA
// =====================================================

function tetapkanBulanSemasa(){



const sekarang = new Date();


const bulan =
sekarang.getMonth()+1;


const tahun =
sekarang.getFullYear();





const elBulan =
document.getElementById(
"bulan"
);



const elTahun =
document.getElementById(
"tahun"
);




if(elBulan){


    elBulan.value =
    String(bulan);


}





if(elTahun){


    elTahun.value =
    String(tahun);


}



}







// =====================================================
// LOAD POS KAWALAN
// TABLE : data_pos
// FIELD : pos_kawalan
// =====================================================

async function muatPosKawalan(){



const {

data,

error

}= await supabaseClient

.from("data_pos")

.select(`
    pos_kawalan,
    atur_tugas,
    jam_sehari_pb,
    jam_sehari_ppb,
    kadar_rm_sehari_pb,
    kadar_rm_sehari_ppb
`)

.order(
"pos_kawalan",
{
ascending:true
}
);




if(error){

throw error;

}




dataPosKawalan =


[...new Set(

(data||[])

.map(

x=>

String(
x.pos_kawalan||""
)

.trim()


)

.filter(
x=>x!=""
)

)];




console.log(
"POS KAWALAN:",
dataPosKawalan
);



}






// =====================================================
// LOAD ANGGOTA
// FILTER:
// 1. UNIT
// 2. POS KETUA POS
// =====================================================

async function muatAnggota(){

console.log(
"MULA LOAD ANGGOTA"
);


// ===============================
// MAKLUMAT LOGIN
// ===============================

const unit = pengguna?.unit || "";

const jawatan =
String(
pengguna?.jawatan || ""
)
.toUpperCase();


const posKhidmat =
pengguna?.poskhidmat || "";



console.log(
"UNIT PENGGUNA:",
unit
);


console.log(
"JAWATAN:",
jawatan
);


console.log(
"POS KETUA POS:",
posKhidmat
);



// ===============================
// LOAD ANGGOTA
// ===============================


let query = supabaseClient

.from("Data_Anggota")

.select(`
*
`)

.eq(
"unit",
unit
);



if(
jawatan.includes("KETUA POS")
){

query =
query.eq(
"poskhidmat",
posKhidmat
);

}



const {

data,

error

}= await query

.order(
"nama",
{
ascending:true
}
);



if(error){

console.error(
"RALAT ANGGOTA",
error
);

return;

}



dataAnggota =
data || [];



console.log(
"JUMLAH ANGGOTA:",
dataAnggota.length
);


console.log(
"DATA ANGGOTA:",
dataAnggota
);




// ===============================
// LOAD ORGANISASI UNIT
// ===============================


const {

data:organisasi,

error:errOrganisasi

}=await supabaseClient

.from("Data_Anggota")

.select(`
nama,
jawatan,
unit
`)

.eq(
"unit",
unit
);



if(errOrganisasi){

console.error(
"RALAT ORGANISASI",
errOrganisasi
);

}



dataOrganisasi =
organisasi || [];



console.log(
"DATA ORGANISASI:",
dataOrganisasi
);




// ===============================
// PAPAR MAKLUMAT
// ===============================


paparMaklumatKetua();

kemasKiniMaklumatOperasi();



}





// =====================================================
// PAPAR KETUA POS / UNIT
// =====================================================


function paparMaklumatKetua(){



const ketuaPos =

pengguna?.nama

||

"-";



setText(
"namaKetuaPos",
ketuaPos
);



setText(
"ketuaPos",
ketuaPos
);






const ketuaUnit =

dataOrganisasi.find(

x =>

String(
x.jawatan || ""
)

.toUpperCase()

.includes(
"KETUA UNIT"
)

)?.nama

||

"-";





setText(
"namaKetuaUnit",
ketuaUnit
);



setText(
"ketuaUnit",
ketuaUnit
);



console.log(
"KETUA UNIT:",
ketuaUnit
);



}





// =====================================================
// MAKLUMAT OPERASI
// =====================================================


function kemasKiniMaklumatOperasi(){



const pos =

pengguna?.poskhidmat

||

"-";



setText(
"kodNamaPos",
pos
);



setText(
"namaPos",
pos
);



setText(
"bilanganAnggota",

dataAnggota.length +
" ORANG"

);



}

function binaInputJamPos(
nomborPos,
noSkb
){

return `

<td>

<input

type="number"

min="0"

step="1"

value="0"

class="jam-pos"

data-pos="${nomborPos}"

data-skb="${noSkb}"

>

</td>

`;
// =================================================
// DATA OPERASI
// =================================================


const jamPB = nombor(
    data.jam_sehari_pb
);


const jamPPB = nombor(
    data.jam_sehari_ppb
);


const jamSehari = 
jamPB + jamPPB;



const rmPB = nombor(
    data.kadar_rm_sehari_pb
);


const rmPPB = nombor(
    data.kadar_rm_sehari_ppb
);


const jumlahRM =
rmPB + rmPPB;



// ===============================
// JAM KHIDMAT SEHARI
// ===============================

setText(
"jamKhidmatSehari",
formatNombor(jamSehari) + " JAM"
);



// ===============================
// JAM PB
// ===============================

setText(
"jamKhidmatPB",
formatNombor(jamPB) + " JAM"
);



// ===============================
// JAM PPB
// ===============================

setText(
"jamKhidmatPPB",
formatNombor(jamPPB) + " JAM"
);



// ===============================
// ATUR TUGAS
// ===============================

setText(
"aturTugas",
data.atur_tugas || "-"
);



// ===============================
// JUMLAH JAM SEBULAN
// ===============================

kiraJamBulanan(
jamSehari
);



// ===============================
// PENDAPATAN
// ===============================

setText(
"pendapatanPB",
formatRM(rmPB)
);



setText(
"pendapatanPPB",
formatRM(rmPPB)
);



setText(
"jumlahPendapatan",
formatRM(jumlahRM)
);
}

// =====================================================
// PAPAR JADUAL RK02
// =====================================================

function paparJadualRK02(){



const tbody =

document.getElementById(
"rk02TableBody"
);





if(!tbody){

return;

}





tbody.innerHTML="";





if(dataAnggota.length===0){



tbody.innerHTML=

`

<tr>

<td colspan="13">

TIADA DATA ANGGOTA

</td>

</tr>

`;

return;


}





dataAnggota.forEach(

(anggota,index)=>{



const noSkb =

anggota.noskb

||

anggota.noanggota

||

"";






const row =

document.createElement(
"tr"
);




row.innerHTML =

`

<td>
${index+1}
</td>


<td>
${escapeHtml(noSkb)}
</td>


<td>
${escapeHtml(anggota.nama)}
</td>


${binaInputRK02("hariBiasa",noSkb)}

${binaInputRK02("jamKlmBiasa",noSkb)}

${binaInputRK02("off4",noSkb)}

${binaInputRK02("off48",noSkb)}

${binaInputRK02("off8",noSkb)}

${binaInputRK02("cuti8",noSkb)}

${binaInputRK02("cuti8P",noSkb)}

${binaInputRK02("cuti8L",noSkb)}

${binaInputRK02("jamEskot",noSkb)}

${binaInputRK02("klmEskot",noSkb)}



<td data-total-jam="${noSkb}">
0
</td>


<td data-total-rm="${noSkb}">
RM 0.00
</td>

`;



tbody.appendChild(row);



});





pasangEventRK02();



}






// =====================================================
// BINA INPUT RK02
// =====================================================

function binaInputRK02(

jenis,

noSkb

){


return`

<td>

<input

type="number"

min="0"

step="1"

value="0"

class="rk02-input"

data-jenis="${jenis}"

data-no-skb="${escapeHtml(noSkb)}"

>

</td>

`;

}


// =====================================================
// PART 2/3
// RK02 INPUT + POS TAMPUNGAN
// =====================================================



// =====================================================
// EVENT INPUT RK02
// =====================================================

function pasangEventRK02(){


document

.querySelectorAll(
".rk02-input"
)

.forEach(

input=>{


input.addEventListener(

"input",

()=>{


kiraSemua();


}


);


}

);


}






// =====================================================
// PAPAR POS TAMPUNGAN
// =====================================================

function paparPosTampungan(){


const tbody =
document.getElementById(
"posTampunganTableBody"
);


if(!tbody) return;


tbody.innerHTML="";



dataAnggota.forEach(
(anggota,index)=>{


const noSkb =
anggota.noskb ||
anggota.noanggota ||
"";



tbody.innerHTML += `

<tr>

<td>
${index+1}
</td>


<td>
${escapeHtml(noSkb)}
</td>


<td class="name-cell">
${escapeHtml(anggota.nama)}
</td>



${binaInputJamPos(1,noSkb)}

${binaInputJamPos(2,noSkb)}

${binaInputJamPos(3,noSkb)}

${binaInputJamPos(4,noSkb)}

${binaInputJamPos(5,noSkb)}

${binaInputJamPos(6,noSkb)}



<td>
<input 
type="number"
class="input-tampungan"
data-jenis="eskot"
value="0">
</td>


<td>
<input 
type="number"
class="input-tampungan"
data-jenis="cit"
value="0">
</td>


<td>
<input 
type="number"
class="input-tampungan"
data-jenis="kawalanTambahan"
value="0">
</td>


<td>
<input 
type="number"
class="input-tampungan"
data-jenis="kawalanWang"
value="0">
</td>


<td>
<input 
type="number"
class="input-tampungan"
data-jenis="pemandu"
value="0">
</td>


</tr>

`;



}


);



pasangEventPosTampungan();


}

// =====================================================
// DROPDOWN POS 1 - 6
// =====================================================

function binaDropdownPos(
nomborPos,
noSkb
){


let html = `

<td>

<select

class="input-pos-tampungan"

data-pos="${nomborPos}"

data-skb="${noSkb}"

>

<option value="">
-- PILIH POS --
</option>
`;


dataPosKawalan.forEach(
(pos)=>{


html += `

<option value="${escapeHtml(pos)}">

${escapeHtml(pos)}

</option>

`;



});


html += `

</select>

</td>

`;


return html;


}




// =====================================================
// INPUT TAMBAHAN
// =====================================================

function binaInputTampungan(

jenis,

noSkb

){



return

`

<td>

<input

type="number"

min="0"

step="1"

value="0"

class="input-tampungan"

data-jenis="${jenis}"

data-no-skb="${escapeHtml(noSkb)}"

>

</td>

`;



}








// =====================================================
// EVENT POS TAMPUNGAN
// =====================================================

function pasangEventPosTampungan(){



document

.querySelectorAll(

".input-pos-tampungan"

)

.forEach(

select=>{


select.addEventListener(

"change",

()=>{


kiraSemua();


}

);



}

);





document

.querySelectorAll(

".input-tampungan"

)

.forEach(

input=>{


input.addEventListener(

"input",

()=>{


kiraSemua();


}

);


}

);



}








// =====================================================
// KIRA SEMUA
// =====================================================

function kiraSemua(){



kiraJadualRK02();


kiraJumlahPosTampungan();


kiraRingkasan();


kiraMaklumatBulanan();



}









// =====================================================
// KIRA JADUAL RK02
// =====================================================

function kiraJadualRK02(){



let jumlahJam=0;

let jumlahRM=0;



let jumlah = {


hariBiasa:0,

jamKlmBiasa:0,

off4:0,

off48:0,

off8:0,

cuti8:0,

cuti8P:0,

cuti8L:0,

jamEskot:0,

klmEskot:0

};







dataAnggota.forEach(

anggota=>{



const noSkb =

anggota.noskb

||

anggota.noanggota

||

"";






const hariBiasa = nilaiInput(
"hariBiasa",
noSkb
);



const jamKlmBiasa = nilaiInput(
"jamKlmBiasa",
noSkb
);



const off4 = nilaiInput(
"off4",
noSkb
);



const off48 = nilaiInput(
"off48",
noSkb
);



const off8 = nilaiInput(
"off8",
noSkb
);



const cuti8 = nilaiInput(
"cuti8",
noSkb
);



const cuti8P = nilaiInput(
"cuti8P",
noSkb
);



const cuti8L = nilaiInput(
"cuti8L",
noSkb
);



const jamEskot = nilaiInput(
"jamEskot",
noSkb
);



const klmEskot = nilaiInput(
"klmEskot",
noSkb
);







const jamSemasa =


(hariBiasa*8)

+

jamKlmBiasa

+

(off4*4)

+

(off48*8)

+

(off8*12)

+

(cuti8*8)

+

(cuti8P*8)

+

(cuti8L*12)

+

jamEskot

+

klmEskot;








const rm =



(jamKlmBiasa *

nombor(
anggota.rm_pehariklmbiasa
))


+

(off4*4*

nombor(
anggota.rm_perjamoffday
))


+

(off48*

nombor(
anggota.rm_perharioffday
))


+

(off8*

nombor(
anggota.rm_perharioffday
))


+

(cuti8*

nombor(
anggota.rm_perharicutiam
))


+

(cuti8P*

nombor(
anggota.rm_perharicutiam
))


+

(cuti8L*

nombor(
anggota.rm_perharicutiam
))


+

(jamEskot*

nombor(
anggota.rm_pehariklmbiasa
))


+

(klmEskot*

nombor(
anggota.rm_pehariklmbiasa
));







setText(

`[data-total-jam="${noSkb}"]`,

formatNombor(jamSemasa),

true

);






setText(

`[data-total-rm="${noSkb}"]`,

formatRM(rm),

true

);





jumlahJam += jamSemasa;


jumlahRM += rm;




Object.keys(jumlah)

.forEach(

key=>{

jumlah[key]+=nilaiInput(
key,
noSkb
);


}

);




});





setText(
"totalJamKeseluruhan",
formatNombor(jumlahJam)
);


setText(
"totalRmKeseluruhan",
formatRM(jumlahRM)
);





for(let key in jumlah){


setText(

"total"+key.charAt(0).toUpperCase()+key.slice(1),

formatNombor(jumlah[key])

);


}



}







// =====================================================
// KIRA JUMLAH POS TAMPUNGAN
// =====================================================

function kiraJumlahPosTampungan(){



let jumlahPos={

1:0,

2:0,

3:0,

4:0,

5:0,

6:0

};






document

.querySelectorAll(

".input-pos-tampungan"

)

.forEach(

select=>{



if(select.value){


jumlahPos[
select.dataset.pos
]++;


}



}

);





for(let i=1;i<=6;i++){


setText(

"totalPos"+i,

jumlahPos[i]

);


}







let nilai={

eskot:0,

cit:0,

kawalanTambahan:0,

kawalanWang:0,

pemandu:0

};






document

.querySelectorAll(

".input-tampungan"

)

.forEach(

input=>{


let jenis=input.dataset.jenis;


nilai[jenis]+=nombor(
input.value
);



}

);







setText(
"totalEskotTampungan",
formatNombor(nilai.eskot)
);


setText(
"totalCit",
formatNombor(nilai.cit)
);


setText(
"totalKawalanTambahan",
formatNombor(nilai.kawalanTambahan)
);


setText(
"totalKawalanWang",
formatNombor(nilai.kawalanWang)
);


setText(
"totalPemandu",
formatNombor(nilai.pemandu)
);



}

//
// =====================================================
// PART 3/3
// SIMPAN + HELPER FUNCTION
// =====================================================

// =====================================================
// RINGKASAN DASHBOARD
// =====================================================

function kiraRingkasan(){


const jam = nombor(

document.getElementById(
"totalJamKeseluruhan"
)?.textContent

);



const rm = nombor(

document.getElementById(
"totalRmKeseluruhan"
)?.textContent

);



const klm =

nombor(

document.getElementById(
"totalJamKlmBiasa"
)?.textContent

)

+

nombor(

document.getElementById(
"totalKlmEskotTable"
)?.textContent

);





setText(

"summaryAnggota",

dataAnggota.length+" ORANG"

);



setText(

"summaryJam",

formatNombor(jam)+" JAM"

);



setText(

"summaryKlm",

formatNombor(klm)+" JAM"

);



setText(

"summaryPendapatan",

formatRM(rm)

);



}



// =====================================================
// EVENT UTAMA
// =====================================================

function pasangEventUtama(){



document

.getElementById("bulan")

?.addEventListener(

"change",

kiraMaklumatBulanan

);





document

.getElementById("tahun")

?.addEventListener(

"change",

kiraMaklumatBulanan

);







document

.getElementById("btnReset")

?.addEventListener(

"click",

resetData

);







document

.getElementById("btnAutoKira")

?.addEventListener(

"click",

()=>{


kiraSemua();


alert(
"Pengiraan dikemas kini"
);



}

);








document

.getElementById("btnCetak")

?.addEventListener(

"click",

()=>{


kiraSemua();


window.print();



}

);








document

.getElementById("btnSimpan")

?.addEventListener(

"click",

async()=>{


await simpanPosTampungan();


}

);



}










// =====================================================
// RESET DATA
// =====================================================

function resetData(){



if(

!confirm(
"Reset semua input?"
)

){

return;

}






document

.querySelectorAll(

".rk02-input,.input-tampungan"

)

.forEach(

x=>{

x.value=0;

}

);







document

.querySelectorAll(

".input-pos-tampungan"

)

.forEach(

x=>{

x.value="";

}

);






kiraSemua();



}









// =====================================================
// SIMPAN POS TAMPUNGAN
// TABLE:
// rk02_pos_tampungan
// =====================================================

async function simpanPosTampungan(){





const poskhidmat =


document.getElementById(

"kodNamaPos"

)

?.innerText || "";







const headerPos = {



pos1:
document.getElementById(
"headerPos1"
)?.value || "",



pos2:
document.getElementById(
"headerPos2"
)?.value || "",



pos3:
document.getElementById(
"headerPos3"
)?.value || "",



pos4:
document.getElementById(
"headerPos4"
)?.value || "",



pos5:
document.getElementById(
"headerPos5"
)?.value || "",



pos6:
document.getElementById(
"headerPos6"
)?.value || ""



};










let rows=[];








document

.querySelectorAll(

"#posTampunganTableBody tr"

)

.forEach(

row=>{





const input =

row.querySelectorAll(

"input"

);







rows.push({



bulan:

Number(

document.getElementById(
"bulan"
).value

),





tahun:

Number(

document.getElementById(
"tahun"
).value

),






...headerPos,







no_skb:

row.children[1].innerText,






nama:

row.children[2].innerText,







poskhidmat,









jam_pos1:

Number(input[0]?.value)||0,



jam_pos2:

Number(input[1]?.value)||0,



jam_pos3:

Number(input[2]?.value)||0,



jam_pos4:

Number(input[3]?.value)||0,



jam_pos5:

Number(input[4]?.value)||0,



jam_pos6:

Number(input[5]?.value)||0,







eskot:

Number(input[6]?.value)||0,




cit:

Number(input[7]?.value)||0,





kawalan_tambahan:

Number(input[8]?.value)||0,





kawalan_wang:

Number(input[9]?.value)||0,





pemandu:

Number(input[10]?.value)||0




});






}

);









if(rows.length===0){


alert(
"Tiada data untuk disimpan"
);


return;


}







const {

error

}=await supabaseClient

.from(

"rk02_pos_tampungan"

)

.insert(

rows

);








if(error){


console.error(error);


alert(
"Gagal simpan data"
);


return;


}







alert(

"Data Pos Tampungan berjaya disimpan"

);





}












// =====================================================
// KIRA MAKLUMAT BULAN
// =====================================================

function kiraMaklumatBulanan(){

    const bulan = nombor(
        document.getElementById(
            "bulan"
        )?.value
    );


    const tahun = nombor(
        document.getElementById(
            "tahun"
        )?.value
    );


    if(!bulan || !tahun){

        return;

    }


    const hari = new Date(
        tahun,
        bulan,
        0
    ).getDate();


    // GUNA ID KHAS UNTUK JUMLAH HARI

    setText(
        "jumlahHariBulan",
        hari + " HARI"
    );


    // SOKONGAN JIKA HTML GUNA ID INI

    setText(
        "jumlahHari",
        hari + " HARI"
    );

}

// =====================================================
// NILAI INPUT
// =====================================================

function nilaiInput(

jenis,

noSkb

){



const input =

document.querySelector(

`

input.rk02-input

[data-jenis="${jenis}"]

[data-no-skb="${noSkb}"]

`

);






return nombor(

input?.value

);



}









// =====================================================
// FORMAT RM
// =====================================================

function formatRM(nilai){



return new Intl.NumberFormat(

"ms-MY",

{

style:"currency",

currency:"MYR",

minimumFractionDigits:2

}

)

.format(

nombor(nilai)

)

.replace(

"MYR",

"RM"

);



}









// =====================================================
// FORMAT NOMBOR
// =====================================================

function formatNombor(nilai){



return new Intl.NumberFormat(

"ms-MY"

)

.format(

nombor(nilai)

);



}









// =====================================================
// NOMBOR
// =====================================================

function nombor(nilai){



const hasil = Number(

String(nilai || 0)

.replace(

/[^0-9.-]/g,

""

)

);





return Number.isFinite(hasil)

?

hasil

:

0;



}









// =====================================================
// SET TEXT
// =====================================================

function setText(

id,

nilai,

selector=false

){



const elemen = selector

?

document.querySelector(id)

:

document.getElementById(id);





if(elemen){


elemen.textContent = nilai;


}



}









// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(teks){



return String(teks || "")

.replace(/&/g,"&amp;")

.replace(/</g,"&lt;")

.replace(/>/g,"&gt;")

.replace(/"/g,"&quot;")

.replace(/'/g,"&#039;");



}









// =====================================================
// DROPDOWN HEADER POS 1-6
// =====================================================

function isiDropdownHeaderPos(){



for(let i=1;i<=6;i++){



const select =

document.getElementById(

"headerPos"+i

);





if(!select){

continue;

}






select.innerHTML =

`

<option value="">

-- PILIH POS --

</option>

`;








dataPosKawalan.forEach(

pos=>{





const option =

document.createElement(

"option"

);





option.value = pos;


option.textContent = pos;





select.appendChild(option);





}

);




}



}
// =================================================
// KIRA JAM SEBULAN
// =================================================

function kiraJamBulanan(jamSehari){


const bulan = nombor(
document.getElementById("bulan")?.value
);


const tahun = nombor(
document.getElementById("tahun")?.value
);



if(!bulan || !tahun){

return;

}



const jumlahHari = new Date(
tahun,
bulan,
0
).getDate();



const jumlahJam = 
jamSehari * jumlahHari;



setText(
"jumlahJamSebulan",
formatNombor(jumlahJam)+" JAM"
);


}
