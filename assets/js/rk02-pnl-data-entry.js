```javascript
// =====================================================
// RK02-PNL-DATA-ENTRY.JS
// FPB DUTY COMMAND CENTER V2
// =====================================================


// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
"DOMContentLoaded",
()=>{


console.log(
"RK02 PNL SYSTEM READY"
);


// =====================================================
// GLOBAL
// =====================================================

let pengguna = null;

let dataAnggota = [];


// =====================================================
// START SYSTEM
// =====================================================

mula();


async function mula(){


    bacaPengguna();


    await muatAnggota();


    pasangButang();


}


// =====================================================
// BACA MAKLUMAT PENGGUNA
// =====================================================

function bacaPengguna(){


    pengguna =

    JSON.parse(

        localStorage.getItem(
            "fpb_user"
        )

    );


    // =============================================
    // JIKA TIADA LOGIN
    // GUNA CONTOH KETUA POS
    // =============================================

    if(!pengguna){


        pengguna = {


            nama:
            "KETUA POS F102-01",


            jawatan:
            "KETUA POS",


            unit:
            "JERANGAU",


            pos:
            "F102-01(SS)Kilang Sawit Jerangau"


        };


        localStorage.setItem(

            "fpb_user",

            JSON.stringify(
                pengguna
            )

        );


    }


    console.log(

        "PENGGUNA:",

        pengguna

    );


    // =============================================
    // PAPAR PENGGUNA
    // =============================================

    setText(

        "namaPengguna",

        pengguna.nama ?? "PENGGUNA"

    );


    setText(

        "jawatanPengguna",

        pengguna.jawatan ?? "-"

    );


    setText(

        "paparPeranan",

        pengguna.jawatan ?? "-"

    );


}


// =====================================================
// MUAT DATA ANGGOTA
// =====================================================

async function muatAnggota(){


try{


    if(

        !window.supabaseClient

    ){


        throw new Error(

            "Supabase Client tidak dijumpai"

        );


    }


    let query =

    window.supabaseClient

    .from(
        "Data_Anggota"
    )

    .select(`

        noskb,

        wilayah,

        kawasan,

        pangkat,

        nama,

        poskhidmat,

        unit,

        jawatan,

        ketua_pos,

        ketua_unit,

        rm_pehariklmbiasa,

        rm_perharioffday,

        rm_perjamoffday,

        rm_perharicutiam,

        rm_perjamcutiam

    `);


    // =================================================
    // FILTER KETUA POS
    // =================================================

    if(

        pengguna?.jawatan ===
        "KETUA POS"

    ){


        const posPengguna =

        pengguna.pos ?? "";


        if(

            posPengguna

        ){


            // Ambil kod pos sebelum kurungan
            // Contoh:
            // F102-01(SS)Kilang Sawit Jerangau
            // menjadi:
            // F102-01

            const kodPos =

            posPengguna

            .split(
                "("
            )[0]

            .trim();


            query =

            query.ilike(

                "poskhidmat",

                `%${kodPos}%`

            );


        }


    }


    // =================================================
    // FILTER KETUA UNIT
    // =================================================

    if(

        pengguna?.jawatan ===
        "KETUA UNIT"

    ){


        query =

        query.eq(

            "unit",

            pengguna.unit

        );


    }


    // =================================================
    // JALANKAN QUERY
    // =================================================

    const {

        data,

        error

    }

    =

    await query

    .order(

        "nama",

        {

            ascending:true

        }

    );


    if(error)

    throw error;


    // =================================================
    // SIMPAN DATA
    // =================================================

    dataAnggota =

    data || [];


    console.log(

        "DATA ANGGOTA:",

        dataAnggota

    );


    // =================================================
    // PAPAR SECTION
    // =================================================

    paparAnggota();


    paparPosTampungan();


    kemaskiniMaklumatOperasi();


}


catch(err){


    console.error(

        "RALAT MUAT ANGGOTA:",

        err

    );


    alert(

        "Gagal membaca Data_Anggota.\n\n" +

        err.message

    );


}


}


// =====================================================
// SECTION 4
// PAPAR DATA ENTRY ANGGOTA
// =====================================================

function paparAnggota(){


    const tbody =

    document.getElementById(

        "rk02TableBody"

    );


    if(!tbody)

    return;


    tbody.innerHTML = "";


    // =================================================
    // TIADA DATA
    // =================================================

    if(

        dataAnggota.length === 0

    ){


        tbody.innerHTML = `

        <tr>

            <td

            colspan="15"

            style="

            padding:30px;

            text-align:center;

            color:#718487;

            "

            >

                TIADA DATA ANGGOTA DIJUMPAI

            </td>

        </tr>

        `;


        setText(

            "bilanganAnggota",

            0

        );


        setText(

            "summaryAnggota",

            "0 ORANG"

        );


        return;


    }


    // =================================================
    // PAPAR ANGGOTA
    // =================================================

    dataAnggota.forEach(

    (

        a,

        i

    )=>{


        tbody.innerHTML += `


        <tr>


            <!-- BIL -->

            <td>

                ${i + 1}

            </td>


            <!-- NO SKB -->

            <td class="skb-cell">

                ${a.noskb ?? ""}

            </td>


            <!-- NAMA -->

            <td class="name-cell">

                ${a.nama ?? ""}

                <br>

                <small>

                    ${a.pangkat ?? ""}

                </small>

            </td>


            <!-- HARI BIASA -->

            <td>

                <input

                class="rk02-input hari-biasa"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- JAM KLM BIASA -->

            <td>

                <input

                class="rk02-input jam-klm-biasa"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- HARI OFF 4 JAM -->

            <td>

                <input

                class="rk02-input off-4"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- HARI OFF 4-8 JAM -->

            <td>

                <input

                class="rk02-input off-48"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- HARI OFF >8 JAM -->

            <td>

                <input

                class="rk02-input off-8"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- CUTI AM <8 JAM -->

            <td>

                <input

                class="rk02-input cuti-8"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- CUTI AM 8 JAM -->

            <td>

                <input

                class="rk02-input cuti-8p"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- CUTI AM >8 JAM -->

            <td>

                <input

                class="rk02-input cuti-8l"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- JAM ESKOT -->

            <td>

                <input

                class="rk02-input jam-eskot"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- KLM ESKOT -->

            <td>

                <input

                class="rk02-input klm-eskot"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- JUMLAH JAM -->

            <td

            class="total-cell row-jumlah-jam"

            >

                0

            </td>


            <!-- JUMLAH RM -->

            <td

            class="total-cell row-jumlah-rm"

            >

                RM 0.00

            </td>


        </tr>


        `;


    });


    // =================================================
    // EVENT INPUT
    // =================================================

    tbody

    .querySelectorAll(

        "input"

    )

    .forEach(

    input=>{


        input.addEventListener(

            "input",

            kiraSemua

        );


    });


    // =================================================
    // UPDATE BILANGAN
    // =================================================

    setText(

        "bilanganAnggota",

        dataAnggota.length

    );


    setText(

        "summaryAnggota",

        dataAnggota.length +

        " ORANG"

    );


    kiraSemua();


}


// =====================================================
// SECTION 5
// PAPAR POS TAMPUNGAN
// =====================================================

function paparPosTampungan(){


    const tbody =

    document.getElementById(

        "posTampunganTableBody"

    );


    if(!tbody)

    return;


    tbody.innerHTML = "";


    // =================================================
    // TIADA DATA
    // =================================================

    if(

        dataAnggota.length === 0

    ){


        tbody.innerHTML = `

        <tr>

            <td

            colspan="14"

            style="

            padding:30px;

            text-align:center;

            color:#718487;

            "

            >

                TIADA DATA ANGGOTA DIJUMPAI

            </td>

        </tr>

        `;


        return;


    }


    // =================================================
    // DATA SAMA SEPERTI SECTION 4
    // =================================================

    dataAnggota.forEach(

    (

        a,

        i

    )=>{


        tbody.innerHTML += `


        <tr>


            <!-- BIL -->

            <td>

                ${i + 1}

            </td>


            <!-- NO SKB -->

            <td class="skb-cell">

                ${a.noskb ?? ""}

            </td>


            <!-- NAMA -->

            <td class="name-cell">

                ${a.nama ?? ""}

                <br>

                <small>

                    ${a.pangkat ?? ""}

                </small>

            </td>


            <!-- POS 1 -->

            <td>

                <input

                class="pos-input pos-1"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- POS 2 -->

            <td>

                <input

                class="pos-input pos-2"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- POS 3 -->

            <td>

                <input

                class="pos-input pos-3"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- POS 4 -->

            <td>

                <input

                class="pos-input pos-4"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- POS 5 -->

            <td>

                <input

                class="pos-input pos-5"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- POS 6 -->

            <td>

                <input

                class="pos-input pos-6"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- ESKOT -->

            <td>

                <input

                class="pos-input eskot-tampungan"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- CIT -->

            <td>

                <input

                class="pos-input cit"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- KAWALAN TAMBAHAN -->

            <td>

                <input

                class="pos-input kawalan-tambahan"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- KAWALAN WANG -->

            <td>

                <input

                class="pos-input kawalan-wang"

                type="number"

                min="0"

                value="0"

                >

            </td>


            <!-- PEMANDU -->

            <td>

                <input

                class="pos-input pemandu"

                type="number"

                min="0"

                value="0"

                >

            </td>


        </tr>


        `;


    });


    // =================================================
    // EVENT SECTION 5
    // =================================================

    tbody

    .querySelectorAll(

        "input"

    )

    .forEach(

    input=>{


        input.addEventListener(

            "input",

            kiraJumlahPosTampungan

        );


    });


    kiraJumlahPosTampungan();


}


// =====================================================
// KIRA SEMUA SECTION 4
// =====================================================

function kiraSemua(){


    const rows =

    document.querySelectorAll(

        "#rk02TableBody tr"

    );


    let totalHariBiasa = 0;

    let totalJamKlmBiasa = 0;

    let totalOff4 = 0;

    let totalOff48 = 0;

    let totalOff8 = 0;

    let totalCuti8 = 0;

    let totalCuti8P = 0;

    let totalCuti8L = 0;

    let totalJamEskot = 0;

    let totalKlmEskot = 0;

    let totalJam = 0;

    let totalRM = 0;


    rows.forEach(

    row=>{


        const hariBiasa =

        getNilai(

            row,

            ".hari-biasa"

        );


        const jamKlmBiasa =

        getNilai(

            row,

            ".jam-klm-biasa"

        );


        const off4 =

        getNilai(

            row,

            ".off-4"

        );


        const off48 =

        getNilai(

            row,

            ".off-48"

        );


        const off8 =

        getNilai(

            row,

            ".off-8"

        );


        const cuti8 =

        getNilai(

            row,

            ".cuti-8"

        );


        const cuti8P =

        getNilai(

            row,

            ".cuti-8p"

        );


        const cuti8L =

        getNilai(

            row,

            ".cuti-8l"

        );


        const jamEskot =

        getNilai(

            row,

            ".jam-eskot"

        );


        const klmEskot =

        getNilai(

            row,

            ".klm-eskot"

        );


        // =============================================
        // JUMLAH JAM BARIS
        // =============================================

        const jumlahJam =

        hariBiasa +

        jamKlmBiasa +

        off4 +

        off48 +

        off8 +

        cuti8 +

        cuti8P +

        cuti8L +

        jamEskot +

        klmEskot;


        // =============================================
        // JUMLAH RM
        // SEMENTARA GUNA KADAR INPUT MANUAL
        // =============================================

        const kadar =

        Number(

            document.getElementById(

                "kadarBayaranSejam"

            )?.value

        ) || 0;


        const jumlahRM =

        jumlahJam *

        kadar;


        // =============================================
        // PAPAR JUMLAH BARIS
        // =============================================

        const jamCell =

        row.querySelector(

            ".row-jumlah-jam"

        );


        const rmCell =

        row.querySelector(

            ".row-jumlah-rm"

        );


        if(jamCell){


            jamCell.textContent =

            jumlahJam;


        }


        if(rmCell){


            rmCell.textContent =

            formatRM(

                jumlahRM

            );


        }


        // =============================================
        // TAMBAH JUMLAH
        // =============================================

        totalHariBiasa +=

        hariBiasa;


        totalJamKlmBiasa +=

        jamKlmBiasa;


        totalOff4 +=

        off4;


        totalOff48 +=

        off48;


        totalOff8 +=

        off8;


        totalCuti8 +=

        cuti8;


        totalCuti8P +=

        cuti8P;


        totalCuti8L +=

        cuti8L;


        totalJamEskot +=

        jamEskot;


        totalKlmEskot +=

        klmEskot;


        totalJam +=

        jumlahJam;


        totalRM +=

        jumlahRM;


    });


    // =================================================
    // FOOTER SECTION 4
    // =================================================

    setText(

        "totalHariBiasa",

        totalHariBiasa

    );


    setText(

        "totalJamKlmBiasa",

        totalJamKlmBiasa

    );


    setText(

        "totalOff4",

        totalOff4

    );


    setText(

        "totalOff48",

        totalOff48

    );


    setText(

        "totalOff8",

        totalOff8

    );


    setText(

        "totalCuti8",

        totalCuti8

    );


    setText(

        "totalCuti8P",

        totalCuti8P

    );


    setText(

        "totalCuti8L",

        totalCuti8L

    );


    setText(

        "totalJamEskotTable",

        totalJamEskot

    );


    setText(

        "totalKlmEskotTable",

        totalKlmEskot

    );


    setText(

        "totalJamKeseluruhan",

        totalJam

    );


    setText(

        "totalRmKeseluruhan",

        formatRM(

            totalRM

        )

    );


    // =================================================
    // SUMMARY
    // =================================================

    setText(

        "summaryJam",

        totalJam +

        " JAM"

    );


    setText(

        "summaryKlm",

        (

            totalJamKlmBiasa +

            totalKlmEskot

        )

        +

        " JAM"

    );


    setText(

        "summaryPendapatan",

        formatRM(

            totalRM

        )

    );


    setText(

        "jumlahPendapatan",

        formatRM(

            totalRM

        )

    );


}


// =====================================================
// KIRA JUMLAH SECTION 5
// =====================================================

function kiraJumlahPosTampungan(){


    kiraKolum(

        ".pos-1",

        "totalPos1"

    );


    kiraKolum(

        ".pos-2",

        "totalPos2"

    );


    kiraKolum(

        ".pos-3",

        "totalPos3"

    );


    kiraKolum(

        ".pos-4",

        "totalPos4"

    );


    kiraKolum(

        ".pos-5",

        "totalPos5"

    );


    kiraKolum(

        ".pos-6",

        "totalPos6"

    );


    kiraKolum(

        ".eskot-tampungan",

        "totalEskotTampungan"

    );


    kiraKolum(

        ".cit",

        "totalCit"

    );


    kiraKolum(

        ".kawalan-tambahan",

        "totalKawalanTambahan"

    );


    kiraKolum(

        ".kawalan-wang",

        "totalKawalanWang"

    );


    kiraKolum(

        ".pemandu",

        "totalPemandu"

    );


}


// =====================================================
// KIRA SATU KOLUM
// =====================================================

function kiraKolum(

selector,

targetId

){


    let jumlah = 0;


    document

    .querySelectorAll(

        selector

    )

    .forEach(

    input=>{


        jumlah +=

        Number(

            input.value

        ) || 0;


    });


    setText(

        targetId,

        jumlah

    );


}


// =====================================================
// MAKLUMAT OPERASI
// =====================================================

function kemaskiniMaklumatOperasi(){


    if(

        dataAnggota.length === 0

    )

    return;


    const anggotaPertama =

    dataAnggota[0];


    setText(

        "kodNamaPos",

        anggotaPertama.poskhidmat ??

        pengguna?.pos ??

        "-"

    );


    setText(

        "kawasan",

        anggotaPertama.kawasan ??

        "-"

    );


    setText(

        "namaKetuaUnit",

        anggotaPertama.ketua_unit ??

        "-"

    );


    setText(

        "namaKetuaPos",

        anggotaPertama.ketua_pos ??

        "-"

    );


}


// =====================================================
// PASANG EVENT BUTANG
// =====================================================

function pasangButang(){


    // =============================================
    // AUTO KIRA
    // =============================================

    document

    .getElementById(

        "btnAutoKira"

    )

    ?.addEventListener(

    "click",

    ()=>{


        kiraSemua();


        kiraJumlahPosTampungan();


    }


    );


    // =============================================
    // RESET
    // =============================================

    document

    .getElementById(

        "btnReset"

    )

    ?.addEventListener(

    "click",

    ()=>{


        const setuju =

        confirm(

            "Adakah anda pasti mahu reset semua data input?"

        );


        if(!setuju)

        return;


        document

        .querySelectorAll(

            ".rk02-table input"

        )

        .forEach(

        input=>{


            input.value = 0;


        });


        document

        .querySelectorAll(

            ".manual-box input"

        )

        .forEach(

        input=>{


            input.value = 0;


        });


        kiraSemua();


        kiraJumlahPosTampungan();


    }


    );


    // =============================================
    // CETAK
    // =============================================

    document

    .getElementById(

        "btnCetak"

    )

    ?.addEventListener(

    "click",

    ()=>{


        window.print();


    }


    );


    // =============================================
    // KADAR BAYARAN
    // =============================================

    document

    .getElementById(

        "kadarBayaranSejam"

    )

    ?.addEventListener(

    "input",

    kiraSemua

    );


    // =============================================
    // SIMPAN
    // AKAN DISAMBUNG DENGAN TABLE SUPABASE
    // =============================================

    document

    .getElementById(

        "btnSimpan"

    )

    ?.addEventListener(

    "click",

    ()=>{


        alert(

            "Fungsi simpan Supabase akan disambungkan pada langkah seterusnya."

        );


    }


    );


}


// =====================================================
// HELPER
// =====================================================

function setText(

id,

value

){


    const el =

    document.getElementById(

        id

    );


    if(el){


        el.textContent =

        value;


    }


}


// =====================================================
// AMBIL NILAI INPUT
// =====================================================

function getNilai(

parent,

selector

){


    const input =

    parent.querySelector(

        selector

    );


    if(!input)

    return 0;


    return (

        Number(

            input.value

        ) || 0

    );


}


// =====================================================
// FORMAT RM
// =====================================================

function formatRM(

nilai

){


    return (

        "RM " +

        Number(

            nilai || 0

        )

        .toLocaleString(

            "ms-MY",

            {

                minimumFractionDigits:2,

                maximumFractionDigits:2

            }

        )

    );


}
```
/* =====================================================
   SECTION 5 — POS TAMPUNGAN
===================================================== */

#posTampunganTableBody .name-cell{

    min-width:240px;

    text-align:left;

}


#posTampunganTableBody .pos-input{

    width:72px;

    height:37px;

    padding:0 6px;

    border:

    1px solid

    #d5e1e2;

    border-radius:9px;

    outline:none;

    color:#24474b;

    background:#ffffff;

    font-family:inherit;

    font-size:12px;

    font-weight:700;

    text-align:center;

}


#posTampunganTableBody .pos-input:focus{

    border-color:#247b83;

    box-shadow:

    0 0 0 3px

    rgba(
        36,
        123,
        131,
        .10
    );

}
