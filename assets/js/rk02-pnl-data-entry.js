// =====================================================
// RK02-PNL-DATA-ENTRY.JS
// FPB DUTY COMMAND CENTER V2
// =====================================================


// =====================================================
// GLOBAL
// =====================================================

let pengguna = null;

let dataAnggota = [];

let dataPosKawalan = [];

let rekodInput = {};



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

    await muatDropdownPosTampungan();
    paparAnggotaTampungan();

    paparJadualRK02();


    paparPosTampungan();


    kiraSemua();



    console.log(

        "RK02 SYSTEM BERJAYA DIMULAKAN"

    );


}

catch(error){


    console.error(

        "RALAT MULA SISTEM:",

        error

    );


    alert(

        "Sistem gagal dimulakan. Semak Console."

    );


}


}




// =====================================================
// BACA DATA PENGGUNA
// =====================================================

function bacaPengguna(){


const dataPengguna =


localStorage.getItem(

    "pengguna"

)

||


localStorage.getItem(

    "currentUser"

)

||


localStorage.getItem(

    "userData"

);



if(!dataPengguna){


    console.warn(

        "TIADA DATA PENGGUNA"

    );


    pengguna=null;


    return;


}



try{


    pengguna = JSON.parse(

        dataPengguna

    );



}

catch(error){


    console.warn(

        "DATA PENGGUNA ROSAK"

    );


    pengguna=null;


}



const inputUnit =

document.getElementById(

    "unit"

);



if(inputUnit){


    inputUnit.value =

    pengguna?.unit || "";


}



console.log(

    "PENGGUNA:",

    pengguna

);



}





// =====================================================
// TETAPKAN BULAN SEMASA
// =====================================================

function tetapkanBulanSemasa(){



const sekarang = new Date();


const bulan =

sekarang.getMonth()+1;



const tahun =

sekarang.getFullYear();



const selectBulan =

document.getElementById(

    "bulan"

);



const selectTahun =

document.getElementById(

    "tahun"

);




if(selectBulan){


    selectBulan.value =

    String(bulan);


}




if(selectTahun){


    const wujud =

    [...selectTahun.options]

    .some(

        x=>x.value===String(tahun)

    );



    if(wujud){


        selectTahun.value =

        String(tahun);


    }


}


}




// =====================================================
// MUAT POS KAWALAN
// TABLE:
// data_pos
// FIELD:
// pos_kawalan
// =====================================================

async function muatPosKawalan(){



if(

typeof supabaseClient==="undefined"

){


    throw new Error(

        "supabaseClient tidak dijumpai"

    );


}




const{

data,

error

}= await supabaseClient


.from(

    "data_pos"

)


.select(

    "pos_kawalan"

)


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

item=>

String(

item.pos_kawalan||""

)

.trim()


)


.filter(

x=>x!==""


)


)];




console.log(

"DATA POS:",

dataPosKawalan

);



}





// =====================================================
// MUAT DATA ANGGOTA
// =====================================================

async function muatAnggota(){



console.log(

"MULA LOAD ANGGOTA"

);




let query =


supabaseClient


.from(

"Data_Anggota"

)


.select("*");





// =================================================
// FILTER UNIT
// =================================================

if(

pengguna

&&

pengguna.unit

){



query = query.eq(

    "unit",

    pengguna.unit

);



}




// =================================================
// FILTER KETUA POS
// =================================================

const jawatan =


String(


pengguna?.jawatan

||

pengguna?.peranan

||

""


)

.toUpperCase();





if(

jawatan.includes(

"KETUA POS"

)

){



const posPengguna =


pengguna.poskhidmat

||

pengguna.pos;





if(posPengguna){



query = query.or(


`

pos.eq.${posPengguna},

poskhidmat.eq.${posPengguna}

`

);



}


}




const{

data,

error

}= await query.order(


"nama",

{

ascending:true

}


);





if(error){


console.error(

error

);


throw error;


}




dataAnggota =


data || [];





console.log(

"JUMLAH ANGGOTA:",

dataAnggota.length

);




kemasKiniMaklumatOperasi();



}




// =====================================================
// KEMAS KINI MAKLUMAT OPERASI
// =====================================================

function kemasKiniMaklumatOperasi(){



if(

dataAnggota.length===0

){

return;

}




const anggotaPertama =

dataAnggota[0];




const namaPos =


anggotaPertama.poskhidmat

||

anggotaPertama.pos

||

"-";




const ketuaUnit =


anggotaPertama.ketua_unit

||

"-";




const ketuaPos =


anggotaPertama.ketua_pos

||

"-";





setText(

"kodNamaPos",

namaPos

);




setText(

"bilanganAnggota",

dataAnggota.length+" ORANG"

);




setText(

"ketuaUnit",

ketuaUnit

);




setText(

"ketuaPos",

ketuaPos

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




if(dataAnggota.length===0){



tbody.innerHTML = `

<tr>

<td colspan="13">

TIADA DATA ANGGOTA

</td>

</tr>

`;

return;


}




tbody.innerHTML="";




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



row.dataset.noSkb = noSkb;




row.innerHTML = `



<td>

${index+1}

</td>




<td class="skb-cell">

${escapeHtml(noSkb)}

</td>




<td class="name-cell">

${escapeHtml(

anggota.nama || "-"

)}

</td>




${binaInputRK02(

"hariBiasa",

noSkb

)}



${binaInputRK02(

"jamKlmBiasa",

noSkb

)}



${binaInputRK02(

"off4",

noSkb

)}



${binaInputRK02(

"off48",

noSkb

)}



${binaInputRK02(

"off8",

noSkb

)}



${binaInputRK02(

"cuti8",

noSkb

)}



${binaInputRK02(

"cuti8P",

noSkb

)}



${binaInputRK02(

"cuti8L",

noSkb

)}



${binaInputRK02(

"jamEskot",

noSkb

)}



${binaInputRK02(

"klmEskot",

noSkb

)}





<td

class="total-cell"

data-total-jam="${escapeHtml(noSkb)}"

>

0

</td>




<td

class="total-cell"

data-total-rm="${escapeHtml(noSkb)}"

>

RM 0.00

</td>


`;



tbody.appendChild(row);



}



);



pasangEventRK02();



}





// =====================================================
// BINA INPUT RK02
// =====================================================

function binaInputRK02(

jenis,

noSkb

){



return `


<td>

<input


type="number"


min="0"


step="0.5"


value="0"



class="rk02-input"



data-jenis="${jenis}"



data-no-skb="${escapeHtml(noSkb)}"


>


</td>



`;



}





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




if(!tbody){

return;

}





if(dataAnggota.length===0){


tbody.innerHTML = `

<tr>

<td colspan="14">

TIADA DATA ANGGOTA

</td>

</tr>

`;

return;


}




tbody.innerHTML="";





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





row.innerHTML = `




<td>

${index+1}

</td>




<td class="skb-cell">

${escapeHtml(noSkb)}

</td>




<td class="name-cell">

${escapeHtml(

anggota.nama || "-"

)}

</td>





${binaDropdownPos(

1,

noSkb

)}



${binaDropdownPos(

2,

noSkb

)}



${binaDropdownPos(

3,

noSkb

)}



${binaDropdownPos(

4,

noSkb

)}



${binaDropdownPos(

5,

noSkb

)}



${binaDropdownPos(

6,

noSkb

)}





${binaInputTampungan(

"eskot",

noSkb

)}




${binaInputTampungan(

"cit",

noSkb

)}




${binaInputTampungan(

"kawalanTambahan",

noSkb

)}




${binaInputTampungan(

"kawalanWang",

noSkb

)}




${binaInputTampungan(

"pemandu",

noSkb

)}




`;





tbody.appendChild(row);



}



);




pasangEventPosTampungan();



}






// =====================================================
// DROPDOWN POS TAMPUNGAN
// =====================================================

function binaDropdownPos(

nomborPos,

noSkb

){



let option = `


<option value="">


-- PILIH POS --


</option>


`;





dataPosKawalan.forEach(


pos=>{


option += `



<option value="${escapeHtml(pos)}">


${escapeHtml(pos)}


</option>



`;



}



);





return `



<td>


<select



class="input-pos-tampungan"



data-pos="${nomborPos}"



data-no-skb="${escapeHtml(noSkb)}"



>


${option}


</select>


</td>



`;



}





// =====================================================
// INPUT POS TAMPUNGAN
// =====================================================

function binaInputTampungan(

jenis,

noSkb

){



return `



<td>


<input



type="number"



min="0"



step="0.5"



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



let jumlahJam = 0;

let jumlahRM = 0;


let jumlahHariBiasa = 0;

let jumlahJamKlmBiasa = 0;

let jumlahOff4 = 0;

let jumlahOff48 = 0;

let jumlahOff8 = 0;

let jumlahCuti8 = 0;

let jumlahCuti8P = 0;

let jumlahCuti8L = 0;

let jumlahJamEskot = 0;

let jumlahKlmEskot = 0;




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





// ================================
// KIRA JAM
// ================================


const jamSemasa =


(hariBiasa * 8)


+

jamKlmBiasa


+

(off4 * 4)


+

(off48 * 8)


+

(off8 * 12)


+

(cuti8 * 8)


+

(cuti8P * 8)


+

(cuti8L * 12)


+

jamEskot


+

klmEskot;





// ================================
// KADAR RM
// ================================


const kadarKlmBiasa = nombor(

anggota.rm_pehariklmbiasa

);



const kadarHariOff = nombor(

anggota.rm_perharioffday

);



const kadarJamOff = nombor(

anggota.rm_perjamoffday

);



const kadarHariCuti = nombor(

anggota.rm_perharicutiam

);



const kadarJamCuti = nombor(

anggota.rm_perjamcutiam

);






// ================================
// KIRA RM
// ================================


const rmSemasa =



(jamKlmBiasa * kadarKlmBiasa)


+

(off4 * 4 * kadarJamOff)


+

(off48 * kadarHariOff)


+

(off8 * kadarHariOff)


+

(cuti8 * kadarHariCuti)


+

(cuti8P * kadarHariCuti)


+

(cuti8L * kadarHariCuti)


+

(jamEskot * kadarKlmBiasa)


+

(klmEskot * kadarKlmBiasa);





setText(

`[data-total-jam="${noSkb}"]`,

formatNombor(jamSemasa),

true

);





setText(

`[data-total-rm="${noSkb}"]`,

formatRM(rmSemasa),

true

);






jumlahHariBiasa += hariBiasa;

jumlahJamKlmBiasa += jamKlmBiasa;

jumlahOff4 += off4;

jumlahOff48 += off48;

jumlahOff8 += off8;

jumlahCuti8 += cuti8;

jumlahCuti8P += cuti8P;

jumlahCuti8L += cuti8L;

jumlahJamEskot += jamEskot;

jumlahKlmEskot += klmEskot;


jumlahJam += jamSemasa;

jumlahRM += rmSemasa;



}



);





setText(

"totalHariBiasa",

formatNombor(jumlahHariBiasa)

);



setText(

"totalJamKlmBiasa",

formatNombor(jumlahJamKlmBiasa)

);



setText(

"totalOff4",

formatNombor(jumlahOff4)

);



setText(

"totalOff48",

formatNombor(jumlahOff48)

);



setText(

"totalOff8",

formatNombor(jumlahOff8)

);



setText(

"totalCuti8",

formatNombor(jumlahCuti8)

);



setText(

"totalCuti8P",

formatNombor(jumlahCuti8P)

);



setText(

"totalCuti8L",

formatNombor(jumlahCuti8L)

);



setText(

"totalJamEskotTable",

formatNombor(jumlahJamEskot)

);



setText(

"totalKlmEskotTable",

formatNombor(jumlahKlmEskot)

);



setText(

"totalJamKeseluruhan",

formatNombor(jumlahJam)

);



setText(

"totalRmKeseluruhan",

formatRM(jumlahRM)

);



}





// =====================================================
// KIRA POS TAMPUNGAN
// =====================================================

function kiraJumlahPosTampungan(){



const jumlahPos = {


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


if(select.value!==""){



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




let eskot=0;

let cit=0;

let tambahan=0;

let wang=0;

let pemandu=0;




document

.querySelectorAll(

".input-tampungan"

)

.forEach(


input=>{


const nilai=nombor(

input.value

);



switch(input.dataset.jenis){


case "eskot":

eskot+=nilai;

break;



case "cit":

cit+=nilai;

break;



case "kawalanTambahan":

tambahan+=nilai;

break;



case "kawalanWang":

wang+=nilai;

break;



case "pemandu":

pemandu+=nilai;

break;



}



}



);





setText(

"totalEskotTampungan",

formatNombor(eskot)

);



setText(

"totalCit",

formatNombor(cit)

);



setText(

"totalKawalanTambahan",

formatNombor(tambahan)

);



setText(

"totalKawalanWang",

formatNombor(wang)

);



setText(

"totalPemandu",

formatNombor(pemandu)

);



}






// =====================================================
// RINGKASAN
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



const klm = nombor(

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
// BULAN
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

)

.getDate();




setText(

"namaKetuaPos",

hari+" HARI"

);



}







// =====================================================
// EVENT UTAMA
// =====================================================

function pasangEventUtama(){



document

.getElementById(

"bulan"

)

?.addEventListener(

"change",

kiraMaklumatBulanan

);



document

.getElementById(

"tahun"

)

?.addEventListener(

"change",

kiraMaklumatBulanan

);



document

.getElementById(

"btnReset"

)

?.addEventListener(

"click",

resetData

);



document

.getElementById(

"btnAutoKira"

)

?.addEventListener(

"click",

()=>{


kiraSemua();


alert(

"Pengiraan dikemas kini."

);


}

);



document

.getElementById(

"btnCetak"

)

?.addEventListener(

"click",

()=>{


kiraSemua();


window.print();


}

);



document

.getElementById(

"btnSimpan"

)

?.addEventListener(

"click",

simpanData
simpanPosTampungan
);



}







// =====================================================
// RESET
// =====================================================

function resetData(){



if(!confirm(

"Reset semua input?"

)){

return;

}




document

.querySelectorAll(

".rk02-input,.input-tampungan"

)

.forEach(

x=>x.value=0

);



document

.querySelectorAll(

".input-pos-tampungan"

)

.forEach(

x=>x.value=""

);



kiraSemua();



}






// =====================================================
// SIMPAN
// =====================================================

async function simpanData(){



kiraSemua();



const data = kumpulDataSimpan();



console.log(

"DATA SIMPAN:",

data

);



alert(

"Data berjaya dikumpulkan."

);



}







// =====================================================
// NILAI INPUT
// =====================================================

function nilaiInput(

jenis,

noSkb

){



const input = document.querySelector(



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

String(nilai||0)

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


return String(teks||"")

.replace(/&/g,"&amp;")

.replace(/</g,"&lt;")

.replace(/>/g,"&gt;")

.replace(/"/g,"&quot;")

.replace(/'/g,"&#039;");


}
// =====================================================
// DROPDOWN HEADER POS 1 - 6
// =====================================================

function isiDropdownHeaderPos(){


for(let i=1;i<=6;i++){


const select = document.getElementById(
    "headerPos"+i
);


if(!select){
    continue;
}


dataPosKawalan.forEach(pos=>{


const option=document.createElement("option");


option.value=pos;


option.textContent=pos;


select.appendChild(option);


});


}


}
// =====================================================
// RK02 POS TAMPUNGAN MODULE
// =====================================================


let senaraiPosTampungan = [];
let anggotaTampungan = [];


// =====================================================
// LOAD DROPDOWN HEADER POS
// =====================================================

async function muatDropdownPosTampungan(){


    const {data,error}=await supabase
    .from("data_pos")
    .select(
        "pos_kawalan"
    )
    .order(
        "pos_kawalan"
    );


    if(error){

        console.error(
            "GAGAL LOAD POS",
            error
        );

        return;

    }


    senaraiPosTampungan=data || [];


    let dropdown = [

        "headerPos1",
        "headerPos2",
        "headerPos3",
        "headerPos4",
        "headerPos5",
        "headerPos6"

    ];


    dropdown.forEach(
    (id)=>{


        let el=document.getElementById(id);


        if(!el)
        return;


        el.innerHTML=
        `
        <option value="">
        -- PILIH POS --
        </option>
        `;


        senaraiPosTampungan.forEach(
        (p)=>{


            el.innerHTML +=
            `
            <option value="${p.pos_kawalan}">
            ${p.pos_kawalan}
            </option>
            `;


        });


    });


}



// =====================================================
// PAPAR ANGGOTA POS TAMPUNGAN
// =====================================================


function paparAnggotaTampungan(){


    let tbody =
    document.getElementById(
        "posTampunganTableBody"
    );


    if(!tbody)
    return;



    tbody.innerHTML="";



    anggotaTampungan.forEach(
    (a,index)=>{


        tbody.innerHTML +=
        `

<tr>


<td>
${index+1}
</td>


<td>
${a.no_skb}
</td>


<td class="name-cell">
${a.nama}
</td>


<td>
<input 
type="number"
min="0"
class="jam-pos"
data-pos="1"
data-skb="${a.no_skb}"
value="0">
</td>


<td>
<input 
type="number"
min="0"
class="jam-pos"
data-pos="2"
data-skb="${a.no_skb}"
value="0">
</td>


<td>
<input 
type="number"
min="0"
class="jam-pos"
data-pos="3"
data-skb="${a.no_skb}"
value="0">
</td>


<td>
<input 
type="number"
min="0"
class="jam-pos"
data-pos="4"
data-skb="${a.no_skb}"
value="0">
</td>


<td>
<input 
type="number"
min="0"
class="jam-pos"
data-pos="5"
data-skb="${a.no_skb}"
value="0">
</td>


<td>
<input 
type="number"
min="0"
class="jam-pos"
data-pos="6"
data-skb="${a.no_skb}"
value="0">
</td>


<td>
<input type="number" value="0">
</td>


<td>
<input type="number" value="0">
</td>


<td>
<input type="number" value="0">
</td>


<td>
<input type="number" value="0">
</td>


<td>
<input type="number" value="0">
</td>


</tr>

`;



    });



}



// =====================================================
// KIRA JUMLAH POS
// =====================================================


function kiraJumlahPosTampungan(){


let jumlahJam =
[
0,0,0,0,0,0
];


document
.querySelectorAll(".jam-pos")
.forEach(
(input)=>{


let jam =
Number(input.value)||0;


let pos =
Number(input.dataset.pos)-1;


jumlahJam[pos]+=jam;


});



jumlahJam.forEach(
(jumlah,index)=>{


let el =
document.getElementById(
"totalPos"+(index+1)
);


if(el)
el.innerText=jumlah;



});



}



// =====================================================
// EVENT INPUT JAM
// =====================================================


document.addEventListener(
"input",
(e)=>{


if(
e.target.classList.contains(
"jam-pos"
)
){

    kiraJumlahPosTampungan();

}


});



// =====================================================
// SIMPAN DATA POS TAMPUNGAN
// =====================================================


async function simpanPosTampungan(){


let poskhidmat =
document.getElementById(
"kodNamaPos"
).innerText;



let headerPos={

pos1:
document.getElementById("headerPos1").value,

pos2:
document.getElementById("headerPos2").value,

pos3:
document.getElementById("headerPos3").value,

pos4:
document.getElementById("headerPos4").value,

pos5:
document.getElementById("headerPos5").value,

pos6:
document.getElementById("headerPos6").value

};



let rows=[];



document
.querySelectorAll(
"#posTampunganTableBody tr"
)
.forEach(
(row)=>{


let input =
row.querySelectorAll(
"input"
);



rows.push({

bulan:
Number(
document.getElementById("bulan").value
),

tahun:
Number(
document.getElementById("tahun").value
),


...headerPos,


no_skb:
row.children[1].innerText,


nama:
row.children[2].innerText,


poskhidmat,


jam_pos1:
Number(input[0].value)||0,

jam_pos2:
Number(input[1].value)||0,

jam_pos3:
Number(input[2].value)||0,

jam_pos4:
Number(input[3].value)||0,

jam_pos5:
Number(input[4].value)||0,

jam_pos6:
Number(input[5].value)||0,


eskot:
Number(input[6].value)||0,

cit:
Number(input[7].value)||0,

kawalan_tambahan:
Number(input[8].value)||0,

kawalan_wang:
Number(input[9].value)||0,

pemandu:
Number(input[10].value)||0


});


});



const {error}=await supabase
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
