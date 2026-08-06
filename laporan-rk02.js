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
// INIT
// =====================================================

document.addEventListener(
"DOMContentLoaded",
async()=>{


    console.log(
        "LAPORAN RK02 SYSTEM START"
    );


    if(!supabase){

        console.error(
            "SUPABASE TIADA"
        );

        return;
    }



    await muatPengguna();

    await muatPos();

    await muatAnggota();



    binaDropdownBulan();

    binaDropdownTahun();


    pasangEventLaporan();



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



        paparHeaderLaporan();


    }

    catch(error){

        console.error(
            "LOAD PENGGUNA ERROR",
            error
        );

    }


}






// =====================================================
// PAPAR HEADER LAPORAN
// =====================================================

function paparHeaderLaporan(){


    if(!pengguna)
        return;



    setText(
        "namaPengguna",
        pengguna.nama
    );


    setText(
        "jawatanPengguna",
        pengguna.jawatan
    );


    setText(
        "unitPengguna",
        pengguna.unit
    );


    setText(
        "kodNamaPos",
        pengguna.pos
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
        "POS:",
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
        unit,
        pos,
        jawatan,

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
        "ANGGOTA:",
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
        "DUTY RK02:",
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
// BINA DROPDOWN BULAN
// =====================================================

function binaDropdownBulan(){


    let select =
    document.getElementById(
        "bulan"
    );


    if(!select)
        return;



    select.innerHTML =
    `
    <option value="">
    -- PILIH BULAN --
    </option>
    `;



    SENARAI_BULAN
    .forEach((bulan,index)=>{


        if(index>0){

            select.innerHTML +=
            `
            <option value="${index}">
            ${bulan}
            </option>
            `;

        }


    });


}







// =====================================================
// BINA DROPDOWN TAHUN
// =====================================================

function binaDropdownTahun(){


    let select =
    document.getElementById(
        "tahun"
    );


    if(!select)
        return;



    let tahun =
    new Date()
    .getFullYear();



    select.innerHTML =
    `
    <option value="">
    -- TAHUN --
    </option>
    `;



    for(
        let i=tahun-2;
        i<=tahun+1;
        i++
    ){


        select.innerHTML +=
        `
        <option value="${i}">
        ${i}
        </option>
        `;


    }


}







// =====================================================
// EVENT LAPORAN
// =====================================================

function pasangEventLaporan(){


    let btn =
    document.getElementById(
        "btnPapar"
    );


    if(btn){


        btn.onclick =
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



            await muatDuty();


            prosesLaporanRK02();


        };


    }



}








// =====================================================
// PROSES DATA RK02
// =====================================================

function prosesLaporanRK02(){



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




        let rekod = {


            no_skb:
            anggota.no_skb,


            nama:
            anggota.nama,


            pangkat:
            anggota.pangkat,


            pos:
            anggota.pos,



            tugas:
            dutyAnggota



        };



        laporanRK02.push(
            rekod
        );



    });



    console.log(
        "DATA LAPORAN RK02",
        laporanRK02
    );



    binaTableRK02();



}








// =====================================================
// BINA TABLE RK02
// =====================================================

function binaTableRK02(){



    let tbody =
    document.getElementById(
        "rk02Body"
    );



    if(!tbody)
        return;



    tbody.innerHTML="";



    let bil=1;



    laporanRK02
    .forEach(
    (data)=>{



        let tr =
        document.createElement(
            "tr"
        );



        let jumlahDuty =
        data.tugas.length;



        tr.innerHTML =

        `
        <td class="bil">
            ${bil}
        </td>


        <td>
            ${data.no_skb || ""}
        </td>


        <td>
            ${data.nama || ""}
        </td>


        <td>
            ${data.pangkat || ""}
        </td>


        <td>
            ${data.pos || ""}
        </td>


        <td class="text-center">
            ${jumlahDuty}
        </td>


        <td>
            ${paparSenaraiDuty(
                data.tugas
            )}
        </td>

        `;



        tbody.appendChild(
            tr
        );



        bil++;



    });



}









// =====================================================
// PAPAR SENARAI DUTY
// =====================================================

function paparSenaraiDuty(data){



    let html="";



    data.forEach(
    (d)=>{


        html +=
        `
        ${d.tarikh}
        -
        ${d.waktu_tugasan || ""}
        <br>
        `;


    });



    return html;


}

// =====================================================
// laporan-rk02.js
// PART 3/3
// =====================================================



// =====================================================
// KIRAAN RM RK02
// =====================================================

function kiraRMRK02(data){


    let jumlahRM = 0;


    let pecahan = {


        biasa:0,

        offday4_8:0,

        offday8:0,

        cutiam4_8:0,

        cutiam8:0


    };




    data.tugas.forEach(
    (d)=>{



        let jam =
        Number(
            d.jam_kerja || 0
        );



        let kategori =
        (d.kategori || "")
        .toUpperCase();



        let anggota =
        cariAnggota(
            data.no_skb
        );



        if(!anggota)
            return;




        // ==========================
        // HARI BIASA
        // ==========================

        if(
            kategori.includes(
                "BIASA"
            )
        ){


            let rm =
            Number(
                anggota.rm_pehariklmbiasa || 0
            );


            pecahan.biasa += rm;


            jumlahRM += rm;


        }





        // ==========================
        // OFFDAY
        // ==========================

        else if(
            kategori.includes(
                "OFF"
            )
        ){



            if(jam <= 8){


                let rm =
                Number(
                    anggota.rm_perharioffday || 0
                );



                pecahan.offday4_8 += rm;


                jumlahRM += rm;



            }
            else{


                let rmHari =
                Number(
                    anggota.rm_perharioffday || 0
                );


                let rmJam =
                Number(
                    anggota.rm_perjamoffday || 0
                )
                *
                (jam-8);



                let rm =
                rmHari + rmJam;



                pecahan.offday8 += rm;


                jumlahRM += rm;



            }



        }






        // ==========================
        // CUTI AM
        // ==========================

        else if(
            kategori.includes(
                "CUTI"
            )
        ){



            if(jam <= 8){


                let rm =
                Number(
                    anggota.rm_perharicutiam || 0
                );



                pecahan.cutiam4_8 += rm;


                jumlahRM += rm;



            }
            else{


                let rmHari =
                Number(
                    anggota.rm_perharicutiam || 0
                );



                let rmJam =
                Number(
                    anggota.rm_perjamcutiam || 0
                )
                *
                (jam-8);



                let rm =
                rmHari + rmJam;



                pecahan.cutiam8 += rm;


                jumlahRM += rm;



            }


        }



    });



    return {

        jumlahRM,

        pecahan

    };



}








// =====================================================
// CARI DATA ANGGOTA
// =====================================================

function cariAnggota(no_skb){


    return dataAnggota.find(
    (a)=>{


        return (
            a.no_skb ==
            no_skb
        );


    });



}







// =====================================================
// PAPAR JUMLAH RM
// =====================================================

function paparJumlahRM(){


    let jumlah =
    0;



    laporanRK02.forEach(
    (data)=>{


        let kira =
        kiraRMRK02(
            data
        );



        jumlah +=
        kira.jumlahRM;



    });




    setText(
        "jumlahRM",
        "RM " +
        formatRM(
            jumlah
        )
    );



}








// =====================================================
// REFRESH & SIMPAN RM
// =====================================================

async function refreshSimpanRM(){



    paparJumlahRM();



    for(
        let data of laporanRK02
    ){


        let kira =
        kiraRMRK02(
            data
        );



        await simpanRM(
            data,
            kira
        );


    }



    alert(
        "Pengiraan RM RK02 telah dikemaskini"
    );



}









// =====================================================
// SIMPAN KE SUPABASE
// =====================================================

async function simpanRM(
    data,
    kira
){



try{


    let {
        error
    }
    =
    await supabase
    .from(
        "laporan_rk02"
    )
    .upsert({



        no_skb:
        data.no_skb,


        bulan:
        bulanLaporan,


        tahun:
        tahunLaporan,


        pos:
        posLaporan,


        jumlah_rm:
        kira.jumlahRM,


        dikemaskini_pada:
        new Date()



    });



    if(error)
        throw error;



}

catch(error){


    console.error(
        "SIMPAN RM ERROR",
        error
    );


}



}







// =====================================================
// PRINT LAPORAN
// =====================================================

function cetakRK02(){


    window.print();


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


        refreshSimpanRM();


    }



});
