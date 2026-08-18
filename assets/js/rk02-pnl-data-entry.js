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
let dataOrganisasi = [];
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

    async () => {

        console.log(
            "RK02 & PNL SYSTEM READY"
        );

        await mula();

    }

);





// =====================================================
// MULA SISTEM
// =====================================================

async function mula() {

    try {

        bacaPengguna();

        kawalMenuPTW();
        
        tetapkanBulanSemasa();

        pasangEventUtama();

        await muatPosKawalan();

        isiDropdownHeaderPos();

        await muatAnggota();
        loadDataPenggantiCuti();
        await muatCutiPengganti();
        await muatDataOperasiPos();

        paparJadualRK02();

        await muatRK02();

        paparPosTampungan();

        await muatPosTampunganDisimpan();

        kiraSemua();

        console.log(
            "RK02 SYSTEM BERJAYA DIMULAKAN"
        );

    }

    catch (error) {

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

function bacaPengguna() {

    const data =

        localStorage.getItem("pengguna")
        ||
        localStorage.getItem("currentUser");


    if (!data) {

        console.warn(
            "TIADA DATA PENGGUNA"
        );

        return;

    }


    try {

        pengguna = JSON.parse(data);

        console.log(
            "DATA KETUA POS:",
            pengguna
        );

    }

    catch (error) {

        console.error(
            "DATA PENGGUNA ROSAK",
            error
        );

        pengguna = null;

    }


    // papar maklumat header

    setText(
        "namaPengguna",
        pengguna?.nama || "-"
    );


    setText(
        "jawatanPengguna",
        pengguna?.jawatan || "-"
    );


    setText(
        "unitPengguna",
        pengguna?.unit || "-"
    );


    setText(
        "kodNamaPos",
        pengguna?.poskhidmat || "-"
    );

}





// =====================================================
// BULAN SEMASA
// =====================================================

function tetapkanBulanSemasa() {

    const sekarang = new Date();

    const bulan =
        sekarang.getMonth() + 1;

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


    if (elBulan) {

        elBulan.value =
            String(bulan);

    }


    if (elTahun) {

        elTahun.value =
            String(tahun);

    }

}





// =====================================================
// LOAD POS KAWALAN
// TABLE : data_pos
// FIELD : pos_kawalan
// =====================================================

async function muatPosKawalan() {

    const {

        data,

        error

    } = await supabaseClient

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
                ascending: true
            }
        );


    if (error) {

        throw error;

    }


    dataPosKawalan =

        [...new Set(

            (data || [])

                .map(

                    x =>

                        String(
                            x.pos_kawalan || ""
                        ).trim()

                )

                .filter(
                    x => x != ""
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

async function muatAnggota() {

    console.log(
        "MULA LOAD ANGGOTA"
    );


    // ===============================
    // MAKLUMAT LOGIN
    // ===============================

    const unit =
        pengguna?.unit || "";


    const jawatan =
        String(
            pengguna?.jawatan || ""
        ).toUpperCase();


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


    if (
        jawatan.includes("KETUA POS")
    ) {

        query =
            query.eq(
                "poskhidmat",
                posKhidmat
            );

    }


    const {

        data,

        error

    } = await query

        .order(
            "nama",
            {
                ascending: true
            }
        );


    if (error) {

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

        data: organisasi,

        error: errOrganisasi

    } = await supabaseClient

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


    if (errOrganisasi) {

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

function paparMaklumatKetua() {

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

function kemasKiniMaklumatOperasi() {

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





// =====================================================
// BINA INPUT JAM POS
// =====================================================

function binaInputJamPos(
    nomborPos,
    noSkb
) {

    return `

<td>

<input

type="number"

min="0"

value=""

class="jam-pos"

data-pos="${nomborPos}"

data-skb="${noSkb}"
oninput="kiraSemua()"
>

</td>

`;

}





// =====================================================
// PAPAR JADUAL RK02
// =====================================================

function paparJadualRK02() {

    const tbody =

        document.getElementById(
            "rk02TableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    if (dataAnggota.length === 0) {

        tbody.innerHTML =

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

        (anggota, index) => {

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
${index + 1}
</td>


<td>
${escapeHtml(noSkb)}
</td>


<td>
${escapeHtml(anggota.nama)}
</td>


${binaInputRK02("hariBiasa", noSkb)}

${binaInputRK02("off4", noSkb)}

${binaInputRK02("off48", noSkb)}

${binaInputRK02("off8", noSkb)}

${binaInputRK02("cuti8", noSkb)}

${binaInputRK02("cuti8P", noSkb)}

${binaInputRK02("jamEskot", noSkb)}

${binaInputRK02("klmEskot", noSkb)}

${binaInputRK02("medical", noSkb)}

${binaInputRK02("travel", noSkb)}

${binaInputRK02("cit", noSkb)}

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

) {

    return `

<td>

<input

type="number"

min="0"

value=""

class="rk02-input"

data-jenis="${jenis}"

data-no-skb="${escapeHtml(noSkb)}"
oninput="kiraSemua()"
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

function pasangEventRK02() {

    document

        .querySelectorAll(
            ".rk02-input"
        )

        .forEach(

            input => {

                input.addEventListener(

                    "input",

                    () => {

                        kiraSemua();

                    }

                );

            }

        );

}





// =====================================================
// PAPAR POS TAMPUNGAN
// =====================================================

function paparPosTampungan() {

    const tbody =
        document.getElementById(
            "posTampunganTableBody"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    dataAnggota.forEach(
        (anggota, index) => {

            const noSkb =
                anggota.noskb ||
                anggota.noanggota ||
                "";


            tbody.innerHTML += `

<tr>

<td>
${index + 1}
</td>


<td>
${escapeHtml(noSkb)}
</td>


<td class="name-cell">
${escapeHtml(anggota.nama)}
</td>


${binaInputJamPos(1, noSkb)}

${binaInputJamPos(2, noSkb)}

${binaInputJamPos(3, noSkb)}

${binaInputJamPos(4, noSkb)}

${binaInputJamPos(5, noSkb)}

${binaInputJamPos(6, noSkb)}



<td>
<input 
type="number"
class="input-tampungan"
data-jenis="eskot"
value="">
</td>


<td>
<input 
type="number"
class="input-tampungan"
data-jenis="cit"
value="">
</td>


<td>
<input 
type="number"
class="input-tampungan"
data-jenis="kawalanTambahan"
value="">
</td>


<td>
<input 
type="number"
class="input-tampungan"
data-jenis="kawalanWang"
value="">
</td>


<td>
<input 
type="number"
class="input-tampungan"
data-jenis="pemandu"
value="">
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
) {

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
        (pos) => {

            html += `

<option value="${escapeHtml(pos)}">

${escapeHtml(pos)}

</option>

`;

        }
    );


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

) {

    return `

<td>

<input

type="number"

min="0"

value=""

class="input-tampungan"

data-jenis="${jenis}"

data-no-skb="${escapeHtml(noSkb)}"
oninput="kiraSemua()"
>

</td>

`;

}





// =====================================================
// EVENT POS TAMPUNGAN
// =====================================================

function pasangEventPosTampungan() {

    document

        .querySelectorAll(

            ".input-pos-tampungan"

        )

        .forEach(

            select => {

                select.addEventListener(

                    "change",

                    () => {

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

            input => {

                input.addEventListener(

                    "input",

                    () => {

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
        // JUMLAH PAPARAN SAHAJA
    kiraJumlahPaparanRK02();

    // =================================================
    // JUMLAH KLM DATA ENTRY ANGGOTA
    // =================================================

    kiraJumlahKLMDataEntryAnggota();


}



// =====================================================
// KIRA JADUAL RK02
// =====================================================

function kiraJadualRK02() {

    let jumlahJam = 0;

    let jumlahRM = 0;


    let jumlah = {

        hariBiasa: 0,

        jamKlmBiasa: 0,

        off4: 0,

        off48: 0,

        off8: 0,

        cuti8: 0,

        cuti8P: 0,

        cuti8L: 0,

        jamEskot: 0,

        klmEskot: 0

    };


    dataAnggota.forEach(

        anggota => {

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


            const rm =

                (jamKlmBiasa *

                    nombor(
                        anggota.rm_pehariklmbiasa
                    ))

                +

                (off4 * 4 *

                    nombor(
                        anggota.rm_perjamoffday
                    ))

                +

                (off48 *

                    nombor(
                        anggota.rm_perharioffday
                    ))

                +

                (off8 *

                    nombor(
                        anggota.rm_perharioffday
                    ))

                +

                (cuti8 *

                    nombor(
                        anggota.rm_perharicutiam
                    ))

                +

                (cuti8P *

                    nombor(
                        anggota.rm_perharicutiam
                    ))

                +

                (cuti8L *

                    nombor(
                        anggota.rm_perharicutiam
                    ))

                +

                (jamEskot *

                    nombor(
                        anggota.rm_pehariklmbiasa
                    ))

                +

                (klmEskot *

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

                    key => {

                        jumlah[key] += nilaiInput(
                            key,
                            noSkb
                        );

                    }

                );

        }

    );


    setText(
        "totalJamKeseluruhan",
        formatNombor(jumlahJam)
    );


    setText(
        "totalRmKeseluruhan",
        formatRM(jumlahRM)
    );


    for (let key in jumlah) {

        setText(

            "total" +
            key.charAt(0).toUpperCase() +
            key.slice(1),

            formatNombor(jumlah[key])

        );

    }

}





// =====================================================
// KIRA JUMLAH POS TAMPUNGAN
// =====================================================

function kiraJumlahPosTampungan() {

    let jumlahPos = {

        1: 0,

        2: 0,

        3: 0,

        4: 0,

        5: 0,

        6: 0

    };


    document

        .querySelectorAll(

            ".input-pos-tampungan"

        )

        .forEach(

            select => {

                if (select.value) {

                    jumlahPos[
                        select.dataset.pos
                    ]++;

                }

            }

        );


    for (let i = 1; i <= 6; i++) {

        setText(

            "totalPos" + i,

            jumlahPos[i]

        );

    }


    let nilai = {

        eskot: 0,

        cit: 0,

        kawalanTambahan: 0,

        kawalanWang: 0,

        pemandu: 0

    };


    document

        .querySelectorAll(

            ".input-tampungan"

        )

        .forEach(

            input => {

                let jenis =
                    input.dataset.jenis;


                if (
                    Object.prototype.hasOwnProperty.call(
                        nilai,
                        jenis
                    )
                ) {

                    nilai[jenis] += nombor(
                        input.value
                    );

                }

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





// =====================================================
// PART 3/3
// SIMPAN + HELPER FUNCTION
// =====================================================


// =====================================================
// RINGKASAN DASHBOARD
// =====================================================

function kiraRingkasan() {

    // =================================================
    // JUMLAH ANGGOTA
    // =================================================

    setText(
        "summaryAnggota",
        dataAnggota.length + " ORANG"
    );


    // =================================================
    // KLM HARI BIASA
    // =================================================

    const dataKLM =
        kiraJumlahKLMDataEntryAnggota();


    setText(
        "summaryJam",
        formatNombor(
            dataKLM.hariBiasa
        ) + " JAM"
    );


    // =================================================
    // KLM OFFDAY
    // =================================================

    setText(
        "summaryKLMOffday",

        formatNombor(
            dataKLM.offdayHari
        )
        +
        " HARI / "
        +
        formatNombor(
            dataKLM.offdayJam
        )
        +
        " JAM"
    );


    // =================================================
    // KLM CUTI AM
    // =================================================

    setText(
        "summaryKLMCutiAm",

        formatNombor(
            dataKLM.cutiAmHari
        )
        +
        " HARI / "
        +
        formatNombor(
            dataKLM.cutiAmJam
        )
        +
        " JAM"
    );


    // =================================================
    // JUMLAH KLM KESELURUHAN
    // =================================================

    setText(
        "summaryKlm",

        formatNombor(
            dataKLM.keseluruhan
        )
        +
        " JAM"
    );


    // =================================================
    // JUMLAH PENDAPATAN
    // =================================================

    const rm = nombor(

        document.getElementById(
            "totalRmKeseluruhan"
        )?.textContent

    );


    setText(
        "summaryPendapatan",

        formatRM(rm)

    );

}
// =====================================================
// EVENT UTAMA
// =====================================================

function pasangEventUtama() {

    document
        .getElementById("bulan")
        ?.addEventListener(

            "change",

            async () => {

                kiraMaklumatBulanan();


                if (dataOperasiPos) {

                    paparDataOperasiPos(
                        dataOperasiPos
                    );

                }


                await muatRK02();

                paparPosTampungan();

                await muatPosTampunganDisimpan();

            }

        );


    document
        .getElementById("tahun")
        ?.addEventListener(

            "change",

            async () => {

                kiraMaklumatBulanan();


                if (dataOperasiPos) {

                    paparDataOperasiPos(
                        dataOperasiPos
                    );

                }


                await muatRK02();

                paparPosTampungan();

                await muatPosTampunganDisimpan();

            }

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

            () => {

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

            () => {

                kiraSemua();

                window.print();

            }

        );


    document
        .getElementById("btnSimpan")
        ?.addEventListener(

            "click",

            async () => {

                await simpanPosTampungan();

                await simpanRK02();
                await simpanCutiPengganti();
            }

        );

}





// =====================================================
// RESET DATA 4 + 5
// RESET:
// 4. DATA ENTRY ANGGOTA
// 5. DATA ENTRY POS TAMPUNGAN
// TERMASUK DATA POS YANG SUDAH DISIMPAN
// =====================================================

async function resetData() {

    if (
        !confirm(
            "Reset semua Data Entry Anggota dan Data Entry Pos Tampungan?"
        )
    ) {

        return;

    }


    const bulan = Number(
        document.getElementById("bulan")?.value
    );


    const tahun = Number(
        document.getElementById("tahun")?.value
    );


    const poskhidmat =
        pengguna?.poskhidmat || "";


    // =================================================
    // 1. RESET DATA ENTRY ANGGOTA DI PAPARAN
    // =================================================

    document
        .querySelectorAll(
            ".rk02-input"
        )
        .forEach(

            input => {

                input.value = "";

            }

        );


    // =================================================
    // 2. RESET DATA POS TAMPUNGAN DI PAPARAN
    // =================================================

    document
        .querySelectorAll(
            ".input-tampungan"
        )
        .forEach(

            input => {

                input.value = 0;

            }

        );


    // =================================================
    // 3. RESET POS 1 - 6 DALAM JADUAL
    // =================================================

    document
        .querySelectorAll(
            ".input-pos-tampungan"
        )
        .forEach(

            select => {

                select.value = "";

            }

        );


    // =================================================
    // 4. RESET HEADER POS 1 - 6
    // =================================================

    for (let i = 1; i <= 6; i++) {

        const select =
            document.getElementById(
                "headerPos" + i
            );


        if (select) {

            select.value = "";

        }

    }


    // =================================================
    // 5. PADAM DATA POS TAMPUNGAN DALAM SUPABASE
    // =================================================

    if (
        bulan &&
        tahun &&
        poskhidmat
    ) {

        const {
            error
        } = await supabaseClient

            .from(
                "rk02_pos_tampungan"
            )

            .delete()

            .eq(
                "bulan",
                bulan
            )

            .eq(
                "tahun",
                tahun
            )

            .eq(
                "poskhidmat",
                poskhidmat
            );


        if (error) {

            console.error(
                "RALAT RESET POS TAMPUNGAN:",
                error
            );


            alert(
                "Gagal reset data Pos Tampungan"
            );


            return;

        }

    }


    // =================================================
    // 6. PADAM DATA RK02 DALAM SUPABASE
    // =================================================

    if (
        bulan &&
        tahun &&
        poskhidmat
    ) {

        const {
            error
        } = await supabaseClient

            .from(
                "rk02_data_entry"
            )

            .delete()

            .eq(
                "bulan",
                bulan
            )

            .eq(
                "tahun",
                tahun
            )

            .eq(
                "poskhidmat",
                poskhidmat
            );


        if (error) {

            console.error(
                "RALAT RESET RK02:",
                error
            );


            alert(
                "Gagal reset data RK02"
            );


            return;

        }

    }


    // =================================================
    // 7. KIRA SEMULA
    // =================================================

    kiraSemua();


    alert(
        "Data 4 dan 5 berjaya di-reset."
    );

}





// =====================================================
// SIMPAN POS TAMPUNGAN
// TABLE:
// rk02_pos_tampungan
// =====================================================

async function simpanPosTampungan() {

    const poskhidmat =

        document.getElementById(

            "kodNamaPos"

        )?.innerText || "";


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


    let rows = [];


    document

        .querySelectorAll(

            "#posTampunganTableBody tr"

        )

        .forEach(

            row => {

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
                        nilaiSimpan(input[0]?.value),

                    jam_pos2:
                        nilaiSimpan(input[1]?.value),

                    jam_pos3:
                        nilaiSimpan(input[2]?.value),

                    jam_pos4:
                        nilaiSimpan(input[3]?.value),

                    jam_pos5:
                        nilaiSimpan(input[4]?.value),

                    jam_pos6:
                        nilaiSimpan(input[5]?.value),

                    eskot:
                        nilaiSimpan(input[6]?.value),

                    cit:
                        nilaiSimpan(input[7]?.value),

                    kawalan_tambahan:
                        nilaiSimpan(input[8]?.value),

                    kawalan_wang:
                        nilaiSimpan(input[9]?.value),

                    pemandu:
                        nilaiSimpan(input[10]?.value)

                });

            }

        );


    if (rows.length === 0) {

        alert(
            "Tiada data untuk disimpan"
        );

        return;

    }


    const {

        error

    } = await supabaseClient

        .from(
            "rk02_pos_tampungan"
        )

        .upsert(

            rows,

            {

                onConflict:
                    "bulan,tahun,poskhidmat,no_skb"

            }

        );


    if (error) {

        console.error(
            "RALAT SIMPAN POS TAMPUNGAN:",
            error
        );


        alert(
            "Gagal simpan data"
        );


        return;

    }


    // MUAT SEMULA DATA SELEPAS SIMPAN

    await muatPosTampunganDisimpan();


    alert(
        "Data Pos Tampungan berjaya dikemaskini"
    );


    alert(
        "Data Pos Tampungan berjaya disimpan"
    );

}





// =====================================================
// KIRA MAKLUMAT BULAN
// =====================================================

function kiraMaklumatBulanan() {

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


    if (!bulan || !tahun) {

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

) {

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

function formatRM(nilai) {

    return new Intl.NumberFormat(

        "ms-MY",

        {

            style: "currency",

            currency: "MYR",

            minimumFractionDigits: 2

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

function formatNombor(nilai) {

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

function nombor(nilai) {

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
// NILAI SIMPAN
// KOSONG = NULL
// =====================================================

function nilaiSimpan(nilai) {

    return String(nilai ?? "").trim() === ""

        ?

        null

        :

        Number(nilai);

}





// =====================================================
// NILAI PAPAR
// NULL = KOSONG
// =====================================================

function nilaiPapar(nilai) {

    return (

        nilai === null ||

        nilai === undefined ||

        nilai === ""

    )

        ?

        ""

        :

        nilai;

}





// =====================================================
// SET TEXT
// =====================================================

function setText(

    id,

    nilai,

    selector = false

) {

    const elemen = selector

        ?

        document.querySelector(id)

        :

        document.getElementById(id);


    if (elemen) {

        elemen.textContent = nilai;

    }

}





// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(teks) {

    return String(teks || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}





// =====================================================
// DROPDOWN HEADER POS 1-6
// =====================================================

function isiDropdownHeaderPos() {

    for (let i = 1; i <= 6; i++) {

        const select =

            document.getElementById(

                "headerPos" + i

            );


        if (!select) {

            continue;

        }


        select.innerHTML =

            `

<option value="">

-- PILIH POS --

</option>

`;


        dataPosKawalan.forEach(

            pos => {

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

function kiraJamBulanan(jamSehari) {

    const bulan = nombor(
        document.getElementById("bulan")?.value
    );


    const tahun = nombor(
        document.getElementById("tahun")?.value
    );


    if (!bulan || !tahun) {

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
        formatNombor(jumlahJam) + " JAM"
    );

}





// =====================================================
// LOAD DATA OPERASI POS
// =====================================================

async function muatDataOperasiPos() {

    const pos =
        pengguna?.poskhidmat;


    if (!pos) {

        return;

    }


    const {

        data,

        error

    } = await supabaseClient

        .from("data_pos")

        .select(`
            pos_kawalan,
            atur_tugas,
            jam_sehari_pb,
            jam_sehari_ppb,
            kadar_rm_sehari_pb,
            kadar_rm_sehari_ppb
        `)

        .eq(
            "pos_kawalan",
            pos
        )

        .single();


    if (error) {

        console.error(
            "RALAT DATA POS:",
            error
        );

        return;

    }


    dataOperasiPos = data;


    paparDataOperasiPos(
        data
    );

}





// =====================================================
// PAPAR DATA OPERASI POS
// =====================================================

function paparDataOperasiPos(data) {

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


    const jumlahHari = new Date(
        tahun,
        bulan,
        0
    ).getDate();


    // ===============================
    // JAM KHIDMAT
    // ===============================

    const jamPBSehari = nombor(
        data.jam_sehari_pb
    );


    const jamPPBSehari = nombor(
        data.jam_sehari_ppb
    );


    const jamSehari =
        jamPBSehari + jamPPBSehari;


    const jumlahJamPB =
        jamPBSehari * jumlahHari;


    const jumlahJamPPB =
        jamPPBSehari * jumlahHari;


    // ===============================
    // PENDAPATAN
    // ===============================

    const rmPBSehari = nombor(
        data.kadar_rm_sehari_pb
    );


    const rmPPBSehari = nombor(
        data.kadar_rm_sehari_ppb
    );


    const pendapatanPB =
        rmPBSehari * jumlahJamPB;


    const pendapatanPPB =
        rmPPBSehari * jumlahJamPPB;


    const jumlahPendapatan =
        pendapatanPB + pendapatanPPB;


    // ===============================
    // PAPAR JAM
    // ===============================

    setText(
        "jamKhidmatPB",
        formatNombor(jumlahJamPB) + " JAM"
    );


    setText(
        "jamKhidmatPPB",
        formatNombor(jumlahJamPPB) + " JAM"
    );


    setText(
        "jamKhidmatSehari",
        formatNombor(jamSehari) + " JAM"
    );


    // ===============================
    // ATUR TUGAS
    // ===============================

    setText(
        "aturTugas",
        data.atur_tugas || "-"
    );


    // ===============================
    // PAPAR PENDAPATAN
    // ===============================

    setText(
        "pendapatanPB",
        formatRM(pendapatanPB)
    );


    setText(
        "pendapatanPPB",
        formatRM(pendapatanPPB)
    );


    setText(
        "jumlahPendapatan",
        formatRM(jumlahPendapatan)
    );


    // ===============================
    // JUMLAH JAM SEBULAN
    // ===============================

    kiraJamBulanan(
        jamSehari
    );

}





// =====================================================
// SIMPAN RK02 DATA ENTRY
// TABLE : rk02_data_entry
// =====================================================

async function simpanRK02() {

    const bulan = Number(
        document.getElementById(
            "bulan"
        )?.value
    );


    const tahun = Number(
        document.getElementById(
            "tahun"
        )?.value
    );


    const poskhidmat =

        document.getElementById(
            "kodNamaPos"
        )?.innerText || "";


    if (
        !bulan ||
        !tahun ||
        !poskhidmat
    ) {

        alert(
            "Sila pilih bulan, tahun dan pos"
        );

        return;

    }


    const ambilNilai = (
        row,
        jenis
    ) => {

        return nilaiSimpan(
            row.querySelector(
                `.rk02-input[data-jenis="${jenis}"]`
            )?.value
        );

    };


    const rows = [];


    document

        .querySelectorAll(

            "#rk02TableBody tr"

        )

        .forEach(

            row => {

                const no_skb =

                    row.children[1]

                        ?.innerText

                        .trim();


                const nama =

                    row.children[2]

                        ?.innerText

                        .trim();


                if (
                    !no_skb
                ) {

                    return;

                }


                rows.push({

                    bulan,

                    tahun,

                    poskhidmat,

                    no_skb,

                    nama,


                    hari_biasa:

                        ambilNilai(
                            row,
                            "hariBiasa"
                        ),


                    off4:

                        ambilNilai(
                            row,
                            "off4"
                        ),


                    off48:

                        ambilNilai(
                            row,
                            "off48"
                        ),


                    off8:

                        ambilNilai(
                            row,
                            "off8"
                        ),


                    cuti8:

                        ambilNilai(
                            row,
                            "cuti8"
                        ),


                    cuti8p:

                        ambilNilai(
                            row,
                            "cuti8P"
                        ),


                    jam_eskot:

                        ambilNilai(
                            row,
                            "jamEskot"
                        ),


                    km_eskot:

                        ambilNilai(
                            row,
                            "klmEskot"
                        ),


                    medical:

                        ambilNilai(
                            row,
                            "medical"
                        ),


                    travel:

                        ambilNilai(
                            row,
                            "travel"
                        ),


                    cit:

                        ambilNilai(
                            row,
                            "cit"
                        ),


                    dikemaskini_oleh:

                        pengguna?.nama || "-"

                });

            }

        );


    if (
        rows.length === 0
    ) {

        alert(
            "Tiada data RK02 untuk disimpan"
        );

        return;

    }


    const {

        error

    } = await supabaseClient

        .from(
            "rk02_data_entry"
        )

        .upsert(

            rows,

            {

                onConflict:

                    "bulan,tahun,poskhidmat,no_skb"

            }

        );


    if (error) {

        console.error(
            "RALAT SIMPAN RK02:",
            error
        );


        alert(
            "Gagal simpan RK02"
        );


        return;

    }


    alert(
        "RK02 berjaya disimpan"
    );

}





// =====================================================
// MUAT SEMULA DATA RK02 MENGIKUT BULAN / TAHUN / POS
// =====================================================

async function muatRK02() {

    const bulan = Number(
        document.getElementById(
            "bulan"
        )?.value
    );


    const tahun = Number(
        document.getElementById(
            "tahun"
        )?.value
    );


    const poskhidmat =

        document.getElementById(
            "kodNamaPos"
        )?.innerText || "";


    if (
        !bulan ||
        !tahun ||
        !poskhidmat
    ) {

        return;

    }


    const {

        data,

        error

    } = await supabaseClient

        .from(
            "rk02_data_entry"
        )

        .select("*")

        .eq(
            "bulan",
            bulan
        )

        .eq(
            "tahun",
            tahun
        )

        .eq(
            "poskhidmat",
            poskhidmat
        );


    if (error) {

        console.error(
            "RALAT MUAT RK02:",
            error
        );

        return;

    }


    // RESET INPUT DAHULU

    document

        .querySelectorAll(
            ".rk02-input"
        )

        .forEach(

            input => {

                input.value = "";

            }

        );


    // JIKA TIADA DATA,
    // KEKALKAN INPUT KOSONG

    if (
        !data ||
        data.length === 0
    ) {

        kiraSemua();

        return;

    }


    // PAPAR DATA YANG DISIMPAN

    data.forEach(

        rekod => {

            setNilaiRK02(
                "hariBiasa",
                rekod.no_skb,
                rekod.hari_biasa
            );


            setNilaiRK02(
                "off4",
                rekod.no_skb,
                rekod.off4
            );


            setNilaiRK02(
                "off48",
                rekod.no_skb,
                rekod.off48
            );


            setNilaiRK02(
                "off8",
                rekod.no_skb,
                rekod.off8
            );


            setNilaiRK02(
                "cuti8",
                rekod.no_skb,
                rekod.cuti8
            );


            setNilaiRK02(
                "cuti8P",
                rekod.no_skb,
                rekod.cuti8p
            );


            setNilaiRK02(
                "jamEskot",
                rekod.no_skb,
                rekod.jam_eskot
            );


            setNilaiRK02(
                "klmEskot",
                rekod.no_skb,
                rekod.km_eskot
            );


            setNilaiRK02(
                "medical",
                rekod.no_skb,
                rekod.medical
            );


            setNilaiRK02(
                "travel",
                rekod.no_skb,
                rekod.travel
            );


            setNilaiRK02(
                "cit",
                rekod.no_skb,
                rekod.cit
            );

        }

    );


    kiraSemua();

}





// =====================================================
// ISI NILAI INPUT RK02
// =====================================================

function setNilaiRK02(

    jenis,

    noSkb,

    nilai

) {

    const input =

        document.querySelector(

            `.rk02-input[data-jenis="${jenis}"][data-no-skb="${noSkb}"]`

        );


    if (input) {

        input.value =

            nilai === null ||
                nilai === undefined ||
                nilai === ""

                ?

                ""

                :

                nilai;

    }

}





// =====================================================
// MUAT SEMULA DATA POS TAMPUNGAN
// =====================================================

async function muatPosTampunganDisimpan() {

    const bulan = Number(
        document.getElementById("bulan")?.value
    );


    const tahun = Number(
        document.getElementById("tahun")?.value
    );


    const poskhidmat =
        pengguna?.poskhidmat || "";


    if (
        !bulan ||
        !tahun ||
        !poskhidmat
    ) {

        return;

    }


    const {

        data,

        error

    } = await supabaseClient

        .from(
            "rk02_pos_tampungan"
        )

        .select("*")

        .eq(
            "bulan",
            bulan
        )

        .eq(
            "tahun",
            tahun
        )

        .eq(
            "poskhidmat",
            poskhidmat
        );


    if (error) {

        console.error(
            "RALAT MUAT POS TAMPUNGAN:",
            error
        );

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        console.log(
            "TIADA DATA POS TAMPUNGAN DISIMPAN"
        );

        return;

    }


    data.forEach(
        rekod => {

            const noSkb =
                String(
                    rekod.no_skb || ""
                ).trim();


            const row =

                [...document.querySelectorAll(
                    "#posTampunganTableBody tr"
                )]

                    .find(

                        tr =>

                            String(
                                tr.children[1]
                                    ?.textContent || ""
                            )

                                .trim() === noSkb

                    );


            if (!row) {

                return;

            }


            const input =

                row.querySelectorAll(
                    "input"
                );


            input[0].value =
                nilaiPapar(
                    rekod.jam_pos1
                );


            input[1].value =
                nilaiPapar(
                    rekod.jam_pos2
                );


            input[2].value =
                nilaiPapar(
                    rekod.jam_pos3
                );


            input[3].value =
                nilaiPapar(
                    rekod.jam_pos4
                );


            input[4].value =
                nilaiPapar(
                    rekod.jam_pos5
                );


            input[5].value =
                nilaiPapar(
                    rekod.jam_pos6
                );


            input[6].value =
                nilaiPapar(
                    rekod.eskot
                );


            input[7].value =
                nilaiPapar(
                    rekod.cit
                );


            input[8].value =
                nilaiPapar(
                    rekod.kawalan_tambahan
                );


            input[9].value =
                nilaiPapar(
                    rekod.kawalan_wang
                );


            input[10].value =
                nilaiPapar(
                    rekod.pemandu
                );

        }

    );


    kiraSemua();


    console.log(
        "DATA POS TAMPUNGAN BERJAYA DIPAPAR"
    );

}


// =====================================================
// KIRA JUMLAH KLM DARIPADA DATA ENTRY ANGGOTA
// KHAS UNTUK PAPARAN JUMLAH KLM
//
// HARI BIASA
// = ambil terus input HARI BIASA
//
// OFFDAY
// = 4-8 JAM  → HARI
// = >8 JAM   → JAM
//
// CUTI AM
// = <8 JAM   → HARI
// = >8 JAM   → JAM
//
// SEMUA NILAI DIAMBIL TERUS DARIPADA INPUT
// YANG DITAIP OLEH PENGGUNA
// =====================================================

function kiraJumlahKLMDataEntryAnggota() {

    let jumlahKLMHariBiasa = 0;

    let jumlahKLMOffdayHari = 0;
    let jumlahKLMOffdayJam = 0;

    let jumlahKLMCutiAmHari = 0;
    let jumlahKLMCutiAmJam = 0;


    // =================================================
    // LOOP SEMUA ANGGOTA
    // =================================================

    dataAnggota.forEach(anggota => {

        const noSkb =
            anggota.noskb ||
            anggota.noanggota ||
            "";


        // =================================================
        // HARI BIASA
        //
        // Ambil terus nilai yang ditaip
        // pada input HARI BIASA
        //
        // Contoh:
        // 20 = 20
        // =================================================

        const hariBiasa = nilaiInput(
            "hariBiasa",
            noSkb
        );


        jumlahKLMHariBiasa += hariBiasa;


        // =================================================
        // OFFDAY
        //
        // 4 - 8 JAM
        // = HARI
        //
        // > 8 JAM
        // = JAM
        //
        // Nilai diambil terus daripada input.
        // TIDAK didarab / ditukar.
        //
        // Contoh:
        // 3 Hari = 3
        // 2 Jam  = 2
        // =================================================

        const offdayHari = nilaiInput(
            "off4",
            noSkb
        );


        const offdayJam = nilaiInput(
            "off48",
            noSkb
        );


        jumlahKLMOffdayHari += offdayHari;

        jumlahKLMOffdayJam += offdayJam;


        // =================================================
        // CUTI AM
        //
        // < 8 JAM
        // = HARI
        //
        // > 8 JAM
        // = JAM
        //
        // Nilai diambil terus daripada input.
        // TIDAK didarab / ditukar.
        //
        // Contoh:
        // 1 Hari = 1
        // 4 Jam  = 4
        // =================================================

        const cutiAmHari = nilaiInput(
            "cuti8",
            noSkb
        );


        const cutiAmJam = nilaiInput(
            "cuti8P",
            noSkb
        );


        jumlahKLMCutiAmHari += cutiAmHari;

        jumlahKLMCutiAmJam += cutiAmJam;

    });


    // =================================================
    // PAPAR JUMLAH KLM HARI BIASA
    // =================================================

    setText(
        "totalKLMHariBiasa",
        formatNombor(
            jumlahKLMHariBiasa
        )
    );


    // =================================================
    // PAPAR JUMLAH KLM OFFDAY
    // =================================================

    setText(
        "totalKLMOffdayHari",
        formatNombor(
            jumlahKLMOffdayHari
        )
    );


    setText(
        "totalKLMOffdayJam",
        formatNombor(
            jumlahKLMOffdayJam
        )
    );


    // =================================================
    // PAPAR JUMLAH KLM CUTI AM
    // =================================================

    setText(
        "totalKLMCutiAmHari",
        formatNombor(
            jumlahKLMCutiAmHari
        )
    );


    setText(
        "totalKLMCutiAmJam",
        formatNombor(
            jumlahKLMCutiAmJam
        )
    );


    // =================================================
    // JUMLAH KESELURUHAN
    //
    // HARI BIASA
    // + OFFDAY HARI
    // + OFFDAY JAM
    // + CUTI AM HARI
    // + CUTI AM JAM
    // =================================================

    const jumlahKeseluruhan =

        jumlahKLMHariBiasa +

        jumlahKLMOffdayHari +

        jumlahKLMOffdayJam +

        jumlahKLMCutiAmHari +

        jumlahKLMCutiAmJam;


    setText(
        "totalKLMKeseluruhan",
        formatNombor(
            jumlahKeseluruhan
        )
    );


    // =================================================
    // RETURN DATA
    // =================================================

    return {

        hariBiasa:
            jumlahKLMHariBiasa,

        offdayHari:
            jumlahKLMOffdayHari,

        offdayJam:
            jumlahKLMOffdayJam,

        cutiAmHari:
            jumlahKLMCutiAmHari,

        cutiAmJam:
            jumlahKLMCutiAmJam,

        keseluruhan:
            jumlahKeseluruhan

    };

}


function kiraJumlahPaparanRK02() {

    let hariBiasa = 0;
    let offdayHari = 0;
    let offdayJam = 0;
    let cutiAmHari = 0;
    let cutiAmJam = 0;
    let eskot = 0;
    let medical = 0;
    let travel = 0;
    let cit = 0;

    dataAnggota.forEach(anggota => {

        const noSkb =
            anggota.noskb ||
            anggota.noanggota ||
            "";

        hariBiasa += nilaiInput(
            "hariBiasa",
            noSkb
        );

        offdayHari += nilaiInput(
            "off4",
            noSkb
        );

        offdayJam += nilaiInput(
            "off48",
            noSkb
        );

        cutiAmHari += nilaiInput(
            "cuti8",
            noSkb
        );

        cutiAmJam += nilaiInput(
            "cuti8P",
            noSkb
        );

        eskot += nilaiInput(
            "jamEskot",
            noSkb
        );

        medical += nilaiInput(
            "medical",
            noSkb
        );

        travel += nilaiInput(
            "travel",
            noSkb
        );

        cit += nilaiInput(
            "cit",
            noSkb
        );

    });

    setText(
        "totalHariBiasa",
        formatNombor(hariBiasa)
    );

    setText(
        "totalOffdayHari",
        formatNombor(offdayHari)
    );

    setText(
        "totalOffdayJam",
        formatNombor(offdayJam)
    );

    setText(
        "totalCutiAmHari",
        formatNombor(cutiAmHari)
    );

    setText(
        "totalCutiAmJam",
        formatNombor(cutiAmJam)
    );

    setText(
        "totalEskot",
        formatNombor(eskot)
    );

    setText(
        "totalMedical",
        formatNombor(medical)
    );

    setText(
        "totalTravel",
        formatNombor(travel)
    );

    setText(
        "totalCit",
        formatNombor(cit)
    );

}

// =====================================================
// MENU LAPORAN PENUH PENGURUSAN
// AKSES PTW SAHAJA
// =====================================================

function kawalMenuPTW(){

    const menu =
        document.getElementById(
            "menuLaporanPenuhPengurusan"
        );

    if(!menu)
        return;


    let pengguna = null;


    try{

        pengguna =
            JSON.parse(
                localStorage.getItem(
                    "pengguna"
                )
            );

    }

    catch(error){

        console.error(
            "GAGAL BACA DATA PENGGUNA",
            error
        );

        return;

    }


    if(!pengguna)
        return;


    /*
     * Semak peranan pengguna.
     *
     * Sistem membenarkan:
     * PTW
     * PENGURUS PTW
     * PENGURUSAN PTW
     */

    const peranan = String(
        pengguna.peranan ||
        pengguna.role ||
        pengguna.jawatan ||
        ""
    )
    .trim()
    .toUpperCase();


    if(
        peranan === "PTW" ||
        peranan === "PENGURUS PTW" ||
        peranan === "PENGURUSAN PTW"
    ){

        menu.style.display = "flex";

    }

    else{

        menu.style.display = "none";

    }

}


// =====================================================
// DATA PENGGANTI CUTI
// GUNA DATA ANGGOTA SECTION 4
// =====================================================

let dataPenggantiCuti = [];


// =====================================================
// LOAD DATA PENGGANTI CUTI
// =====================================================

function loadDataPenggantiCuti() {

    const tbody =
        document.getElementById(
            "dataPenggantiCutiBody"
        );


    if (!tbody) {

        console.warn(
            "dataPenggantiCutiBody tidak dijumpai."
        );

        return;

    }


    // =================================================
    // KOSONGKAN PAPARAN
    // =================================================

    tbody.innerHTML = "";


    // =================================================
    // BINA DATA DARIPADA dataAnggota
    // =================================================

    dataPenggantiCuti =
        (dataAnggota || []).map(
            (anggota, index) => {

                const noSkb =
                    anggota.noskb ||
                    anggota.no_skb ||
                    anggota.noanggota ||
                    "";


                return {

                    bil:
                        index + 1,

                    skb:
                        String(noSkb),

                    nama:
                        anggota.nama || "",

                    kadarRM:
                        nombor(
                            anggota.rm_pehariklmbiasa
                        )

                };

            }
        );


    console.log(
        "DATA PENGGANTI CUTI:",
        dataPenggantiCuti
    );


    // =================================================
    // JIKA TIADA ANGGOTA
    // =================================================

    if (
        dataPenggantiCuti.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="17"
                    class="text-center text-muted"
                >

                    Tiada data anggota

                </td>

            </tr>

        `;


        kiraJumlahCuti();

        return;

    }


    // =================================================
    // PAPAR SETIAP ANGGOTA
    // =================================================

    dataPenggantiCuti.forEach(
        anggota => {

            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${anggota.bil}
                </td>


                <td class="skb-cell">
                    ${escapeHtml(anggota.skb)}
                </td>


                <td class="name-cell">
                    ${escapeHtml(anggota.nama)}
                </td>


                <!-- CUTI TAHUN -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="cuti_tahun"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>


                <td>

                    <span
                        class="rm-cuti"
                        data-rm-field="cuti_tahun"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                    >
                        RM0.00
                    </span>

                </td>


                <!-- KURSUS -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="kursus"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>


                <td>

                    <span
                        class="rm-cuti"
                        data-rm-field="kursus"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                    >
                        RM0.00
                    </span>

                </td>


                <!-- CUTI SAKIT -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="cuti_sakit"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>


                <td>

                    <span
                        class="rm-cuti"
                        data-rm-field="cuti_sakit"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                    >
                        RM0.00
                    </span>

                </td>


                <!-- CUTI EHSAN -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="cuti_ehsan"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>


                <td>

                    <span
                        class="rm-cuti"
                        data-rm-field="cuti_ehsan"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                    >
                        RM0.00
                    </span>

                </td>


                <!-- CUTI GANTI -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="cuti_ganti"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>


                <td>

                    <span
                        class="rm-cuti"
                        data-rm-field="cuti_ganti"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                    >
                        RM0.00
                    </span>

                </td>


                <!-- LAIN-LAIN 1 -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="lain1"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>


                <td>

                    <span
                        class="rm-cuti"
                        data-rm-field="lain1"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                    >
                        RM0.00
                    </span>

                </td>


                <!-- LAIN-LAIN 2 -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="lain2"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>


                <td>

                    <span
                        class="rm-cuti"
                        data-rm-field="lain2"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                    >
                        RM0.00
                    </span>

                </td>

            `;


            tbody.appendChild(tr);

        }
    );


    // =================================================
    // PASANG EVENT
    // =================================================

    pasangEventCuti();


    // =================================================
    // KIRA JUMLAH
    // =================================================

    kiraJumlahCuti();


    console.log(
        "DATA SECTION 5 BERJAYA DIPAPAR:",
        dataPenggantiCuti.length,
        "ANGGOTA"
    );

}



// =====================================================
// ISI NILAI INPUT CUTI
// =====================================================

function setNilaiCuti(
    field,
    noSkb,
    nilai
) {

    const input =
        document.querySelector(
            `.input-cuti[data-field="${field}"][data-no-skb="${CSS.escape(String(noSkb))}"]`
        );


    if (!input) {

        console.warn(
            "INPUT CUTI TIDAK DIJUMPAI:",
            field,
            noSkb
        );

        return;

    }


    input.value =
        (
            nilai === null ||
            nilai === undefined ||
            nilai === ""
        )
            ? ""
            : nilai;

}
  

    // =================================================
    // BINA DATA DARIPADA dataAnggota
    // =================================================

    dataPenggantiCuti =
        (dataAnggota || []).map(
            (anggota, index) => {

                const noSkb =
                    anggota.noskb ||
                    anggota.no_skb ||
                    anggota.noanggota ||
                    "";


                return {

                    bil:
                        index + 1,

                    skb:
                        String(noSkb),

                    nama:
                        anggota.nama || ""

                };

            }
        );


    console.log(
        "DATA PENGGANTI CUTI:",
        dataPenggantiCuti
    );


    // =================================================
    // JIKA TIADA ANGGOTA
    // =================================================

    if (
        dataPenggantiCuti.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="text-center text-muted"
                >

                    Tiada data anggota

                </td>

            </tr>

        `;

        kiraJumlahCuti();

        return;

    }


    // =================================================
    // PAPAR SETIAP ANGGOTA
    // =================================================

    dataPenggantiCuti.forEach(
        anggota => {

            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${anggota.bil}
                </td>


                <td class="skb-cell">

                    ${escapeHtml(
                        anggota.skb
                    )}

                </td>


                <td class="name-cell">

                    ${escapeHtml(
                        anggota.nama
                    )}

                </td>


                <!-- CUTI TAHUN -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="cuti_tahun"
                        data-bil="${anggota.bil}"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>


                <!-- KURSUS -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="kursus"
                        data-bil="${anggota.bil}"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>


                <!-- CUTI SAKIT -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="cuti_sakit"
                        data-bil="${anggota.bil}"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>


                <!-- CUTI EHSAN -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="cuti_ehsan"
                        data-bil="${anggota.bil}"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>


                <!-- CUTI GANTI -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="cuti_ganti"
                        data-bil="${anggota.bil}"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>


                <!-- LAIN-LAIN 1 -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="lain1"
                        data-bil="${anggota.bil}"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>


                <!-- LAIN-LAIN 2 -->

                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        class="input-cuti"
                        data-field="lain2"
                        data-bil="${anggota.bil}"
                        data-no-skb="${escapeHtml(anggota.skb)}"
                        value=""
                    >

                </td>

            `;


            tbody.appendChild(tr);

        }
    );


    // =================================================
    // PASANG EVENT INPUT
    // =================================================

    pasangEventCuti();


    // =================================================
    // KIRA JUMLAH
    // =================================================

    kiraJumlahCuti();


    console.log(
        "DATA SECTION 5 BERJAYA DIPAPAR:",
        dataPenggantiCuti.length,
        "ANGGOTA"
    );

}

// =====================================================
// KIRA RM CUTI PENGGANTI
//
// FORMULA:
//
// JAM × Data_Anggota.rm_pehariklmbiasa
//
// Contoh:
//
// jam_cuti_tahun = 8
// rm_pehariklmbiasa = 10
//
// RM = 8 × 10
//    = RM80
// =====================================================

function kiraRMKelengkapanCuti() {

    const jumlah = {

        rm_cuti_tahun: 0,

        rm_kursus: 0,

        rm_cuti_sakit: 0,

        rm_cuti_ehsan: 0,

        rm_cuti_ganti: 0,

        rm_lain1: 0,

        rm_lain2: 0

    };


    // =================================================
    // LOOP SEMUA ANGGOTA
    // =================================================

    dataAnggota.forEach(anggota => {

        const noSkb =

            anggota.noskb ||

            anggota.no_skb ||

            anggota.noanggota ||

            "";


        // =================================================
        // KADAR RM PER HARI KLM BIASA
        // DATA DARIPADA Data_Anggota
        // =================================================

        const kadarRM = nombor(

            anggota.rm_pehariklmbiasa

        );


        // =================================================
        // AMBIL JAM SETIAP CUTI
        // =================================================

        const jamCutiTahun = nilaiCutiInput(
            "cuti_tahun",
            noSkb
        );


        const jamKursus = nilaiCutiInput(
            "kursus",
            noSkb
        );


        const jamCutiSakit = nilaiCutiInput(
            "cuti_sakit",
            noSkb
        );


        const jamCutiEhsan = nilaiCutiInput(
            "cuti_ehsan",
            noSkb
        );


        const jamCutiGanti = nilaiCutiInput(
            "cuti_ganti",
            noSkb
        );


        const jamLain1 = nilaiCutiInput(
            "lain1",
            noSkb
        );


        const jamLain2 = nilaiCutiInput(
            "lain2",
            noSkb
        );


        // =================================================
        // KIRA RM
        // =================================================

        const rmCutiTahun =
            jamCutiTahun * kadarRM;


        const rmKursus =
            jamKursus * kadarRM;


        const rmCutiSakit =
            jamCutiSakit * kadarRM;


        const rmCutiEhsan =
            jamCutiEhsan * kadarRM;


        const rmCutiGanti =
            jamCutiGanti * kadarRM;


        const rmLain1 =
            jamLain1 * kadarRM;


        const rmLain2 =
            jamLain2 * kadarRM;


        // =================================================
        // JUMLAH KESELURUHAN
        // =================================================

        jumlah.rm_cuti_tahun += rmCutiTahun;

        jumlah.rm_kursus += rmKursus;

        jumlah.rm_cuti_sakit += rmCutiSakit;

        jumlah.rm_cuti_ehsan += rmCutiEhsan;

        jumlah.rm_cuti_ganti += rmCutiGanti;

        jumlah.rm_lain1 += rmLain1;

        jumlah.rm_lain2 += rmLain2;


        // =================================================
        // PAPAR RM PER ANGGOTA
        // JIKA HTML ADA DATA-RM-CUTI
        // =================================================

        setText(

            `[data-rm-cuti-tahun="${noSkb}"]`,

            formatRM(rmCutiTahun),

            true

        );


        setText(

            `[data-rm-kursus="${noSkb}"]`,

            formatRM(rmKursus),

            true

        );


        setText(

            `[data-rm-cuti-sakit="${noSkb}"]`,

            formatRM(rmCutiSakit),

            true

        );


        setText(

            `[data-rm-cuti-ehsan="${noSkb}"]`,

            formatRM(rmCutiEhsan),

            true

        );


        setText(

            `[data-rm-cuti-ganti="${noSkb}"]`,

            formatRM(rmCutiGanti),

            true

        );


        setText(

            `[data-rm-lain1="${noSkb}"]`,

            formatRM(rmLain1),

            true

        );


        setText(

            `[data-rm-lain2="${noSkb}"]`,

            formatRM(rmLain2),

            true

        );

    });


    // =================================================
    // PAPAR JUMLAH RM
    // =================================================

    setText(
        "totalRMCutiTahun",
        formatRM(jumlah.rm_cuti_tahun)
    );


    setText(
        "totalRMKursus",
        formatRM(jumlah.rm_kursus)
    );


    setText(
        "totalRMCutiSakit",
        formatRM(jumlah.rm_cuti_sakit)
    );


    setText(
        "totalRMCutiEhsan",
        formatRM(jumlah.rm_cuti_ehsan)
    );


    setText(
        "totalRMCutiGanti",
        formatRM(jumlah.rm_cuti_ganti)
    );


    setText(
        "totalRMLain1",
        formatRM(jumlah.rm_lain1)
    );


    setText(
        "totalRMLain2",
        formatRM(jumlah.rm_lain2)
    );


    // =================================================
    // JUMLAH RM SEMUA CUTI
    // =================================================

    const jumlahRM =

        jumlah.rm_cuti_tahun +

        jumlah.rm_kursus +

        jumlah.rm_cuti_sakit +

        jumlah.rm_cuti_ehsan +

        jumlah.rm_cuti_ganti +

        jumlah.rm_lain1 +

        jumlah.rm_lain2;


    setText(
        "totalRMCuti",
        formatRM(jumlahRM)
    );


    // =================================================
    // RETURN
    // =================================================

    return {

        ...jumlah,

        jumlahRM

    };

}
// =====================================================
// EVENT INPUT CUTI
// =====================================================

function pasangEventCuti() {

    document
        .querySelectorAll(".input-cuti")
        .forEach(input => {

            input.addEventListener(
                "input",
                () => {

                    // Kira jumlah JAM Section 5
                    kiraJumlahCuti();

                    // Kira RM berdasarkan
                    // Data_Anggota.rm_pehariklmbiasa
                    kiraRMKelengkapanCuti();

                    // Kemas kini kiraan keseluruhan
                    if (
                        typeof kiraSemua === "function"
                    ) {

                        kiraSemua();

                    }

                }
            );

        });


    console.log(
        "EVENT INPUT CUTI BERJAYA DIPASANG:",
        document.querySelectorAll(".input-cuti").length,
        "INPUT"
    );

}


// =====================================================
// KIRA JUMLAH CUTI
// =====================================================

function kiraJumlahCuti() {

    const jumlah = {

        cuti_tahun: 0,

        kursus: 0,

        cuti_sakit: 0,

        cuti_ehsan: 0,

        cuti_ganti: 0,

        lain1: 0,

        lain2: 0

    };


    // =================================================
    // AMBIL SEMUA INPUT CUTI
    // =================================================

    document
        .querySelectorAll(".input-cuti")
        .forEach(input => {

            const field =
                input.dataset.field;


            if (
                Object.prototype.hasOwnProperty.call(
                    jumlah,
                    field
                )
            ) {

                jumlah[field] += nombor(
                    input.value
                );

            }

        });


    // =================================================
    // JUMLAH KESELURUHAN
    // =================================================

    const keseluruhan =

        jumlah.cuti_tahun +

        jumlah.kursus +

        jumlah.cuti_sakit +

        jumlah.cuti_ehsan +

        jumlah.cuti_ganti +

        jumlah.lain1 +

        jumlah.lain2;
// =====================================================
// NILAI INPUT CUTI
// =====================================================

function nilaiCutiInput(
    jenis,
    noSkb
) {

    const input =

        document.querySelector(

            `.input-cuti[data-field="${jenis}"][data-no-skb="${CSS.escape(String(noSkb))}"]`

        );


    return nombor(
        input?.value
    );

}

    // =================================================
    // PAPAR JUMLAH
    //
    // Jika ID ini wujud dalam HTML,
    // ia akan dikemaskini.
    // =================================================

    setText(
        "totalCutiTahun",
        formatNombor(
            jumlah.cuti_tahun
        )
    );


    setText(
        "totalKursus",
        formatNombor(
            jumlah.kursus
        )
    );


    setText(
        "totalCutiSakit",
        formatNombor(
            jumlah.cuti_sakit
        )
    );


    setText(
        "totalCutiEhsan",
        formatNombor(
            jumlah.cuti_ehsan
        )
    );


    setText(
        "totalCutiGanti",
        formatNombor(
            jumlah.cuti_ganti
        )
    );


    setText(
        "totalLain1",
        formatNombor(
            jumlah.lain1
        )
    );


    setText(
        "totalLain2",
        formatNombor(
            jumlah.lain2
        )
    );


    setText(
        "totalJumlahCuti",
        formatNombor(
            keseluruhan
        )
    );

// =====================================================
// SIMPAN DATA CUTI PENGGANTI
// TABLE:
// cuti_pengganti
//
// FORMULA RM:
//
// JAM × Data_Anggota.rm_pehariklmbiasa
// =====================================================

async function simpanCutiPengganti() {

    const bulan = Number(
        document.getElementById(
            "bulan"
        )?.value
    );


    const tahun = Number(
        document.getElementById(
            "tahun"
        )?.value
    );


    const poskhidmat =

        pengguna?.poskhidmat ||

        document.getElementById(
            "kodNamaPos"
        )?.innerText ||

        "";


    // =================================================
    // SEMAK MAKLUMAT UTAMA
    // =================================================

    if (
        !bulan ||
        !tahun ||
        !poskhidmat
    ) {

        alert(
            "Sila pastikan bulan, tahun dan poskhidmat lengkap."
        );

        return;

    }


    // =================================================
    // ARRAY DATA
    // =================================================

    const rows = [];


    // =================================================
    // LOOP SEMUA ANGGOTA
    // =================================================

    dataAnggota.forEach(anggota => {

        const noSkb =

            anggota.noskb ||

            anggota.no_skb ||

            anggota.noanggota ||

            "";


        if (!noSkb) {

            return;

        }


        const nama =
            anggota.nama || "";


        // =================================================
        // KADAR RM
        // Data_Anggota.rm_pehariklmbiasa
        // =================================================

        const kadarRM = nombor(
            anggota.rm_pehariklmbiasa
        );


        // =================================================
        // AMBIL JAM
        // =================================================

        const jamCutiTahun =
            nilaiCutiInput(
                "cuti_tahun",
                noSkb
            );


        const jamKursus =
            nilaiCutiInput(
                "kursus",
                noSkb
            );


        const jamCutiSakit =
            nilaiCutiInput(
                "cuti_sakit",
                noSkb
            );


        const jamCutiEhsan =
            nilaiCutiInput(
                "cuti_ehsan",
                noSkb
            );


        const jamCutiGanti =
            nilaiCutiInput(
                "cuti_ganti",
                noSkb
            );


        const jamLain1 =
            nilaiCutiInput(
                "lain1",
                noSkb
            );


        const jamLain2 =
            nilaiCutiInput(
                "lain2",
                noSkb
            );


        // =================================================
        // KIRA RM
        // =================================================

        const rmCutiTahun =
            jamCutiTahun * kadarRM;


        const rmKursus =
            jamKursus * kadarRM;


        const rmCutiSakit =
            jamCutiSakit * kadarRM;


        const rmCutiEhsan =
            jamCutiEhsan * kadarRM;


        const rmCutiGanti =
            jamCutiGanti * kadarRM;


        const rmLain1 =
            jamLain1 * kadarRM;


        const rmLain2 =
            jamLain2 * kadarRM;


        // =================================================
        // BINA ROW
        // =================================================

        rows.push({

            bulan,

            tahun,

            poskhidmat,

            no_skb: noSkb,

            nama,


            // ===============================
            // JAM
            // ===============================

            jam_cuti_tahun:
                jamCutiTahun,

            jam_kursus:
                jamKursus,

            jam_cuti_sakit:
                jamCutiSakit,

            jam_cuti_ehsan:
                jamCutiEhsan,

            jam_cuti_ganti:
                jamCutiGanti,

            jam_lain1:
                jamLain1,

            jam_lain2:
                jamLain2,


            // ===============================
            // RM
            // ===============================

            rm_cuti_tahun:
                rmCutiTahun,

            rm_kursus:
                rmKursus,

            rm_cuti_sakit:
                rmCutiSakit,

            rm_cuti_ehsan:
                rmCutiEhsan,

            rm_cuti_ganti:
                rmCutiGanti,

            rm_lain1:
                rmLain1,

            rm_lain2:
                rmLain2,


            // ===============================
            // USER
            // ===============================

            dikemaskini_oleh:
                pengguna?.nama || "-"

        });

    });


    // =================================================
    // SEMAK ROW
    // =================================================

    if (
        rows.length === 0
    ) {

        alert(
            "Tiada data Cuti Pengganti untuk disimpan."
        );

        return;

    }


    console.log(
        "DATA CUTI PENGGANTI UNTUK SIMPAN:",
        rows
    );


    // =================================================
    // UPSERT SUPABASE
    // =================================================

    const {
        error
    } = await supabaseClient

        .from(
            "cuti_pengganti"
        )

        .upsert(

            rows,

            {

                onConflict:
                    "bulan,tahun,poskhidmat,no_skb"

            }

        );


    if (error) {

        console.error(
            "RALAT SIMPAN CUTI PENGGANTI:",
            error
        );


        alert(
            "Gagal simpan Cuti Pengganti:\n" +
            error.message
        );


        return;

    }

// =====================================================
// LOAD DATA CUTI PENGGANTI
// MENGIKUT:
// BULAN + TAHUN + POS
// =====================================================

async function muatCutiPengganti() {

    const bulan =
        Number(
            document.getElementById("bulan")?.value
        );

    const tahun =
        Number(
            document.getElementById("tahun")?.value
        );

    const poskhidmat =
        pengguna?.poskhidmat || "";


    if (
        !bulan ||
        !tahun ||
        !poskhidmat
    ) {

        return;

    }


    const {
        data,
        error
    } = await supabaseClient
        .from("cuti_pengganti")
        .select("*")
        .eq("bulan", bulan)
        .eq("tahun", tahun)
        .eq("poskhidmat", poskhidmat);


    if (error) {

        console.error(
            "RALAT LOAD CUTI PENGGANTI:",
            error
        );

        return;

    }


    console.log(
        "DATA CUTI PENGGANTI DISIMPAN:",
        data
    );


    document
        .querySelectorAll(
            "#dataPenggantiCutiBody .input-cuti"
        )
        .forEach(input => {

            input.value = "";

        });


    if (
        !data ||
        data.length === 0
    ) {

        kiraJumlahCuti();

        return;

    }


    data.forEach(rekod => {

        const noSkb =
            String(
                rekod.no_skb || ""
            ).trim();


        setNilaiCuti(
            "cuti_tahun",
            noSkb,
            rekod.jam_cuti_tahun
        );


        setNilaiCuti(
            "kursus",
            noSkb,
            rekod.jam_kursus
        );


        setNilaiCuti(
            "cuti_sakit",
            noSkb,
            rekod.jam_cuti_sakit
        );


        setNilaiCuti(
            "cuti_ehsan",
            noSkb,
            rekod.jam_cuti_ehsan
        );


        setNilaiCuti(
            "cuti_ganti",
            noSkb,
            rekod.jam_cuti_ganti
        );


        setNilaiCuti(
            "lain1",
            noSkb,
            rekod.jam_lain1
        );


        setNilaiCuti(
            "lain2",
            noSkb,
            rekod.jam_lain2
        );

    });


    kiraJumlahCuti();


    console.log(
        "DATA CUTI PENGGANTI BERJAYA DIMUAT:",
        data.length
    );

}


    // =================================================
    // RESET SEMUA INPUT
    // =================================================

    document
        .querySelectorAll(
            ".input-cuti"
        )
        .forEach(input => {

            input.value = "";

        });


    // =================================================
    // TIADA DATA
    // =================================================

    if (
        !data ||
        data.length === 0
    ) {

        kiraJumlahCuti();

        kiraRMKelengkapanCuti();

        return;

    }


    // =================================================
    // MASUKKAN DATA
    // =================================================

    data.forEach(rekod => {

        setNilaiCuti(
            "cuti_tahun",
            rekod.no_skb,
            rekod.jam_cuti_tahun
        );


        setNilaiCuti(
            "kursus",
            rekod.no_skb,
            rekod.jam_kursus
        );


        setNilaiCuti(
            "cuti_sakit",
            rekod.no_skb,
            rekod.jam_cuti_sakit
        );


        setNilaiCuti(
            "cuti_ehsan",
            rekod.no_skb,
            rekod.jam_cuti_ehsan
        );


        setNilaiCuti(
            "cuti_ganti",
            rekod.no_skb,
            rekod.jam_cuti_ganti
        );


        setNilaiCuti(
            "lain1",
            rekod.no_skb,
            rekod.jam_lain1
        );


        setNilaiCuti(
            "lain2",
            rekod.no_skb,
            rekod.jam_lain2
        );

    });

// =====================================================
// SET NILAI INPUT CUTI
// =====================================================

function setNilaiCuti(
    jenis,
    noSkb,
    nilai
) {

    const input =

        document.querySelector(

            `.input-cuti[data-field="${jenis}"][data-no-skb="${CSS.escape(String(noSkb))}"]`

        );


    if (!input) {

        return;

    }


    input.value =

        nilai === null ||
        nilai === undefined ||
        nilai === ""

            ? ""

            : nilai;

}
    // =================================================
    // KIRA SEMULA
    // =================================================

    kiraJumlahCuti();

    kiraRMKelengkapanCuti();


    console.log(
        "DATA CUTI PENGGANTI BERJAYA DIMUAT:",
        data
    );

}
    // =================================================
    // BERJAYA
    // =================================================

    alert(
        "Data Cuti Pengganti berjaya disimpan."
    );

}
    // =================================================
    // RETURN DATA
    // =================================================

    return {

        cuti_tahun:
            jumlah.cuti_tahun,

        kursus:
            jumlah.kursus,

        cuti_sakit:
            jumlah.cuti_sakit,

        cuti_ehsan:
            jumlah.cuti_ehsan,

        cuti_ganti:
            jumlah.cuti_ganti,

        lain1:
            jumlah.lain1,

        lain2:
            jumlah.lain2,

        keseluruhan

    };

}
