// =====================================================
// laporan-rk02.js
// FPB DUTY COMMAND CENTER V2
// LAPORAN RK02 BULANAN
// PART 1/3
// =====================================================


// =====================================================
// GLOBAL
// =====================================================

let pengguna = null;

let dataAnggota = [];
let dataDuty = [];
let dataPos = [];

let laporanRK02 = [];

let bulanLaporan = "";
let tahunLaporan = "";
let posLaporan = "";




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
// INIT SYSTEM
// =====================================================

document.addEventListener(
"DOMContentLoaded",
async()=>{


    console.log(
        "LAPORAN RK02 START"
    );


    if(typeof supabase === "undefined"){

        console.error(
            "SUPABASE TIDAK DIJUMPAI"
        );

        return;

    }



    await muatPengguna();

    await muatPos();

    await muatAnggota();



    pasangEvent();



    console.log(
        "LAPORAN RK02 READY"
    );


});







// =====================================================
// LOAD PENGGUNA
// =====================================================

async function muatPengguna(){


try{


    pengguna =
    JSON.parse(
        localStorage.getItem(
            "pengguna"
        )
    );



    if(!pengguna)
        return;



    paparHeader();



}

catch(error){


    console.error(
        "PENGGUNA ERROR",
        error
    );


}


}








// =====================================================
// PAPAR HEADER
// =====================================================

function paparHeader(){


    if(!pengguna)
        return;



    setText(
        "namaPos",
        pengguna.pos || "-"
    );



    setText(
        "kawasan",
        pengguna.unit || "-"
    );


}








// =====================================================
// LOAD POS
// =====================================================

async function muatPos(){



try{


    let {
        data,
        error
    }
    =
    await supabase
    .from("data_pos")
    .select("*")
    .order(
        "pos_kawalan",
        {
            ascending:true
        }
    );



    if(error)
        throw error;



    dataPos =
    data || [];



    console.log(
        "DATA POS",
        dataPos
    );



}

catch(error){


    console.error(
        "LOAD POS ERROR",
        error
    );


}


}









// =====================================================
// LOAD ANGGOTA
// =====================================================

async function muatAnggota(){


try{


    let {
        data,
        error
    }
    =
    await supabase
    .from("Data_Anggota")
    .select(`

        no_skb,
        nama,
        pangkat,
        pos,
        unit,

        rm_pehariklmbiasa,
        rm_perharioffday,
        rm_perjamoffday,
        rm_perharicutiam,
        rm_perjamcutiam

    `);



    if(error)
        throw error;



    dataAnggota =
    data || [];



    console.log(
        "DATA ANGGOTA",
        dataAnggota
    );



}

catch(error){


    console.error(
        "LOAD ANGGOTA ERROR",
        error
    );


}


}









// =====================================================
// LOAD JADUAL DUTY
// =====================================================

async function muatDuty(){


try{


    let query =
    supabase
    .from("jadual_duty")
    .select("*")
    .eq(
        "bulan",
        bulanLaporan
    )
    .eq(
        "tahun",
        tahunLaporan
    );



    if(posLaporan){


        query =
        query.eq(
            "pos",
            posLaporan
        );


    }



    let {
        data,
        error
    }
    =
    await query;



    if(error)
        throw error;



    dataDuty =
    data || [];



    console.log(
        "DATA DUTY",
        dataDuty
    );



}

catch(error){


    console.error(
        "LOAD DUTY ERROR",
        error
    );


}



}









// =====================================================
// EVENT BUTTON
// =====================================================

function pasangEvent(){


let btn =
document.getElementById(
    "btnPapar"
);



if(btn){


btn.addEventListener(
"click",
async()=>{


    bulanLaporan =
    document.getElementById(
        "bulan"
    ).value;



    tahunLaporan =
    document.getElementById(
        "tahun"
    ).value;



    posLaporan =
    document.getElementById(
        "pilihPos"
    ).value;



    if(
        !bulanLaporan ||
        !tahunLaporan
    ){

        alert(
            "Sila pilih bulan dan tahun"
        );

        return;

    }



    setText(
        "bulanLaporan",
        SENARAI_BULAN[
            Number(bulanLaporan)
        ]+
        " "+
        tahunLaporan
    );



    await muatDuty();


    prosesRK02();



});


}


}









// =====================================================
// HELPER
// =====================================================

function setText(id,value){


let el =
document.getElementById(id);



if(el){

    el.textContent =
    value || "-";

}


}



function formatRM(value){


return Number(value || 0)
.toLocaleString(
    "ms-MY",
    {
        minimumFractionDigits:2,
        maximumFractionDigits:2
    }
);


}

// =====================================================
// laporan-rk02.js
// PART 2/3
// =====================================================



// =====================================================
// PROSES DATA RK02
// =====================================================

function prosesRK02(){


    laporanRK02 = [];



    dataAnggota.forEach(
    (anggota)=>{


        let dutyAnggota =
        dataDuty.filter(
        (d)=>{


            return (
                d.no_skb ==
                anggota.no_skb
            );


        });



        if(
            dutyAnggota.length === 0
        ){

            return;

        }




        let kiraan =
        kiraKategori(
            anggota,
            dutyAnggota
        );




        laporanRK02.push({

            no_skb:
            anggota.no_skb,

            nama:
            anggota.nama,

            pangkat:
            anggota.pangkat,

            gaji:
            anggota.gaji_pokok || 0,


            ...kiraan


        });



    });



    console.log(
        "HASIL RK02",
        laporanRK02
    );



    binaTableRK02();



    kiraJumlahKeseluruhan();



}







// =====================================================
// KIRA KATEGORI KLM
// =====================================================

function kiraKategori(
    anggota,
    duty
){



let data = {


    jamBiasa:0,

    rmBiasa:0,


    hariOffKurang4:0,

    rmOffKurang4:0,


    hariOff48:0,

    rmOff48:0,


    jamOffLebih8:0,

    rmOffLebih8:0,


    hariCutiKurang8:0,

    rmCutiKurang8:0,


    jamCutiLebih8:0,

    rmCutiLebih8:0,


    jumlahRM:0



};






duty.forEach(
(d)=>{



let jam =
Number(
    d.jam_kerja || 0
);



let kategori =
(
    d.kategori ||
    d.jenis ||
    d.waktu_tugasan ||
    ""
)
.toUpperCase();







// ===============================
// HARI BIASA
// ===============================

if(
kategori.includes(
    "BIASA"
)
){


data.jamBiasa += jam;



data.rmBiasa +=
Number(
    anggota.rm_pehariklmbiasa || 0
);



}







// ===============================
// OFFDAY
// ===============================

else if(
kategori.includes(
    "OFF"
)
){



if(jam < 4){



data.hariOffKurang4++;



data.rmOffKurang4 +=
Number(
    anggota.rm_perharioffday || 0
);



}

else if(
jam <= 8
){



data.hariOff48++;



data.rmOff48 +=
Number(
    anggota.rm_perharioffday || 0
);



}

else{



data.jamOffLebih8 +=
(jam-8);



data.rmOffLebih8 +=

Number(
    anggota.rm_perharioffday || 0
)

+

(
(jam-8)
*
Number(
    anggota.rm_perjamoffday || 0
)
);



}



}







// ===============================
// CUTI AM
// ===============================

else if(
kategori.includes(
    "CUTI"
)
){



if(
jam <= 8
){



data.hariCutiKurang8++;



data.rmCutiKurang8 +=
Number(
    anggota.rm_perharicutiam || 0
);



}

else{



data.jamCutiLebih8 +=
(jam-8);



data.rmCutiLebih8 +=

Number(
    anggota.rm_perharicutiam || 0
)

+

(
(jam-8)
*
Number(
    anggota.rm_perjamcutiam || 0
)
);



}



}



});







data.jumlahRM =

data.rmBiasa

+

data.rmOffKurang4

+

data.rmOff48

+

data.rmOffLebih8

+

data.rmCutiKurang8

+

data.rmCutiLebih8;




return data;



}









// =====================================================
// BINA TABLE RK02
// =====================================================

function binaTableRK02(){



let tbody =
document.getElementById(
    "rk02ReportBody"
);



if(!tbody)
    return;



tbody.innerHTML="";



let bil = 1;




laporanRK02.forEach(
(data)=>{



let tr =
document.createElement(
    "tr"
);



tr.innerHTML =

`

<td>
${bil}
</td>


<td>
${data.no_skb || ""}
</td>


<td>
${data.nama || ""}
</td>


<td>
${formatRM(data.gaji)}
</td>


<td>
${data.jamBiasa}
</td>


<td>
RM ${formatRM(data.rmBiasa)}
</td>



<td>
${data.hariOffKurang4}
</td>


<td>
RM ${formatRM(data.rmOffKurang4)}
</td>



<td>
${data.hariOff48}
</td>


<td>
RM ${formatRM(data.rmOff48)}
</td>



<td>
${data.jamOffLebih8}
</td>


<td>
RM ${formatRM(data.rmOffLebih8)}
</td>




<td>
${data.hariCutiKurang8}
</td>


<td>
RM ${formatRM(data.rmCutiKurang8)}
</td>



<td>
${data.jamCutiLebih8}
</td>


<td>
RM ${formatRM(data.rmCutiLebih8)}
</td>



<td>
RM ${formatRM(data.jumlahRM)}
</td>


`;



tbody.appendChild(
    tr
);



bil++;



});



}

// =====================================================
// laporan-rk02.js
// PART 3/3
// =====================================================



// =====================================================
// KIRA JUMLAH KESELURUHAN
// =====================================================

function kiraJumlahKeseluruhan(){



let jumlah = {


    jamBiasa:0,
    rmBiasa:0,


    hariOffKurang4:0,
    rmOffKurang4:0,


    hariOff48:0,
    rmOff48:0,


    jamOffLebih8:0,
    rmOffLebih8:0,


    hariCutiKurang8:0,
    rmCutiKurang8:0,


    jamCutiLebih8:0,
    rmCutiLebih8:0,


    jumlahRM:0

};





laporanRK02.forEach(
(data)=>{



jumlah.jamBiasa +=
data.jamBiasa;



jumlah.rmBiasa +=
data.rmBiasa;




jumlah.hariOffKurang4 +=
data.hariOffKurang4;



jumlah.rmOffKurang4 +=
data.rmOffKurang4;




jumlah.hariOff48 +=
data.hariOff48;



jumlah.rmOff48 +=
data.rmOff48;




jumlah.jamOffLebih8 +=
data.jamOffLebih8;



jumlah.rmOffLebih8 +=
data.rmOffLebih8;




jumlah.hariCutiKurang8 +=
data.hariCutiKurang8;



jumlah.rmCutiKurang8 +=
data.rmCutiKurang8;




jumlah.jamCutiLebih8 +=
data.jamCutiLebih8;



jumlah.rmCutiLebih8 +=
data.rmCutiLebih8;




jumlah.jumlahRM +=
data.jumlahRM;



});







// =====================================================
// PAPAR FOOTER HTML
// =====================================================


setText(
"jumlahJamBiasa",
jumlah.jamBiasa
);



setText(
"jumlahRmBiasa",
"RM " + formatRM(jumlah.rmBiasa)
);





setText(
"jumlahHariOffKurang4",
jumlah.hariOffKurang4
);



setText(
"jumlahRmOffKurang4",
"RM " + formatRM(jumlah.rmOffKurang4)
);





setText(
"jumlahHariOff48",
jumlah.hariOff48
);



setText(
"jumlahRmOff48",
"RM " + formatRM(jumlah.rmOff48)
);





setText(
"jumlahJamOffLebih8",
jumlah.jamOffLebih8
);



setText(
"jumlahRmOffLebih8",
"RM " + formatRM(jumlah.rmOffLebih8)
);





setText(
"jumlahHariCutiKurang8",
jumlah.hariCutiKurang8
);



setText(
"jumlahRmCutiKurang8",
"RM " + formatRM(jumlah.rmCutiKurang8)
);





setText(
"jumlahJamCutiLebih8",
jumlah.jamCutiLebih8
);



setText(
"jumlahRmCutiLebih8",
"RM " + formatRM(jumlah.rmCutiLebih8)
);





setText(
"jumlahRmKeseluruhan",
"RM " + formatRM(jumlah.jumlahRM)
);





return jumlah;



}









// =====================================================
// RUMUSAN KLM BAWAH RK02
// =====================================================

function binaRumusanKLM(){



let jam = 0;

let rm = 0;



laporanRK02.forEach(
(data)=>{


jam +=
data.jamBiasa

+
data.jamOffLebih8

+
data.jamCutiLebih8;



rm +=
data.jumlahRM;



});





let jamElement =
document.querySelector(
".jumlah-jam"
);



let rmElement =
document.querySelector(
".jumlah-rm"
);



if(jamElement){

jamElement.textContent =
jam;

}



if(rmElement){

rmElement.textContent =
"RM " +
formatRM(rm);

}



}









// =====================================================
// SIMPAN LAPORAN RK02
// =====================================================

async function simpanLaporanRK02(){



try{



let jumlah =
kiraJumlahKeseluruhan();



let {
error
}
=
await supabase
.from(
"laporan_rk02"
)
.upsert({


bulan:
bulanLaporan,


tahun:
tahunLaporan,


pos:
posLaporan,


jumlah_rm:
jumlah.jumlahRM,


jumlah_jam:
jumlah.jamBiasa
+
jumlah.jamOffLebih8
+
jumlah.jamCutiLebih8,


dikemaskini_pada:
new Date()



});



if(error)
throw error;




alert(
"Laporan RK02 berjaya disimpan"
);



}

catch(error){


console.error(
"SIMPAN RK02 ERROR",
error
);


}



}









// =====================================================
// BUTTON REFRESH RM
// =====================================================

document.addEventListener(
"click",
(e)=>{


if(
e.target.id ===
"btnRefreshRM"
){


kiraJumlahKeseluruhan();


binaRumusanKLM();


simpanLaporanRK02();


}



});









// =====================================================
// CETAK
// =====================================================

function cetakRK02(){


window.print();


}







// =====================================================
// AUTO KIRA SELEPAS TABLE SIAP
// =====================================================

setTimeout(
()=>{


if(
laporanRK02.length > 0
){


kiraJumlahKeseluruhan();

binaRumusanKLM();


}


},
500
);
