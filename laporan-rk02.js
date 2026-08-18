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
let dataPos = [];

let dataRK02Entry = [];
let dataTampungan = [];

let laporanRK02 = [];

let bulanLaporan = "";
let tahunLaporan = "";
let posLaporan = "";
// =====================================================
// SUPABASE CLIENT
// =====================================================

const db =
window.supabaseClient;



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
// DROPDOWN BULAN
// =====================================================

function isiDropdownBulan(){


let bulan =
document.getElementById(
"bulan"
);


if(!bulan)
return;



bulan.innerHTML="";



for(let i=1;i<=12;i++){


let option =
document.createElement("option");


option.value=i;


option.textContent =
SENARAI_BULAN[i];


bulan.appendChild(option);


}



bulan.value =
new Date().getMonth()+1;


}


// =====================================================
// INIT
// =====================================================

document.addEventListener(
"DOMContentLoaded",
async()=>{


console.log(
    "LAPORAN RK02 START"
);



if(!db){


console.error(
    "SUPABASE CLIENT TIDAK DIJUMPAI"
);


return;


}




await muatPengguna();


await muatAnggota();

isiDropdownBulan();

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
"LOAD PENGGUNA ERROR",
error
);


}


}








// =====================================================
// HEADER LAPORAN
// =====================================================

function paparHeader(){


if(!pengguna)
return;



setText(
"namaPos",
pengguna.poskhidmat ||
"-"
);



setText(
"kawasan",
pengguna.unit ||
"-"
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
await db
.from(
"data_pos"
)
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
await db
.from(
"Data_Anggota"
)
.select(`

noskb,
noanggota,
nama,
pangkat,
poskhidmat,
unit,
gaji_pokok,

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
// LOAD RK02 DATA ENTRY
// =====================================================

async function muatRK02Entry(){


try{


let {
data,
error
}
=
await db
.from(
"rk02_data_entry"
)
.select("*")
.eq(
"bulan",
bulanLaporan
)
.eq(
"tahun",
tahunLaporan
)
.eq(
"poskhidmat",
posLaporan
);



if(error)
throw error;



dataRK02Entry =
data || [];



console.log(
"RK02 ENTRY",
dataRK02Entry
);



}

catch(error){


console.error(
"LOAD RK02 ENTRY ERROR",
error
);


}



}









// =====================================================
// LOAD POS TAMPUNGAN
// =====================================================

async function muatTampungan(){


try{


let {
data,
error
}
=
await db
.from(
"rk02_pos_tampungan"
)
.select("*")
.eq(
"bulan",
bulanLaporan
)
.eq(
"tahun",
tahunLaporan
)
.eq(
"poskhidmat",
posLaporan
);



if(error)
throw error;



dataTampungan =
data || [];



console.log(
"RK02 TAMPUNGAN",
dataTampungan
);



}

catch(error){


console.error(
"LOAD TAMPUNGAN ERROR",
error
);


}



}









// =====================================================
// EVENT
// =====================================================

function pasangEvent(){


let btn =
document.getElementById(
"btnPapar"
);



if(!btn)
return;



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
pengguna.poskhidmat;




if(
!bulanLaporan ||
!tahunLaporan ||
!posLaporan
){


alert(
"Sila pilih Bulan, Tahun dan Pos"
);


return;


}



setText(
"bulanLaporan",
SENARAI_BULAN[
Number(bulanLaporan)
]
+
" "
+
tahunLaporan
);




await muatCutiAwam();
await muatRK02Entry();

await muatTampungan();



prosesRK02();



});


}









// =====================================================
// HELPER
// =====================================================

function setText(
id,
value
){


let el =
document.getElementById(
id
);



if(el){

el.textContent =
value ?? "-";

}


}




function formatRM(
value
){


return Number(
value || 0
)
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



dataRK02Entry.forEach(
(item)=>{


let anggota =
dataAnggota.find(
(a)=>
a.noskb == item.no_skb
);



if(!anggota)
return;




let data = {


noskb:
item.no_skb,

noAnggota:
anggota.noanggota || "", 



nama:
item.nama ||
anggota.nama,


pangkat:
anggota.pangkat || "",


gaji:
Number(
String(anggota.gaji_pokok || 0)
.replace(/,/g,'')
.trim()
),



// ======================
// HARI BIASA
// ======================

hariBiasa:
Number(
item.hari_biasa || 0
),



rmBiasa:

Number(
item.hari_biasa || 0
)
*
Number(
anggota.rm_pehariklmbiasa || 0
),





// ======================
// OFF
// ======================

off4:
Number(
item.off4 || 0
),


rmOff4:

Number(
item.off4 || 0
)
*
Number(
anggota.rm_perharioffday || 0
),




off48:
Number(
item.off48 || 0
),


rmOff48:

Number(
item.off48 || 0
)
*
Number(
anggota.rm_perharioffday || 0
),





off8:
Number(
item.off8 || 0
),


rmOff8:

(
Number(
item.off8 || 0
)
*
Number(
anggota.rm_perjamoffday || 0
)
),





// ======================
// CUTI AM
// ======================


cuti8:
Number(
item.cuti8 || 0
),



rmCuti8:

Number(
item.cuti8 || 0
)
*
Number(
anggota.rm_perharicutiam || 0
),





cuti8p:
Number(
item.cuti8p || 0
),



rmCuti8p:

(
Number(
item.cuti8p || 0
)
*
Number(
anggota.rm_perjamcutiam || 0
)
),






jumlahRM:0



};




data.jumlahRM =


data.rmBiasa

+

data.rmOff4

+

data.rmOff48

+

data.rmOff8

+

data.rmCuti8

+

data.rmCuti8p;




laporanRK02.push(
data
);



});

// =====================================================
// SUSUN IKUT NO. SKB
// =====================================================

laporanRK02.sort((a, b) => {

    return String(a.noskb || "")
        .localeCompare(
            String(b.noskb || ""),
            undefined,
            {
                numeric: true,
                sensitivity: "base"
            }
        );

});



console.log(
"HASIL LAPORAN RK02",
laporanRK02
);



binaTableRK02();


kiraJumlahKeseluruhan();

binaRumusanKLM();

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



tbody.innerHTML = "";



let bil = 1;




laporanRK02.forEach(
(data)=>{



let tr =
document.createElement(
"tr"
);



tr.innerHTML = `


<td>
${bil}
</td>


<td>
    ${data.noskb || ""}
    /
    ${data.noAnggota || ""}
</td>


<td>

${data.nama}
</td>


<td>${formatRM(data.gaji)}</td>




<td>${data.hariBiasa}
</td>


<td>${formatRM(data.rmBiasa)}
</td>





<td>${data.off4}
</td>


<td>${formatRM(data.rmOff4)}
</td>





<td>${data.off48}
</td>


<td>${formatRM(data.rmOff48)}
</td>





<td>${data.off8}
</td>


<td>${formatRM(data.rmOff8)}
</td>






<td>
${data.cuti8}
</td>


<td>${formatRM(data.rmCuti8)}
</td>





<td>${data.cuti8p}
</td>


<td>${formatRM(data.rmCuti8p)}
</td>





<td>${formatRM(data.jumlahRM)}
</td>



`;



tbody.appendChild(
tr
);



bil++;



});

// Pastikan minimum 10 baris dipaparkan
while (bil <= 10) {

    let tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${bil}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    `;

    tbody.appendChild(tr);

    bil++;

}

}
// =====================================================
// laporan-rk02.js
// PART 3/3
// =====================================================



// =====================================================
// KIRA JUMLAH FOOTER RK02
// =====================================================

function kiraJumlahKeseluruhan(){


let jumlah = {


    hariBiasa:0,
    rmBiasa:0,


    off4:0,
    rmOff4:0,


    off48:0,
    rmOff48:0,


    off8:0,
    rmOff8:0,


    cuti8:0,
    rmCuti8:0,


    cuti8p:0,
    rmCuti8p:0,


    jumlahRM:0

};





laporanRK02.forEach(
(data)=>{


jumlah.hariBiasa +=
data.hariBiasa;


jumlah.rmBiasa +=
data.rmBiasa;



jumlah.off4 +=
data.off4;


jumlah.rmOff4 +=
data.rmOff4;



jumlah.off48 +=
data.off48;


jumlah.rmOff48 +=
data.rmOff48;



jumlah.off8 +=
data.off8;


jumlah.rmOff8 +=
data.rmOff8;



jumlah.cuti8 +=
data.cuti8;


jumlah.rmCuti8 +=
data.rmCuti8;



jumlah.cuti8p +=
data.cuti8p;


jumlah.rmCuti8p +=
data.rmCuti8p;



jumlah.jumlahRM +=
data.jumlahRM;



});



// ================================
// PAPAR FOOTER TABLE RK02
// ================================


setText(
"jumlahJamBiasa",
jumlah.hariBiasa
);



setText(
"jumlahRmBiasa",
"" + formatRM(
jumlah.rmBiasa
)
);




setText(
"jumlahHariOffKurang4",
jumlah.off4
);



setText(
"jumlahRmOffKurang4",
"" + formatRM(
jumlah.rmOff4
)
);




setText(
"jumlahHariOff48",
jumlah.off48
);



setText(
"jumlahRmOff48",
"" + formatRM(
jumlah.rmOff48
)
);




setText(
"jumlahJamOffLebih8",
jumlah.off8
);



setText(
"jumlahRmOffLebih8",
"" + formatRM(
jumlah.rmOff8
)
);




setText(
"jumlahHariCutiKurang8",
jumlah.cuti8
);



setText(
"jumlahRmCutiKurang8",
"" + formatRM(
jumlah.rmCuti8
)
);




setText(
"jumlahJamCutiLebih8",
jumlah.cuti8p
);



setText(
"jumlahRmCutiLebih8",
"" + formatRM(
jumlah.rmCuti8p
)
);




setText(
"jumlahRmKeseluruhan",
"" + formatRM(
jumlah.jumlahRM
)
);



return jumlah;



}








// =====================================================
// RUMUSAN KLM BAWAH RK02
// DATA : rk02_pos_tampungan
// =====================================================

function binaRumusanKLM(){

let jumlah = {

jamBiasa:0,
kawalan:0,
pentadbiran:0,

pemandu:0,
rmPemandu:0,

tampungan:0,
rmTampungan:0,

eskot:0,
rmEskot:0,

cit:0,
rmCit:0,

wang:0,
rmWang:0,

tambahan:0,
rmTambahan:0

};


// ===================================
// JUMLAH JAM HARI BIASA ANGGOTA
// ===================================

laporanRK02.forEach((data)=>{

jumlah.jamBiasa +=
Number(data.hari_biasa || 0);

});



// ===================================
// DATA TAMPUNGAN POS
// ===================================

dataTampungan.forEach((data)=>{


// 03 KLM TUGAS PEMANDU

jumlah.pemandu +=
    Number(data.pemandu || 0);

jumlah.rmPemandu +=
    Number(data.rm_pemandu || 0);



// 04 KLM TUGAS TAMPUNGAN POS

jumlah.tampungan +=

Number(data.jam_pos1 || 0) +
Number(data.jam_pos2 || 0) +
Number(data.jam_pos3 || 0) +
Number(data.jam_pos4 || 0) +
Number(data.jam_pos5 || 0) +
Number(data.jam_pos6 || 0);

// ===================================
// RM TUGAS TAMPUNGAN POS
// ===================================

jumlah.rmTampungan +=

Number(data.rm_pos1 || 0) +
Number(data.rm_pos2 || 0) +
Number(data.rm_pos3 || 0) +
Number(data.rm_pos4 || 0) +
Number(data.rm_pos5 || 0) +
Number(data.rm_pos6 || 0);

// 05 KLM TUGAS ESKOT

jumlah.eskot +=
Number(data.eskot || 0);



// 06 KLM TUGAS CIT

jumlah.cit +=
Number(data.cit || 0);



// 07 KLM KAWALAN WANG

jumlah.wang +=
Number(data.kawalan_wang || 0);



// 08 KLM TAMBAHAN

jumlah.tambahan +=
Number(data.kawalan_tambahan || 0);


});


// ===================================
// 02 KLM PENTADBIRAN PEJABAT
// ===================================

jumlah.pentadbiran = 0;



// ===================================
// 01 KLM TUGAS KAWALAN
// ===================================

jumlah.kawalan =

jumlah.jamBiasa

-
jumlah.pemandu

-
jumlah.tampungan

-
jumlah.eskot

-
jumlah.cit

-
jumlah.wang

-
jumlah.tambahan;



// ===================================
// JUMLAH KESELURUHAN KLM
// ===================================

let jumlahKLM =

jumlah.kawalan +
jumlah.pentadbiran +
jumlah.pemandu +
jumlah.tampungan +
jumlah.eskot +
jumlah.cit +
jumlah.wang +
jumlah.tambahan;



// ===================================
// PAPAR
// ===================================

setText("klm01", jumlah.pentadbiran);
setText("klm02", jumlah.pemandu);
    setText(
    "rmKlm02",
    formatRM(jumlah.rmPemandu)
);
setText("klm03", jumlah.tampungan);
    setText(
    "rmKlm03",
    formatRM(jumlah.rmTampungan)
);
setText("klm04", jumlah.eskot);
setText("klm05", jumlah.cit);
setText("klm06", jumlah.wang);
setText("klm07", jumlah.tambahan);
setText("klm08", jumlah.kawalan);

setText("jumlahKLM", jumlah.jamBiasa);



console.log(
"RUMUSAN KLM",
jumlah
);


}


// =====================================================
// REFRESH LAPORAN
// =====================================================

async function refreshRK02(){



await muatRK02Entry();

await muatTampungan();


prosesRK02();






alert(
"Laporan RK02 dikemaskini"
);



}









// =====================================================
// BUTTON REFRESH
// =====================================================

document.addEventListener(
"click",
(e)=>{


if(
e.target.id ===
"btnRefreshRM"
){


refreshRK02();


}



});









// =====================================================
// CETAK
// =====================================================

function cetakRK02(){


window.print();


}



// =====================================================
// MUAT CUTI AWAM
// =====================================================

async function muatCutiAwam() {

    console.log("=================================");
    console.log("MUAT CUTI AWAM");
    console.log("=================================");


    const bulanSelect =
        document.getElementById("bulan");


    if (!bulanSelect) {

        console.error(
            "SELECT BULAN TIDAK DIJUMPAI"
        );

        return;
    }


    const bulan =
        Number(bulanSelect.value);


    const namaBulan =
        SENARAI_BULAN[bulan];


    const tahun =
        new Date().getFullYear();


    console.log(
        "BULAN VALUE :",
        bulan
    );

    console.log(
        "NAMA BULAN  :",
        namaBulan
    );

    console.log(
        "TAHUN       :",
        tahun
    );


    // =============================================
    // QUERY SUPABASE
    // =============================================

    const {
        data,
        error
    } = await db
        .from("cuti_awam")
        .select(
            "id, tarikh, bulan, tahun, nama_cuti, negeri, status"
        )
        .eq(
            "bulan",
            namaBulan
        )
        .eq(
            "tahun",
            tahun
        )
        .eq(
            "status",
            "AKTIF"
        )
        .order(
            "tarikh",
            {
                ascending: true
            }
        );


    console.log(
        "DATA CUTI AWAM:",
        data
    );

    console.log(
        "ERROR CUTI AWAM:",
        error
    );


    if (error) {

        console.error(
            "RALAT SUPABASE CUTI AWAM:",
            error
        );

        return;
    }


    // =============================================
    // KOSONGKAN PAPARAN DAHULU
    // =============================================

    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        const row =
            document.getElementById(
                "cutiAwam" + i
            );


        if (row) {

            row.textContent =
                "-";

        }

    }


    // =============================================
    // TIADA DATA
    // =============================================

    if (
        !data ||
        data.length === 0
    ) {

        console.log(
            "TIADA CUTI AWAM UNTUK:",
            namaBulan,
            tahun
        );

        return;
    }


    // =============================================
    // PAPAR MAKSIMUM 5 CUTI
    // =============================================

    data
        .slice(0, 5)
        .forEach(
            (cuti, index) => {


                const row =
                    document.getElementById(
                        "cutiAwam" +
                        (index + 1)
                    );


                if (!row)
                    return;


                // =================================
                // TARIKH
                // =================================

                let paparanTarikh =
                    "-";


                if (cuti.tarikh) {

                    const tarikh =
                        new Date(
                            cuti.tarikh +
                            "T00:00:00"
                        );


                    const hari =
                        String(
                            tarikh.getDate()
                        ).padStart(
                            2,
                            "0"
                        );


                    const bulanTarikh =
                        String(
                            tarikh.getMonth() + 1
                        ).padStart(
                            2,
                            "0"
                        );


                    const tahunTarikh =
                        tarikh.getFullYear();


                    paparanTarikh =
                        `${hari}/${bulanTarikh}/${tahunTarikh}`;

                }


                // =================================
                // NAMA CUTI
                // =================================

                let paparan =
                    paparanTarikh;


                if (
                    cuti.nama_cuti
                ) {

                    paparan +=
                        " - " +
                        cuti.nama_cuti;

                }


                row.textContent =
                    paparan;

            }
        );


    console.log(
        "JUMLAH CUTI AWAM:",
        data.length
    );


    console.log(
        "CUTI AWAM SELESAI"
    );

}
