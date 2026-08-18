
// =====================================================
// LAPORAN PENUH PENGURUSAN
// FPB DUTY COMMAND CENTER V2
// =====================================================


// =====================================================
// GLOBAL
// =====================================================

let pengguna = null;

let dataAnggota = [];

let dataDuty = [];

let dataRK02 = [];

let dataTampungan = [];

let dataPos = [];

let laporanPos = [];

let bulanSemasa = 0;

let tahunSemasa = 0;


// =====================================================
// SUPABASE
// =====================================================

const db = window.supabaseClient;


// =====================================================
// BULAN
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
    async function(){

        console.log(
            "LAPORAN PENUH PENGURUSAN START"
        );


        if(!db){

            setStatus(
                "Supabase client tidak dijumpai."
            );

            return;

        }


        muatPengguna();

        tetapkanBulanSemasa();

        pasangEvent();


        console.log(
            "LAPORAN PENUH PENGURUSAN READY"
        );

    }
);


// =====================================================
// PENGGUNA
// =====================================================

function muatPengguna(){

    try{

        const simpanan =
            localStorage.getItem(
                "pengguna"
            );


        if(!simpanan){

            console.warn(
                "PENGGUNA TIDAK DIJUMPAI"
            );

            return;

        }


        pengguna =
            JSON.parse(
                simpanan
            );


        const nama =
            document.getElementById(
                "namaPengguna"
            );


        if(nama){

            nama.textContent =
                pengguna.nama || "-";

        }


        const jawatan =
            document.getElementById(
                "jawatanPengguna"
            );


        if(jawatan){

            jawatan.textContent =
                pengguna.jawatan || "-";

        }


        const avatar =
            document.getElementById(
                "avatarPengguna"
            );


        if(avatar){

            const namaPenuh =
                String(
                    pengguna.nama || "PT"
                )
                .trim();


            avatar.textContent =
                namaPenuh
                    .split(/\s+/)
                    .map(
                        perkataan =>
                            perkataan.charAt(0)
                    )
                    .join("")
                    .substring(0,2)
                    .toUpperCase();

        }

    }

    catch(error){

        console.error(
            "MUAT PENGGUNA ERROR:",
            error
        );

    }

}


// =====================================================
// BULAN SEMASA
// =====================================================

function tetapkanBulanSemasa(){

    const bulan =
        document.getElementById(
            "bulan"
        );


    const tahun =
        document.getElementById(
            "tahun"
        );


    const sekarang =
        new Date();


    if(bulan){

        bulan.value =
            sekarang.getMonth() + 1;

    }


    if(tahun){

        tahun.value =
            String(
                sekarang.getFullYear()
            );

    }

}


// =====================================================
// EVENT
// =====================================================

function pasangEvent(){

    document
        .getElementById("btnPapar")
        ?.addEventListener(
            "click",
            paparLaporan
        );


    document
        .getElementById("btnCetak")
        ?.addEventListener(
            "click",
            function(){

                window.print();

            }
        );

}


// =====================================================
// PAPAR LAPORAN
// =====================================================

async function paparLaporan(){

    bulanSemasa =
        Number(
            document.getElementById(
                "bulan"
            ).value
        );


    tahunSemasa =
        Number(
            document.getElementById(
                "tahun"
            ).value
        );


    if(
        !bulanSemasa ||
        !tahunSemasa
    ){

        alert(
            "Sila pilih bulan dan tahun."
        );

        return;

    }


    kemasKiniHeader();


    setStatus(
        "Sedang mengambil data daripada Supabase..."
    );


    resetLaporan();


    try{

        await muatSemuaData();

        binaLaporanPos();

        binaJadual();

        binaSummary();

        setStatus(
            `${laporanPos.length} Pos berjaya dipaparkan untuk ${SENARAI_BULAN[bulanSemasa]} ${tahunSemasa}.`
        );

    }

    catch(error){

        console.error(
            "LAPORAN ERROR:",
            error
        );


        setStatus(
            "Gagal memuatkan laporan. Sila semak console."
        );


        alert(
            "Gagal memuatkan laporan.\n\n"
            +
            error.message
        );

    }

}


// =====================================================
// HEADER
// =====================================================

function kemasKiniHeader(){

    const tempoh =
        SENARAI_BULAN[
            bulanSemasa
        ]
        +
        " "
        +
        tahunSemasa;


    document.getElementById(
        "heroBulanTahun"
    ).textContent =
        tempoh;


    document.getElementById(
        "reportSubtitle"
    ).textContent =
        tempoh
        +
        " — WILAYAH TERENGGANU";


    document.getElementById(
        "finalBulan"
    ).textContent =
        tempoh;

}


// =====================================================
// RESET
// =====================================================

function resetLaporan(){

    dataAnggota = [];

    dataDuty = [];

    dataRK02 = [];

    dataTampungan = [];

    dataPos = [];

    laporanPos = [];


    document.getElementById(
        "laporanTableBody"
    ).innerHTML = `

        <tr>

            <td
                colspan="17"
                class="empty-row"
            >
                Sedang memuatkan data...
            </td>

        </tr>

    `;

}


// =====================================================
// MUAT SEMUA DATA
// =====================================================

async function muatSemuaData(){

    await Promise.all([

        muatAnggota(),

        muatDuty(),

        muatRK02(),

        muatTampungan(),

        muatPos()

    ]);

}


// =====================================================
// DATA ANGGOTA
// =====================================================

async function muatAnggota(){

    const {

        data,
        error

    } =
    await db
        .from("Data_Anggota")
        .select("*");


    if(error)
        throw error;


    dataAnggota =
        data || [];


    console.log(
        "DATA ANGGOTA:",
        dataAnggota.length
    );

}


// =====================================================
// JADUAL DUTY
// =====================================================

async function muatDuty(){

    const {

        data,
        error

    } =
    await db
        .from("jadual_duty")
        .select("*")
        .eq(
            "bulan",
            String(
                bulanSemasa
            )
        )
        .eq(
            "tahun",
            String(
                tahunSemasa
            )
        );


    if(error)
        throw error;


    dataDuty =
        data || [];


    console.log(
        "DATA DUTY:",
        dataDuty.length
    );

}


// =====================================================
// RK02
// =====================================================

async function muatRK02(){

    const {

        data,
        error

    } =
    await db
        .from("rk02_data_entry")
        .select("*")
        .eq(
            "bulan",
            bulanSemasa
        )
        .eq(
            "tahun",
            tahunSemasa
        );


    if(error)
        throw error;


    dataRK02 =
        data || [];


    console.log(
        "DATA RK02:",
        dataRK02.length
    );

}


// =====================================================
// TAMPUNGAN
// =====================================================

async function muatTampungan(){

    const {

        data,
        error

    } =
    await db
        .from("rk02_pos_tampungan")
        .select("*")
        .eq(
            "bulan",
            bulanSemasa
        )
        .eq(
            "tahun",
            tahunSemasa
        );


    if(error)
        throw error;


    dataTampungan =
        data || [];


    console.log(
        "DATA TAMPUNGAN:",
        dataTampungan.length
    );

}


// =====================================================
// DATA POS
// =====================================================

async function muatPos(){

    const {

        data,
        error

    } =
    await db
        .from("data_pos")
        .select("*");


    if(error){

        console.warn(
            "DATA POS TIDAK BOLEH DIMUAT:",
            error
        );

        dataPos = [];

        return;

    }


    dataPos =
        data || [];


    console.log(
        "DATA POS:",
        dataPos.length
    );

}


// =====================================================
// BINA LAPORAN POS
// =====================================================

function binaLaporanPos(){

    const senaraiPos =
        new Map();


    // ---------------------------------------------
    // DATA ANGGOTA
    // ---------------------------------------------

    dataAnggota.forEach(
        anggota => {

            const pos =
                String(
                    anggota.poskhidmat || ""
                ).trim();


            if(!pos)
                return;


            if(!senaraiPos.has(pos)){

                senaraiPos.set(
                    pos,
                    {
                        pos:pos,
                        namaPos:cariNamaPos(pos),
                        anggota:new Set(),
                        hariBiasa:0,
                        rmHariBiasa:0,
                        off4Hari:0,
                        off4RM:0,
                        off48Hari:0,
                        off48RM:0,
                        off8Jam:0,
                        off8RM:0,
                        cuti8Hari:0,
                        cuti8RM:0,
                        cuti8PJam:0,
                        cuti8PRM:0,
                        klm:0,
                        rm:0
                    }
                );

            }

        }
    );


    // ---------------------------------------------
    // JADUAL DUTY
    // ---------------------------------------------

    dataDuty.forEach(
        row => {

            const pos =
                String(
                    row.poskhidmat
                    ||
                    row.pos
                    ||
                    ""
                ).trim();


            if(!pos)
                return;


            if(!senaraiPos.has(pos)){

                senaraiPos.set(
                    pos,
                    kosongPos(pos)
                );

            }


            const item =
                senaraiPos.get(pos);


            if(row.no_skb){

                item.anggota.add(
                    String(
                        row.no_skb
                    )
                );

            }


            const jam =
                nombor(
                    row.jam_kerja
                    ||
                    row.jam_klm
                );


            const rm =
                kiraRMRow(
                    row
                );


            item.hariBiasa += jam;

            item.rmHariBiasa += rm;

            item.klm += jam;

            item.rm += rm;

        }
    );


    // ---------------------------------------------
    // RK02 DATA ENTRY
    // ---------------------------------------------

    dataRK02.forEach(
        row => {

            const anggota =
                cariAnggota(
                    row.no_skb
                );


            const pos =
                String(
                    row.poskhidmat
                    ||
                    anggota?.poskhidmat
                    ||
                    ""
                ).trim();


            if(!pos)
                return;


            if(!senaraiPos.has(pos)){

                senaraiPos.set(
                    pos,
                    kosongPos(pos)
                );

            }


            const item =
                senaraiPos.get(pos);


            if(row.no_skb){

                item.anggota.add(
                    String(
                        row.no_skb
                    )
                );

            }


            // Hari biasa

            const hariBiasa =
                nombor(
                    row.hari_biasa
                );


            const kadar =
                kadarRM(
                    anggota
                );


            const rmHariBiasa =
                hariBiasa * kadar;


            item.hariBiasa +=
                hariBiasa;


            item.rmHariBiasa +=
                rmHariBiasa;


            item.klm +=
                hariBiasa;


            item.rm +=
                rmHariBiasa;


            // OFF 4

            const off4 =
                nombor(
                    row.off4
                );


            item.off4Hari +=
                off4;


            item.off4RM +=
                off4 * kadar;


            item.klm +=
                off4;


            item.rm +=
                off4 * kadar;


            // OFF 4-8

            const off48 =
                nombor(
                    row.off48
                );


            item.off48Hari +=
                off48;


            item.off48RM +=
                off48 * kadar;


            item.klm +=
                off48;


            item.rm +=
                off48 * kadar;


            // OFF > 8

            const off8 =
                nombor(
                    row.off8
                );


            item.off8Jam +=
                off8;


            item.off8RM +=
                off8 * kadar;


            item.klm +=
                off8;


            item.rm +=
                off8 * kadar;


            // CUTI < 8

            const cuti8 =
                nombor(
                    row.cuti8
                );


            item.cuti8Hari +=
                cuti8;


            item.cuti8RM +=
                cuti8 * kadar;


            item.klm +=
                cuti8;


            item.rm +=
                cuti8 * kadar;


            // CUTI > 8

            const cuti8P =
                nombor(
                    row.cuti8p
                );


            item.cuti8PJam +=
                cuti8P;


            item.cuti8PRM +=
                cuti8P * kadar;


            item.klm +=
                cuti8P;


            item.rm +=
                cuti8P * kadar;

        }
    );


    // ---------------------------------------------
    // TAMPUNGAN
    // ---------------------------------------------

    dataTampungan.forEach(
        row => {

            const anggota =
                cariAnggota(
                    row.no_skb
                );


            const pos =
                String(
                    row.poskhidmat
                    ||
                    anggota?.poskhidmat
                    ||
                    ""
                ).trim();


            if(!pos)
                return;


            if(!senaraiPos.has(pos)){

                senaraiPos.set(
                    pos,
                    kosongPos(pos)
                );

            }


            const item =
                senaraiPos.get(pos);


            if(row.no_skb){

                item.anggota.add(
                    String(
                        row.no_skb
                    )
                );

            }


            const kadar =
                kadarRM(
                    anggota
                );


            for(
                let i=1;
                i<=6;
                i++
            ){

                const jam =
                    nombor(
                        row[
                            `jam_pos${i}`
                        ]
                    );


                const rm =
                    jam * kadar;


                item.klm += jam;

                item.rm += rm;

            }


            const eskot =
                nombor(
                    row.eskot
                );


            item.klm +=
                eskot;

            item.rm +=
                eskot * kadar;


            const cit =
                nombor(
                    row.cit
                );


            item.klm +=
                cit;

            item.rm +=
                cit * kadar;


            const kawalan =
                nombor(
                    row.kawalan_tambahan
                );


            item.klm +=
                kawalan;

            item.rm +=
                kawalan * kadar;


            const kawalanWang =
                nombor(
                    row.kawalan_wang
                );


            item.klm +=
                kawalanWang;

            item.rm +=
                kawalanWang * kadar;


            const pemandu =
                nombor(
                    row.pemandu
                );


            item.klm +=
                pemandu;

            item.rm +=
                pemandu * kadar;

        }
    );


    laporanPos =
        Array.from(
            senaraiPos.values()
        )
        .filter(
            item =>
                item.anggota.size > 0
                ||
                item.klm > 0
                ||
                item.rm > 0
        )
        .sort(
            (a,b) =>
                a.pos.localeCompare(
                    b.pos,
                    "ms"
                )
        );


    console.log(
        "LAPORAN POS:",
        laporanPos
    );

}


// =====================================================
// POS KOSONG
// =====================================================

function kosongPos(pos){

    return {

        pos:pos,

        namaPos:
            cariNamaPos(pos),

        anggota:new Set(),

        hariBiasa:0,

        rmHariBiasa:0,

        off4Hari:0,

        off4RM:0,

        off48Hari:0,

        off48RM:0,

        off8Jam:0,

        off8RM:0,

        cuti8Hari:0,

        cuti8RM:0,

        cuti8PJam:0,

        cuti8PRM:0,

        klm:0,

        rm:0

    };

}


// =====================================================
// CARI NAMA POS
// =====================================================

function cariNamaPos(pos){

    const cari =
        dataPos.find(
            row => {

                const kod =
                    String(
                        row.no_pos
                        ||
                        row.kod_pos
                        ||
                        row.poskhidmat
                        ||
                        row.kod
                        ||
                        ""
                    ).trim();


                return (
                    kod.toUpperCase()
                    ===
                    String(pos)
                        .trim()
                        .toUpperCase()
                );

            }
        );


    return (
        cari?.nama_pos
        ||
        cari?.nama
        ||
        cari?.nama_pos_kawalan
        ||
        pos
    );

}


// =====================================================
// CARI ANGGOTA
// =====================================================

function cariAnggota(noSKB){

    if(
        noSKB === null ||
        noSKB === undefined
    )
        return null;


    return dataAnggota.find(
        anggota =>
            String(
                anggota.noskb
                ||
                anggota.no_skb
                ||
                ""
            )
            ===
            String(
                noSKB
            )
    );

}


// =====================================================
// KADAR RM
// =====================================================

function kadarRM(anggota){

    if(!anggota)
        return 0;


    return nombor(
        anggota.rm_pehariklmbiasa
    );

}


// =====================================================
// KIRA RM ROW
// =====================================================

function kiraRMRow(row){

    const anggota =
        cariAnggota(
            row.no_skb
        );


    const kadar =
        kadarRM(
            anggota
        );


    const jam =
        nombor(
            row.jam_klm
            ||
            row.jam_kerja
        );


    return jam * kadar;

}


// =====================================================
// NOMBOR
// =====================================================

function nombor(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    )
        return 0;


    return Number(
        String(value)
            .replace(/,/g,"")
            .replace(/RM/gi,"")
            .trim()
    ) || 0;

}


// =====================================================
// BINA JADUAL
// =====================================================

function binaJadual(){

    const tbody =
        document.getElementById(
            "laporanTableBody"
        );


    tbody.innerHTML = "";


    if(!laporanPos.length){

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="17"
                    class="empty-row"
                >
                    Tiada rekod bagi bulan
                    yang dipilih.
                </td>

            </tr>

        `;

        binaFooterKosong();

        return;

    }


    laporanPos.forEach(
        (
            item,
            index
        ) => {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>
                    ${escapeHTML(item.pos)}
                </td>


                <td>
                    ${escapeHTML(item.namaPos)}
                </td>


                <td>
                    ${formatJam(item.hariBiasa)}
                </td>


                <td class="money-cell">
                    RM ${formatRM(item.rmHariBiasa)}
                </td>


                <td>
                    ${formatNombor(item.off4Hari)}
                </td>


                <td class="money-cell">
                    RM ${formatRM(item.off4RM)}
                </td>


                <td>
                    ${formatNombor(item.off48Hari)}
                </td>


                <td class="money-cell">
                    RM ${formatRM(item.off48RM)}
                </td>


                <td>
                    ${formatJam(item.off8Jam)}
                </td>


                <td class="money-cell">
                    RM ${formatRM(item.off8RM)}
                </td>


                <td>
                    ${formatNombor(item.cuti8Hari)}
                </td>


                <td class="money-cell">
                    RM ${formatRM(item.cuti8RM)}
                </td>


                <td>
                    ${formatJam(item.cuti8PJam)}
                </td>


                <td class="money-cell">
                    RM ${formatRM(item.cuti8PRM)}
                </td>


                <td>
                    ${formatJam(item.klm)}
                </td>


                <td class="money-cell">
                    RM ${formatRM(item.rm)}
                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );


    binaFooter();

}


// =====================================================
// FOOTER
// =====================================================

function binaFooter(){

    const total =
        kiraJumlahLaporan();


    document.getElementById(
        "totalHariBiasa"
    ).textContent =
        formatJam(
            total.hariBiasa
        );


    document.getElementById(
        "totalRMHariBiasa"
    ).textContent =
        "RM "
        +
        formatRM(
            total.rmHariBiasa
        );


    document.getElementById(
        "totalOff4Hari"
    ).textContent =
        formatNombor(
            total.off4Hari
        );


    document.getElementById(
        "totalOff4RM"
    ).textContent =
        "RM "
        +
        formatRM(
            total.off4RM
        );


    document.getElementById(
        "totalOff48Hari"
    ).textContent =
        formatNombor(
            total.off48Hari
        );


    document.getElementById(
        "totalOff48RM"
    ).textContent =
        "RM "
        +
        formatRM(
            total.off48RM
        );


    document.getElementById(
        "totalOff8Jam"
    ).textContent =
        formatJam(
            total.off8Jam
        );


    document.getElementById(
        "totalOff8RM"
    ).textContent =
        "RM "
        +
        formatRM(
            total.off8RM
        );


    document.getElementById(
        "totalCuti8Hari"
    ).textContent =
        formatNombor(
            total.cuti8Hari
        );


    document.getElementById(
        "totalCuti8RM"
    ).textContent =
        "RM "
        +
        formatRM(
            total.cuti8RM
        );


    document.getElementById(
        "totalCuti8PJam"
    ).textContent =
        formatJam(
            total.cuti8PJam
        );


    document.getElementById(
        "totalCuti8PRM"
    ).textContent =
        "RM "
        +
        formatRM(
            total.cuti8PRM
        );


    document.getElementById(
        "totalKLM"
    ).textContent =
        formatJam(
            total.klm
        );


    document.getElementById(
        "totalRM"
    ).textContent =
        "RM "
        +
        formatRM(
            total.rm
        );

}


// =====================================================
// FOOTER KOSONG
// =====================================================

function binaFooterKosong(){

    const ids = [

        "totalHariBiasa",
        "totalOff8Jam",
        "totalKLM"

    ];


    ids.forEach(
        id => {

            const el =
                document.getElementById(
                    id
                );

            if(el)
                el.textContent = "0";

        }
    );


    const rmIds = [

        "totalRMHariBiasa",
        "totalOff4RM",
        "totalOff48RM",
        "totalOff8RM",
        "totalCuti8RM",
        "totalCuti8PRM",
        "totalRM"

    ];


    rmIds.forEach(
        id => {

            const el =
                document.getElementById(
                    id
                );

            if(el)
                el.textContent =
                    "RM 0.00";

        }
    );

}


// =====================================================
// JUMLAH
// =====================================================

function kiraJumlahLaporan(){

    const jumlah =
        kosongPos("TOTAL");


    laporanPos.forEach(
        item => {

            jumlah.hariBiasa +=
                item.hariBiasa;

            jumlah.rmHariBiasa +=
                item.rmHariBiasa;

            jumlah.off4Hari +=
                item.off4Hari;

            jumlah.off4RM +=
                item.off4RM;

            jumlah.off48Hari +=
                item.off48Hari;

            jumlah.off48RM +=
                item.off48RM;

            jumlah.off8Jam +=
                item.off8Jam;

            jumlah.off8RM +=
                item.off8RM;

            jumlah.cuti8Hari +=
                item.cuti8Hari;

            jumlah.cuti8RM +=
                item.cuti8RM;

            jumlah.cuti8PJam +=
                item.cuti8PJam;

            jumlah.cuti8PRM +=
                item.cuti8PRM;

            jumlah.klm +=
                item.klm;

            jumlah.rm +=
                item.rm;

        }
    );


    return jumlah;

}


// =====================================================
// SUMMARY
// =====================================================

function binaSummary(){

    const total =
        kiraJumlahLaporan();


    const jumlahAnggota =
        new Set();


    laporanPos.forEach(
        item => {

            item.anggota.forEach(
                noSKB =>
                    jumlahAnggota.add(
                        noSKB
                    )
            );

        }
    );


    document.getElementById(
        "summaryPos"
    ).textContent =
        laporanPos.length;


    document.getElementById(
        "summaryAnggota"
    ).textContent =
        jumlahAnggota.size;


    document.getElementById(
        "summaryJam"
    ).textContent =
        formatJam(
            total.klm
        );


    document.getElementById(
        "summaryRM"
    ).textContent =
        "RM "
        +
        formatRM(
            total.rm
        );


    document.getElementById(
        "finalPos"
    ).textContent =
        laporanPos.length;


    document.getElementById(
        "finalKLM"
    ).textContent =
        formatJam(
            total.klm
        )
        +
        " JAM";


    document.getElementById(
        "finalRM"
    ).textContent =
        "RM "
        +
        formatRM(
            total.rm
        );

}


// =====================================================
// FORMAT JAM
// =====================================================

function formatJam(value){

    return Number(
        value || 0
    ).toLocaleString(
        "ms-MY",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
    );

}


// =====================================================
// FORMAT RM
// =====================================================

function formatRM(value){

    return Number(
        value || 0
    ).toLocaleString(
        "ms-MY",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
    );

}


// =====================================================
// FORMAT NOMBOR
// =====================================================

function formatNombor(value){

    const number =
        Number(
            value || 0
        );


    if(
        Number.isInteger(number)
    ){

        return number.toLocaleString(
            "ms-MY"
        );

    }


    return number.toLocaleString(
        "ms-MY",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
    );

}


// =====================================================
// STATUS
// =====================================================

function setStatus(message){

    const el =
        document.getElementById(
            "status"
        );


    if(el){

        el.textContent =
            message;

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value){

    return String(
        value ?? ""
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

