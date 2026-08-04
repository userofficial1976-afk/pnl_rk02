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


        // =============================================
        // BACA PENGGUNA
        // =============================================

        bacaPengguna();


        // =============================================
        // TETAPKAN BULAN SEMASA
        // =============================================

        tetapkanBulanSemasa();


        // =============================================
        // PASANG EVENT
        // =============================================

        pasangEventUtama();


        // =============================================
        // MUAT SENARAI POS
        // =============================================

        await muatPosKawalan();


        // =============================================
        // MUAT ANGGOTA
        // =============================================

        await muatAnggota();


        // =============================================
        // PAPAR JADUAL
        // =============================================

        paparJadualRK02();


        paparPosTampungan();


        // =============================================
        // KIRA JUMLAH
        // =============================================

        kiraSemua();


        console.log(

            "RK02 SYSTEM BERJAYA DIMULAKAN"

        );


    }

    catch(

        error

    ){


        console.error(

            "RALAT MULA SISTEM:",

            error

        );


        alert(

            "Sistem gagal dimulakan. Sila semak Console."

        );

    }

}



// =====================================================
// BACA DATA PENGGUNA
// =====================================================

function bacaPengguna(){


    const dataLocal =

    localStorage.getItem(

        "pengguna"

    )


    ||

    localStorage.getItem(

        "user"

    )


    ||

    localStorage.getItem(

        "currentUser"

    );


    if(

        !dataLocal

    ){


        console.warn(

            "DATA PENGGUNA TIDAK DIJUMPAI"

        );


        return;

    }


    try{


        pengguna =

        JSON.parse(

            dataLocal

        );


    }

    catch(

        error

    ){


        console.error(

            "RALAT BACA PENGGUNA:",

            error

        );


        pengguna = null;

    }


    if(

        !pengguna

    ){

        return;

    }


    const nama =

    pengguna.nama

    ||

    pengguna.nama_pengguna

    ||

    "PENGGUNA";


    const jawatan =

    pengguna.jawatan

    ||

    pengguna.peranan

    ||

    "PENGGUNA";


    const unit =

    pengguna.unit

    ||

    "";


    const pos =

    pengguna.poskhidmat

    ||

    pengguna.pos

    ||

    "";


    setText(

        "namaPengguna",

        nama

    );


    setText(

        "jawatanPengguna",

        jawatan

    );


    setText(

        "paparPeranan",

        jawatan

    );


    // =============================================
    // PAPAR UNIT
    // HTML PERLU GUNA id="unit"
    // =============================================

    const inputUnit =

    document.getElementById(

        "unit"

    );


    if(

        inputUnit

    ){

        inputUnit.value = unit;

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


    const sekarang =

    new Date();


    const bulan =

    sekarang.getMonth() + 1;


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


    if(

        selectBulan

    ){

        selectBulan.value =

        String(

            bulan

        );

    }


    if(

        selectTahun

    ){


        const adaTahun =

        [

            ...selectTahun.options

        ]

        .some(

            option =>

            option.value ===

            String(

                tahun

            )

        );


        if(

            adaTahun

        ){

            selectTahun.value =

            String(

                tahun

            );

        }

    }

}



// =====================================================
// MUAT SENARAI POS KAWALAN
// SUMBER:
// data_pos.pos_kawalan
// =====================================================

async function muatPosKawalan(){


    if(

        typeof supabaseClient ===

        "undefined"

    ){


        console.error(

            "supabaseClient TIDAK DIJUMPAI"

        );


        return;

    }


    const{

        data,

        error

    } = await supabaseClient

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


    if(

        error

    ){

        throw error;

    }


    dataPosKawalan =

    [

        ...new Set(

            (

                data

                ||

                []

            )

            .map(

                item =>

                String(

                    item.pos_kawalan

                    ||

                    ""

                )

                .trim()

            )

            .filter(

                pos =>

                pos !== ""

            )

        )

    ];


    console.log(

        "DATA POS KAWALAN:",

        dataPosKawalan

    );

}



// =====================================================
// MUAT DATA ANGGOTA
// =====================================================

async function muatAnggota(){


    if(

        typeof supabaseClient ===

        "undefined"

    ){

        return;

    }


    let query =

    supabaseClient

    .from(

        "Data_Anggota"

    )

    .select(

        `

        noskb,

        wilayah,

        kawasan,

        pangkat,

        noanggota,

        nama,

        pos,

        poskhidmat,

        unit,

        jawatan,

        ketua_pos,

        ketua_unit,

        status,

        gaji_pokok,

        gaji_elaun,

        rm_pehariklmbiasa,

        rm_perharioffday,

        rm_perjamoffday,

        rm_perharicutiam,

        rm_perjamcutiam

        `

    );


    // =============================================
    // FILTER UNIT
    // =============================================

    if(

        pengguna

        &&

        pengguna.unit

    ){


        query =

        query.eq(

            "unit",

            pengguna.unit

        );

    }


    // =============================================
    // FILTER POS
    // KETUA POS HANYA POS SENDIRI
    // =============================================

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


        if(

            posPengguna

        ){


            query =

            query.or(

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

    } = await query.order(

        "nama",

        {

            ascending:true

        }

    );


    if(

        error

    ){

        throw error;

    }


    dataAnggota =

    data

    ||

    [];


    console.log(

        "DATA ANGGOTA:",

        dataAnggota

    );


    kemasKiniMaklumatOperasi();

}



// =====================================================
// KEMAS KINI MAKLUMAT OPERASI
// =====================================================

function kemasKiniMaklumatOperasi(){


    if(

        dataAnggota.length === 0

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

        ketuaUnit

    );


    setText(

        "jamKhidmat",

        ketuaPos

    );


    setText(

        "jamKhidmatKlm",

        dataAnggota.length

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


    if(

        !tbody

    ){

        return;

    }


    if(

        dataAnggota.length === 0

    ){


        tbody.innerHTML = `

        <tr>

            <td colspan="13">

                TIADA DATA ANGGOTA

            </td>

        </tr>

        `;


        return;

    }


    tbody.innerHTML = "";


    dataAnggota.forEach(

        (

            anggota,

            index

        )=>{


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


            row.dataset.noSkb =

            noSkb;


            row.innerHTML = `

            <td>

                ${index + 1}

            </td>


            <td class="skb-cell">

                ${escapeHtml(noSkb)}

            </td>


            <td class="name-cell">

                ${escapeHtml(

                    anggota.nama

                    ||

                    "-"

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


            tbody.appendChild(

                row

            );

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


    if(

        !tbody

    ){

        return;

    }


    if(

        dataAnggota.length === 0

    ){


        tbody.innerHTML = `

        <tr>

            <td colspan="14">

                TIADA DATA ANGGOTA

            </td>

        </tr>

        `;


        return;

    }


    tbody.innerHTML = "";


    dataAnggota.forEach(

        (

            anggota,

            index

        )=>{


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

                ${index + 1}

            </td>


            <td class="skb-cell">

                ${escapeHtml(noSkb)}

            </td>


            <td class="name-cell">

                ${escapeHtml(

                    anggota.nama

                    ||

                    "-"

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


            tbody.appendChild(

                row

            );

        }

    );


    pasangEventPosTampungan();

}



// =====================================================
// BINA DROPDOWN POS
// SUMBER:
// data_pos.pos_kawalan
// =====================================================

function binaDropdownPos(

    nomborPos,

    noSkb

){


    let pilihan = `

    <option value="">

        -- PILIH POS --

    </option>

    `;


    dataPosKawalan.forEach(

        pos=>{


            pilihan += `

            <option

            value="${escapeHtml(pos)}"

            >

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

            ${pilihan}

        </select>

    </td>

    `;

}



// =====================================================
// BINA INPUT POS TAMPUNGAN
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

        input=>{


            input.addEventListener(

                "change",

                kiraSemua

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

                kiraSemua

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

    let jumlahJam = 0;

    let jumlahRM = 0;


    dataAnggota.forEach(

        anggota=>{


            const noSkb =

            anggota.noskb

            ||

            anggota.noanggota

            ||

            "";


            const hariBiasa =

            nilaiInput(

                "hariBiasa",

                noSkb

            );


            const jamKlmBiasa =

            nilaiInput(

                "jamKlmBiasa",

                noSkb

            );


            const off4 =

            nilaiInput(

                "off4",

                noSkb

            );


            const off48 =

            nilaiInput(

                "off48",

                noSkb

            );


            const off8 =

            nilaiInput(

                "off8",

                noSkb

            );


            const cuti8 =

            nilaiInput(

                "cuti8",

                noSkb

            );


            const cuti8P =

            nilaiInput(

                "cuti8P",

                noSkb

            );


            const cuti8L =

            nilaiInput(

                "cuti8L",

                noSkb

            );


            const jamEskot =

            nilaiInput(

                "jamEskot",

                noSkb

            );


            const klmEskot =

            nilaiInput(

                "klmEskot",

                noSkb

            );


            // =========================================
            // JUMLAH JAM
            // =========================================

            const jamSemasa =

            (

                hariBiasa * 8

            )

            +

            jamKlmBiasa

            +

            (

                off4 * 4

            )

            +

            (

                off48 * 8

            )

            +

            (

                off8 * 12

            )

            +

            (

                cuti8 * 8

            )

            +

            (

                cuti8P * 8

            )

            +

            (

                cuti8L * 12

            )

            +

            jamEskot

            +

            klmEskot;


            // =========================================
            // KADAR RM
            // =========================================

            const kadarKlmBiasa =

            nombor(

                anggota.rm_pehariklmbiasa

            );


            const kadarHariOff =

            nombor(

                anggota.rm_perharioffday

            );


            const kadarJamOff =

            nombor(

                anggota.rm_perjamoffday

            );


            const kadarHariCuti =

            nombor(

                anggota.rm_perharicutiam

            );


            const kadarJamCuti =

            nombor(

                anggota.rm_perjamcutiam

            );


            // =========================================
            // ANGGARAN RM
            // =========================================

            const rmSemasa =

            (

                jamKlmBiasa

                *

                kadarKlmBiasa

            )

            +

            (

                off4

                *

                4

                *

                kadarJamOff

            )

            +

            (

                off48

                *

                kadarHariOff

            )

            +

            (

                off8

                *

                kadarHariOff

            )

            +

            (

                cuti8

                *

                kadarHariCuti

            )

            +

            (

                cuti8P

                *

                kadarHariCuti

            )

            +

            (

                cuti8L

                *

                kadarHariCuti

            )

            +

            (

                jamEskot

                *

                kadarKlmBiasa

            )

            +

            (

                klmEskot

                *

                kadarKlmBiasa

            );


            setText(

                `[data-total-jam="${noSkb}"]`,

                formatNombor(

                    jamSemasa

                ),

                true

            );


            setText(

                `[data-total-rm="${noSkb}"]`,

                formatRM(

                    rmSemasa

                ),

                true

            );


            jumlahHariBiasa +=

            hariBiasa;


            jumlahJamKlmBiasa +=

            jamKlmBiasa;


            jumlahOff4 +=

            off4;


            jumlahOff48 +=

            off48;


            jumlahOff8 +=

            off8;


            jumlahCuti8 +=

            cuti8;


            jumlahCuti8P +=

            cuti8P;


            jumlahCuti8L +=

            cuti8L;


            jumlahJamEskot +=

            jamEskot;


            jumlahKlmEskot +=

            klmEskot;


            jumlahJam +=

            jamSemasa;


            jumlahRM +=

            rmSemasa;

        }

    );


    setText(

        "totalHariBiasa",

        formatNombor(

            jumlahHariBiasa

        )

    );


    setText(

        "totalJamKlmBiasa",

        formatNombor(

            jumlahJamKlmBiasa

        )

    );


    setText(

        "totalOff4",

        formatNombor(

            jumlahOff4

        )

    );


    setText(

        "totalOff48",

        formatNombor(

            jumlahOff48

        )

    );


    setText(

        "totalOff8",

        formatNombor(

            jumlahOff8

        )

    );


    setText(

        "totalCuti8",

        formatNombor(

            jumlahCuti8

        )

    );


    setText(

        "totalCuti8P",

        formatNombor(

            jumlahCuti8P

        )

    );


    setText(

        "totalCuti8L",

        formatNombor(

            jumlahCuti8L

        )

    );


    setText(

        "totalJamEskotTable",

        formatNombor(

            jumlahJamEskot

        )

    );


    setText(

        "totalKlmEskotTable",

        formatNombor(

            jumlahKlmEskot

        )

    );


    setText(

        "totalJamKeseluruhan",

        formatNombor(

            jumlahJam

        )

    );


    setText(

        "totalRmKeseluruhan",

        formatRM(

            jumlahRM

        )

    );

}



// =====================================================
// KIRA JUMLAH POS TAMPUNGAN
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


            const nomborPos =

            Number(

                select.dataset.pos

            );


            if(

                select.value !== ""

            ){


                jumlahPos[nomborPos]++;

            }

        }

    );


    setText(

        "totalPos1",

        jumlahPos[1]

    );


    setText(

        "totalPos2",

        jumlahPos[2]

    );


    setText(

        "totalPos3",

        jumlahPos[3]

    );


    setText(

        "totalPos4",

        jumlahPos[4]

    );


    setText(

        "totalPos5",

        jumlahPos[5]

    );


    setText(

        "totalPos6",

        jumlahPos[6]

    );


    let jumlahEskot = 0;

    let jumlahCit = 0;

    let jumlahKawalanTambahan = 0;

    let jumlahKawalanWang = 0;

    let jumlahPemandu = 0;


    document

    .querySelectorAll(

        ".input-tampungan"

    )

    .forEach(

        input=>{


            const nilai =

            nombor(

                input.value

            );


            const jenis =

            input.dataset.jenis;


            if(

                jenis === "eskot"

            ){

                jumlahEskot += nilai;

            }


            if(

                jenis === "cit"

            ){

                jumlahCit += nilai;

            }


            if(

                jenis ===

                "kawalanTambahan"

            ){

                jumlahKawalanTambahan += nilai;

            }


            if(

                jenis ===

                "kawalanWang"

            ){

                jumlahKawalanWang += nilai;

            }


            if(

                jenis ===

                "pemandu"

            ){

                jumlahPemandu += nilai;

            }

        }

    );


    setText(

        "totalEskotTampungan",

        formatNombor(

            jumlahEskot

        )

    );


    setText(

        "totalCit",

        formatNombor(

            jumlahCit

        )

    );


    setText(

        "totalKawalanTambahan",

        formatNombor(

            jumlahKawalanTambahan

        )

    );


    setText(

        "totalKawalanWang",

        formatNombor(

            jumlahKawalanWang

        )

    );


    setText(

        "totalPemandu",

        formatNombor(

            jumlahPemandu

        )

    );

}



// =====================================================
// KIRA RINGKASAN
// =====================================================

function kiraRingkasan(){


    const jumlahJam =

    nombor(

        document

        .getElementById(

            "totalJamKeseluruhan"

        )

        ?.textContent

    );


    const jumlahRM =

    nombor(

        document

        .getElementById(

            "totalRmKeseluruhan"

        )

        ?.textContent

        .replace(

            "RM",

            ""

        )

    );


    const jumlahKLM =

    nombor(

        document

        .getElementById(

            "totalJamKlmBiasa"

        )

        ?.textContent

    )


    +

    nombor(

        document

        .getElementById(

            "totalKlmEskotTable"

        )

        ?.textContent

    );


    setText(

        "summaryAnggota",

        `${dataAnggota.length} ORANG`

    );


    setText(

        "summaryJam",

        `${formatNombor(jumlahJam)} JAM`

    );


    setText(

        "summaryKlm",

        `${formatNombor(jumlahKLM)} JAM`

    );


    setText(

        "summaryPendapatan",

        formatRM(

            jumlahRM

        )

    );

}



// =====================================================
// KIRA MAKLUMAT BULANAN
// =====================================================

function kiraMaklumatBulanan(){


    const bulan =

    nombor(

        document

        .getElementById(

            "bulan"

        )

        ?.value

    );


    const tahun =

    nombor(

        document

        .getElementById(

            "tahun"

        )

        ?.value

    );


    if(

        !bulan

        ||

        !tahun

    ){

        return;

    }


    const jumlahHari =

    new Date(

        tahun,

        bulan,

        0

    )

    .getDate();


    setText(

        "namaKetuaPos",

        `${jumlahHari} HARI`

    );

}



// =====================================================
// EVENT UTAMA
// =====================================================

function pasangEventUtama(){


    const bulan =

    document.getElementById(

        "bulan"

    );


    const tahun =

    document.getElementById(

        "tahun"

    );


    if(

        bulan

    ){


        bulan.addEventListener(

            "change",

            ()=>{


                kiraMaklumatBulanan();

            }

        );

    }


    if(

        tahun

    ){


        tahun.addEventListener(

            "change",

            ()=>{


                kiraMaklumatBulanan();

            }

        );

    }


    // =============================================
    // RESET
    // =============================================

    document

    .getElementById(

        "btnReset"

    )

    ?.addEventListener(

        "click",

        resetData

    );


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


            alert(

                "Pengiraan berjaya dikemas kini."

            );

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


            kiraSemua();


            window.print();

        }

    );


    // =============================================
    // SIMPAN
    // =============================================

    document

    .getElementById(

        "btnSimpan"

    )

    ?.addEventListener(

        "click",

        simpanData

    );

}



// =====================================================
// RESET DATA
// =====================================================

function resetData(){


    const setuju =

    confirm(

        "Adakah anda pasti mahu reset semua data input?"

    );


    if(

        !setuju

    ){

        return;

    }


    document

    .querySelectorAll(

        ".rk02-input, .input-tampungan"

    )

    .forEach(

        input=>{


            input.value = 0;

        }

    );


    document

    .querySelectorAll(

        ".input-pos-tampungan"

    )

    .forEach(

        select=>{


            select.value = "";

        }

    );


    kiraSemua();

}



// =====================================================
// SIMPAN DATA
// =====================================================

async function simpanData(){


    kiraSemua();


    const bulan =

    nombor(

        document

        .getElementById(

            "bulan"

        )

        ?.value

    );


    const tahun =

    nombor(

        document

        .getElementById(

            "tahun"

        )

        ?.value

    );


    if(

        !bulan

    ){


        alert(

            "Sila pilih bulan."

        );


        return;

    }


    if(

        !tahun

    ){


        alert(

            "Sila pilih tahun."

        );


        return;

    }


    const dataSimpan =

    kumpulDataSimpan();


    console.log(

        "DATA UNTUK DISIMPAN:",

        dataSimpan

    );


    // =================================================
    // JADUAL SUPABASE BELUM DINYATAKAN
    // =================================================
    //
    // Apabila jadual simpanan telah dibuat,
    // masukkan arahan .insert() di sini.
    //
    // Buat masa ini data telah dikumpulkan
    // dan boleh diperiksa dalam Console.
    // =================================================


    alert(

        "Data berjaya diproses. Semak Console untuk data simpanan."

    );

}



// =====================================================
// KUMPUL DATA SIMPAN
// =====================================================

function kumpulDataSimpan(){


    const rekod = [];


    dataAnggota.forEach(

        anggota=>{


            const noSkb =

            anggota.noskb

            ||

            anggota.noanggota

            ||

            "";


            const posTampungan = {};


            for(

                let i = 1;

                i <= 6;

                i++

            ){


                const select =

                document.querySelector(

                    `

                    .input-pos-tampungan

                    [data-pos="${i}"]

                    `

                );


                posTampungan[

                    `pos_${i}`

                ] =

                select

                ?.value

                ||

                "";

            }


            rekod.push({

                noskb:

                noSkb,


                nama:

                anggota.nama

                ||

                "",


                bulan:

                nombor(

                    document

                    .getElementById(

                        "bulan"

                    )

                    ?.value

                ),


                tahun:

                nombor(

                    document

                    .getElementById(

                        "tahun"

                    )

                    ?.value

                ),


                hari_biasa:

                nilaiInput(

                    "hariBiasa",

                    noSkb

                ),


                jam_klm_biasa:

                nilaiInput(

                    "jamKlmBiasa",

                    noSkb

                ),


                hari_off_4:

                nilaiInput(

                    "off4",

                    noSkb

                ),


                hari_off_48:

                nilaiInput(

                    "off48",

                    noSkb

                ),


                hari_off_8:

                nilaiInput(

                    "off8",

                    noSkb

                ),


                cuti_am_8:

                nilaiInput(

                    "cuti8",

                    noSkb

                ),


                cuti_am_8p:

                nilaiInput(

                    "cuti8P",

                    noSkb

                ),


                cuti_am_8l:

                nilaiInput(

                    "cuti8L",

                    noSkb

                ),


                jam_eskot:

                nilaiInput(

                    "jamEskot",

                    noSkb

                ),


                klm_eskot:

                nilaiInput(

                    "klmEskot",

                    noSkb

                ),


                pos_tampungan:

                posTampungan

            });

        }

    );


    return rekod;

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

        .rk02-input

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

function formatRM(

    nilai

){


    return new Intl.NumberFormat(

        "ms-MY",

        {

            style:"currency",

            currency:"MYR",

            minimumFractionDigits:2

        }

    )

    .format(

        nombor(

            nilai

        )

    )

    .replace(

        "MYR",

        "RM"

    );

}



// =====================================================
// FORMAT NOMBOR
// =====================================================

function formatNombor(

    nilai

){


    return new Intl.NumberFormat(

        "ms-MY",

        {

            maximumFractionDigits:2

        }

    )

    .format(

        nombor(

            nilai

        )

    );

}



// =====================================================
// TUKAR KEPADA NOMBOR
// =====================================================

function nombor(

    nilai

){


    const hasil =

    Number(

        String(

            nilai

            ||

            0

        )

        .replace(

            /[^0-9.-]/g,

            ""

        )

    );


    return Number.isFinite(

        hasil

    )

    ?

    hasil

    :

    0;

}



// =====================================================
// SET TEXT
// =====================================================

function setText(

    idAtauSelector,

    nilai,

    gunaSelector = false

){


    let elemen;


    if(

        gunaSelector

    ){


        elemen =

        document.querySelector(

            idAtauSelector

        );


    }

    else{


        elemen =

        document.getElementById(

            idAtauSelector

        );

    }


    if(

        elemen

    ){


        elemen.textContent =

        nilai;

    }

}



// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(

    teks

){


    return String(

        teks

        ||

        ""

    )

    .replace(

        /&/g,

        "&amp;"

    )

    .replace(

        /</g,

        "&lt;"

    )

    .replace(

        />/g,

        "&gt;"

    )

    .replace(

        /"/g,

        "&quot;"

    )

    .replace(

        /'/g,

        "&#039;"

    );

}
