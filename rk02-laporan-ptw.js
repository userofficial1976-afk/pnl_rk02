// =====================================================
// RK02 LAPORAN PTW / POW / PPOW
// =====================================================


// =====================================================
// SUPABASE
// =====================================================




// =====================================================
// GLOBAL
// =====================================================

let pengguna = null;

let laporanData = [];


// =====================================================
// BULAN
// =====================================================

const SENARAI_BULAN = [

    "",
    "Januari",
    "Februari",
    "Mac",
    "April",
    "Mei",
    "Jun",
    "Julai",
    "Ogos",
    "September",
    "Oktober",
    "November",
    "Disember"

];


// =====================================================
// INIT
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "RK02 LAPORAN PTW SYSTEM START"
        );

        await tungguPengguna();

        paparMaklumatPengguna();

        tetapkanTarikhSemasa();

        pasangEvent();

    }
);


// =====================================================
// TUNGGU USER AUTH
// =====================================================

async function tungguPengguna() {

    for (
        let i = 0;
        i < 50;
        i++
    ) {

        if (
            window.pengguna ||
            window.currentUser ||
            window.user
        ) {

            pengguna =
                window.pengguna ||
                window.currentUser ||
                window.user;

            return;

        }


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    100
                )
        );

    }


    pengguna =
        window.pengguna ||
        window.currentUser ||
        window.user ||
        null;

}




// =====================================================
// PAPAR USER
// =====================================================

function paparMaklumatPengguna() {

    setText(
        "namaPengguna",
        pengguna?.nama || "-"
    );


    setText(
        "jawatanPengguna",
        pengguna?.jawatan || "-"
    );

}


// =====================================================
// TARIKH SEMASA
// =====================================================

function tetapkanTarikhSemasa() {

    const sekarang =
        new Date();


    const bulan =
        sekarang.getMonth() + 1;


    const tahun =
        sekarang.getFullYear();


    const bulanEl =
        document.getElementById(
            "bulan"
        );


    const tahunEl =
        document.getElementById(
            "tahun"
        );


    if (bulanEl) {

        bulanEl.value =
            String(bulan);

    }


    if (tahunEl) {

        tahunEl.value =
            tahun;

    }

}


// =====================================================
// EVENT
// =====================================================

function pasangEvent() {

    document
        .getElementById("btnPapar")
        ?.addEventListener(
            "click",
            paparLaporan
        );


    document
        .getElementById("btnSimpan")
        ?.addEventListener(
            "click",
            simpanDatabase
        );


    document
        .getElementById("btnExcel")
        ?.addEventListener(
            "click",
            exportExcel
        );


    document
        .getElementById("btnReset")
        ?.addEventListener(
            "click",
            resetLaporan
        );

}


// =====================================================
// PAPAR LAPORAN
// =====================================================

async function paparLaporan() {

    const bulan =
        Number(
            document.getElementById(
                "bulan"
            )?.value
        );


    const tahun =
        Number(
            document.getElementById(
                "tahun"
            )?.value
        );


    if (
        !bulan ||
        !tahun
    ) {

        alert(
            "Sila pilih bulan dan tahun."
        );

        return;

    }


    setStatus(
        "Sedang mengambil data Supabase..."
    );


    try {

        laporanData =
            await binaLaporan(
                bulan,
                tahun
            );


        paparTable(
            laporanData,
            bulan,
            tahun
        );


        setStatus(
            "Laporan berjaya dipaparkan."
        );


    } catch (error) {

        console.error(
            "RALAT LAPORAN:",
            error
        );


        setStatus(
            "Gagal mengambil data: " +
            error.message
        );


        alert(
            "Gagal mengambil laporan:\n" +
            error.message
        );

    }

}


// =====================================================
// BINA LAPORAN
// =====================================================

async function binaLaporan(
    bulan,
    tahun
) {



    // =================================================
    // 1. RK02 DATA ENTRY
    // =================================================

    let queryRK02 =
        supabaseClient

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
            );





    const {
        data: rk02,
        error: errorRK02
    } =
        await queryRK02;


    if (errorRK02) {

        throw errorRK02;

    }


    // =================================================
    // 2. DATA ANGGOTA
    // =================================================

    let queryAnggota =
        supabaseClient

            .from(
                "Data_Anggota"
            )

            .select(
                "*"
            );


    


    const {
        data: anggota,
        error: errorAnggota
    } =
        await queryAnggota;


    if (errorAnggota) {

        throw errorAnggota;

    }


    // =================================================
    // 3. POS TAMPUNGAN
    // =================================================

    let queryTampungan =
        supabaseClient

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
            );


  


    const {
        data: tampungan,
        error: errorTampungan
    } =
        await queryTampungan;


    if (errorTampungan) {

        throw errorTampungan;

    }


    // =================================================
    // 4. CUTI PENGGANTI
    // =================================================

    let queryCuti =
        supabaseClient

            .from(
                "cuti_pengganti"
            )

            .select("*")

            .eq(
                "bulan",
                bulan
            )

            .eq(
                "tahun",
                tahun
            );


   


    const {
        data: cuti,
        error: errorCuti
    } =
        await queryCuti;


    if (errorCuti) {

        throw errorCuti;

    }


    console.log(
        "DATA RK02:",
        rk02
    );


    console.log(
        "DATA ANGGOTA:",
        anggota
    );


    console.log(
        "DATA TAMPUNGAN:",
        tampungan
    );


    console.log(
        "DATA CUTI:",
        cuti
    );


    // =================================================
    // MAP
    // =================================================

const anggotaMap =
    new Map();


(anggota || [])
    .forEach(
        a => {

const key =
    String(
        a.noskb ||
        ""
    )
        .trim();


            if (key) {

                anggotaMap.set(
                    key,
                    a
                );

            }

        }
    );

    const tampunganMap =
        new Map();


    (tampungan || [])
        .forEach(
            r => {

                const key =
                    String(
                        r.no_skb ||
                        ""
                    )
                        .trim();


                if (key) {

                    tampunganMap.set(
                        key,
                        r
                    );

                }

            }
        );


    const cutiMap =
        new Map();


    (cuti || [])
        .forEach(
            r => {

                const key =
                    String(
                        r.no_skb ||
                        ""
                    )
                        .trim();


                if (key) {

                    cutiMap.set(
                        key,
                        r
                    );

                }

            }
        );


    // =================================================
    // BINA ROW
    // =================================================

    const rows = [];


    (rk02 || [])
        .forEach(
            r => {

                const noSkb =
                    String(
                        r.no_skb ||
                        ""
                    )
                        .trim();


                if (!noSkb) {

                    return;

                }


                const a =
                    anggotaMap.get(
                        noSkb
                    ) || {};


                const t =
                    tampunganMap.get(
                        noSkb
                    ) || {};


                const c =
                    cutiMap.get(
                        noSkb
                    ) || {};


                rows.push(
                    kiraRow(
                        r,
                        a,
                        t,
                        c,
                        bulan,
                        tahun,

                    )
                );

            }
        );


    return rows;

}


// =====================================================
// KIRA SATU ROW
// =====================================================

function kiraRow(
    r,
    a,
    t,
    c,
    bulan,
    tahun,
   
) {

    const basicGaji =
        nombor(
            a.gaji_pokok
        );


    const kadarTetap =
        nombor(
            a.rm_pehariklmbiasa
        );


    // =================================================
    // KHIDMAT TETAP
    // =================================================

    const jumlahKlmTetap =
        nombor(
            r.hari_biasa
        );


    const rmKlmTetap =
        jumlahKlmTetap *
        kadarTetap;


    // =================================================
    // TAMPUNG LUAR
    // =================================================

    const jumlahKlmTampungLuar =

        nombor(t.jam_pos1) +

        nombor(t.jam_pos2) +

        nombor(t.jam_pos3) +

        nombor(t.jam_pos4) +

        nombor(t.jam_pos5) +

        nombor(t.jam_pos6);


    const rmKlmTampungLuar =
        jumlahKlmTampungLuar *
        kadarTetap;


    // =================================================
    // OFFDAY
    // =================================================

    const hariOffday =
        nombor(
            r.off48
        );


    const jamOffday =
        nombor(
            r.off8
        );


    const rmOffday =

        (
            hariOffday *
            nombor(
                a.rm_perharioffday
            )
        )

        +

        (
            jamOffday *
            nombor(
                a.rm_perjamoffday
            )
        );


    // =================================================
    // CUTI AM
    // =================================================

    const hariCutiAM =
        nombor(
            r.cuti8
        );


    const jamCutiAM =
        nombor(
            r.cuti8p
        );


    const rmCutiAM =

        (
            hariCutiAM *
            nombor(
                a.rm_perharicutiam
            )
        )

        +

        (
            jamCutiAM *
            nombor(
                a.rm_perjamcutiam
            )
        );


    // =================================================
    // RM KESELURUHAN
    // =================================================

    const rmKeseluruhan =

        rmKlmTetap +

        rmOffday +

        rmCutiAM;


    // =================================================
    // CUTI PENGGANTI
    // =================================================

    const jamCutiTahun =
        nombor(
            c.jam_cuti_tahun
        );


    const rmCutiTahun =
        nombor(
            c.rm_cuti_tahun
        );


    const jamKlmWajib =
        nombor(
            c.jam_lain2
        );


    const rmKlmWajib =
        nombor(
            c.rm_lain2
        );


    const jamCutiGanti =
        nombor(
            c.jam_cuti_ganti
        );


    const rmCutiGanti =
        nombor(
            c.rm_cuti_ganti
        );


    const jamKursus =
        nombor(
            c.jam_kursus
        );


    const rmKursus =
        nombor(
            c.rm_kursus
        );


    const jamMC =
        nombor(
            c.jam_cuti_sakit
        );


    const rmMC =
        nombor(
            c.rm_cuti_sakit
        );


    const jamCutiEhsan =
        nombor(
            c.jam_cuti_ehsan
        );


    const rmCutiEhsan =
        nombor(
            c.rm_cuti_ehsan
        );


    // =================================================
    // TAMPUNGAN
    // =================================================

    const jamLDB =
        nombor(
            t.pemandu
        );


    const rmLDB =
        nombor(
            t.rm_pemandu
        );


    const jamEskot =
        nombor(
            t.eskot
        );


    const rmEskot =
        nombor(
            t.rm_eskot
        );


    const jamCIT =
        nombor(
            t.cit
        );


    const rmCIT =
        nombor(
            t.rm_cit
        );


    const jamTadbir =
        nombor(
            t.kawalan_wang
        );


    const rmTadbir =
        nombor(
            t.rm_kawalan_wang
        );


    const jamKawTambahan =
        nombor(
            t.kawalan_tambahan
        );


    const rmKawTambahan =
        nombor(
            t.rm_kawalan_tambahan
        );


    // =================================================
    // DATA RK02 TAMBAHAN
    // =================================================

    const jamEskotRK02 =
        nombor(
            r.jam_eskot
        );


    const kmEskot =
        nombor(
            r.km_eskot
        );


    const medical =
        nombor(
            r.medical
        );


    const travel =
        nombor(
            r.travel
        );


    // =================================================
    // RETURN
    // =================================================

    return {

        bulan,

        tahun,

        

        no_skb:
            r.no_skb || null,

        nama:
            r.nama ||
            a.nama ||
            null,

        basic_gaji:
            basicGaji,


        jumlah_klm_tetap:
            jumlahKlmTetap,

        rm_klm_tetap:
            rmKlmTetap,


        jumlah_klm_tampung_luar:
            jumlahKlmTampungLuar,

        rm_klm_tampung_luar:
            rmKlmTampungLuar,


        hari_offday:
            hariOffday,

        jam_offday:
            jamOffday,

        rm_offday:
            rmOffday,


        hari_cuti_am:
            hariCutiAM,

        jam_cuti_am:
            jamCutiAM,

        rm_cuti_am:
            rmCutiAM,


        rm_keseluruhan:
            rmKeseluruhan,


        jam_ldb:
            jamLDB,

        rm_ldb:
            rmLDB,


        jam_cuti_tahun:
            jamCutiTahun,

        rm_cuti_tahun:
            rmCutiTahun,


        jam_klm_wajib:
            jamKlmWajib,

        rm_klm_wajib:
            rmKlmWajib,


        jam_cuti_ganti:
            jamCutiGanti,

        rm_cuti_ganti:
            rmCutiGanti,


        jam_eskot:
            jamEskot,

        rm_eskot:
            rmEskot,


        jam_cit:
            jamCIT,

        rm_cit:
            rmCIT,


        jam_kursus:
            jamKursus,

        rm_kursus:
            rmKursus,


        jam_mc:
            jamMC,

        rm_mc:
            rmMC,


        jam_cuti_ehsan:
            jamCutiEhsan,

        rm_cuti_ehsan:
            rmCutiEhsan,


        jam_tadbir:
            jamTadbir,

        rm_tadbir:
            rmTadbir,


        jam_kaw_tambahan:
            jamKawTambahan,

        rm_kaw_tambahan:
            rmKawTambahan,


        jam_eskot_rk02:
            jamEskotRK02,

        km_eskot:
            kmEskot,

        medical,

        travel,


        dikemaskini_oleh:
            pengguna?.nama || "-"

    };

}


// =====================================================
// PAPAR TABLE
// =====================================================

function paparTable(
    rows,
    bulan,
    tahun
) {

    const tbody =
        document.getElementById(
            "laporanBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    if (
        !rows ||
        rows.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="41"
                    class="empty"
                >
                    TIADA DATA UNTUK BULAN INI
                </td>

            </tr>

        `;


        setText(
            "jumlahRekod",
            "0 REKOD"
        );


        return;

    }


    rows.forEach(
        (r, index) => {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${esc(r.no_skb)}
                </td>

                <td>
                    ${esc(r.nama)}
                </td>

                <td class="money">
                    ${rm(r.basic_gaji)}
                </td>


                <td class="num">
                    ${num(r.jumlah_klm_tetap)}
                </td>

                <td class="money">
                    ${rm(r.rm_klm_tetap)}
                </td>


                <td class="num">
                    ${num(r.jumlah_klm_tampung_luar)}
                </td>

                <td class="money">
                    ${rm(r.rm_klm_tampung_luar)}
                </td>


                <td class="num">
                    ${num(r.hari_offday)}
                </td>

                <td class="num">
                    ${num(r.jam_offday)}
                </td>

                <td class="money">
                    ${rm(r.rm_offday)}
                </td>


                <td class="num">
                    ${num(r.hari_cuti_am)}
                </td>

                <td class="num">
                    ${num(r.jam_cuti_am)}
                </td>

                <td class="money">
                    ${rm(r.rm_cuti_am)}
                </td>


                <td class="money">
                    ${rm(r.rm_keseluruhan)}
                </td>


                <td class="num">
                    ${num(r.jam_ldb)}
                </td>

                <td class="money">
                    ${rm(r.rm_ldb)}
                </td>


                <td class="num">
                    ${num(r.jam_cuti_tahun)}
                </td>

                <td class="money">
                    ${rm(r.rm_cuti_tahun)}
                </td>


                <td class="num">
                    ${num(r.jam_klm_wajib)}
                </td>

                <td class="money">
                    ${rm(r.rm_klm_wajib)}
                </td>


                <td class="num">
                    ${num(r.jam_cuti_ganti)}
                </td>

                <td class="money">
                    ${rm(r.rm_cuti_ganti)}
                </td>


                <td class="num">
                    ${num(r.jam_eskot)}
                </td>

                <td class="money">
                    ${rm(r.rm_eskot)}
                </td>


                <td class="num">
                    ${num(r.jam_cit)}
                </td>

                <td class="money">
                    ${rm(r.rm_cit)}
                </td>


                <td class="num">
                    ${num(r.jam_kursus)}
                </td>

                <td class="money">
                    ${rm(r.rm_kursus)}
                </td>


                <td class="num">
                    ${num(r.jam_mc)}
                </td>

                <td class="money">
                    ${rm(r.rm_mc)}
                </td>


                <td class="num">
                    ${num(r.jam_cuti_ehsan)}
                </td>

                <td class="money">
                    ${rm(r.rm_cuti_ehsan)}
                </td>


                <td class="num">
                    ${num(r.jam_tadbir)}
                </td>

                <td class="money">
                    ${rm(r.rm_tadbir)}
                </td>


                <td class="num">
                    ${num(r.jam_kaw_tambahan)}
                </td>

                <td class="money">
                    ${rm(r.rm_kaw_tambahan)}
                </td>


                <td class="num">
                    ${num(r.jam_eskot_rk02)}
                </td>

                <td class="num">
                    ${num(r.km_eskot)}
                </td>

                <td class="num">
                    ${num(r.medical)}
                </td>

                <td class="num">
                    ${num(r.travel)}
                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );


    paparJumlah(
        rows
    );


    setText(
        "jumlahRekod",
        rows.length +
        " REKOD"
    );


    setText(
        "tajukBulan",
        `${SENARAI_BULAN[bulan]} ${tahun}`
    );

}


// =====================================================
// JUMLAH FOOTER
// =====================================================

function paparJumlah(
    rows
) {

    const tfoot =
        document.getElementById(
            "laporanFoot"
        );


    if (!tfoot) {

        return;

    }


    const jumlah = {

        jumlah_klm_tetap: 0,
        rm_klm_tetap: 0,

        jumlah_klm_tampung_luar: 0,
        rm_klm_tampung_luar: 0,

        hari_offday: 0,
        jam_offday: 0,
        rm_offday: 0,

        hari_cuti_am: 0,
        jam_cuti_am: 0,
        rm_cuti_am: 0,

        rm_keseluruhan: 0,

        jam_ldb: 0,
        rm_ldb: 0,

        jam_cuti_tahun: 0,
        rm_cuti_tahun: 0,

        jam_klm_wajib: 0,
        rm_klm_wajib: 0,

        jam_cuti_ganti: 0,
        rm_cuti_ganti: 0,

        jam_eskot: 0,
        rm_eskot: 0,

        jam_cit: 0,
        rm_cit: 0,

        jam_kursus: 0,
        rm_kursus: 0,

        jam_mc: 0,
        rm_mc: 0,

        jam_cuti_ehsan: 0,
        rm_cuti_ehsan: 0,

        jam_tadbir: 0,
        rm_tadbir: 0,

        jam_kaw_tambahan: 0,
        rm_kaw_tambahan: 0,

        jam_eskot_rk02: 0,
        km_eskot: 0,
        medical: 0,
        travel: 0

    };


    rows.forEach(
        r => {

            Object.keys(jumlah)
                .forEach(
                    key => {

                        jumlah[key] +=
                            nombor(
                                r[key]
                            );

                    }
                );

        }
    );


    tfoot.innerHTML = `

        <tr>

            <td colspan="4">
                JUMLAH
            </td>


            <td class="num">
                ${num(jumlah.jumlah_klm_tetap)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_klm_tetap)}
            </td>


            <td class="num">
                ${num(jumlah.jumlah_klm_tampung_luar)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_klm_tampung_luar)}
            </td>


            <td class="num">
                ${num(jumlah.hari_offday)}
            </td>

            <td class="num">
                ${num(jumlah.jam_offday)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_offday)}
            </td>


            <td class="num">
                ${num(jumlah.hari_cuti_am)}
            </td>

            <td class="num">
                ${num(jumlah.jam_cuti_am)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_cuti_am)}
            </td>


            <td class="money">
                ${rm(jumlah.rm_keseluruhan)}
            </td>


            <td class="num">
                ${num(jumlah.jam_ldb)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_ldb)}
            </td>


            <td class="num">
                ${num(jumlah.jam_cuti_tahun)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_cuti_tahun)}
            </td>


            <td class="num">
                ${num(jumlah.jam_klm_wajib)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_klm_wajib)}
            </td>


            <td class="num">
                ${num(jumlah.jam_cuti_ganti)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_cuti_ganti)}
            </td>


            <td class="num">
                ${num(jumlah.jam_eskot)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_eskot)}
            </td>


            <td class="num">
                ${num(jumlah.jam_cit)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_cit)}
            </td>


            <td class="num">
                ${num(jumlah.jam_kursus)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_kursus)}
            </td>


            <td class="num">
                ${num(jumlah.jam_mc)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_mc)}
            </td>


            <td class="num">
                ${num(jumlah.jam_cuti_ehsan)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_cuti_ehsan)}
            </td>


            <td class="num">
                ${num(jumlah.jam_tadbir)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_tadbir)}
            </td>


            <td class="num">
                ${num(jumlah.jam_kaw_tambahan)}
            </td>

            <td class="money">
                ${rm(jumlah.rm_kaw_tambahan)}
            </td>


            <td class="num">
                ${num(jumlah.jam_eskot_rk02)}
            </td>

            <td class="num">
                ${num(jumlah.km_eskot)}
            </td>

            <td class="num">
                ${num(jumlah.medical)}
            </td>

            <td class="num">
                ${num(jumlah.travel)}
            </td>

        </tr>

    `;

}


// =====================================================
// SIMPAN DATABASE
// =====================================================

async function simpanDatabase() {

    if (
        !laporanData ||
        laporanData.length === 0
    ) {

        alert(
            "Papar laporan dahulu sebelum simpan."
        );

        return;

    }


    setStatus(
        "Sedang menyimpan laporan ke database..."
    );


    const rows =
        laporanData.map(
            r => ({

                ...r,

                dikemaskini_oleh:
                    pengguna?.nama || "-",

                dikemaskini_pada:
                    new Date()
                        .toISOString()

            })
        );


    const {
        error
    } = await supabaseClient

        .from(
            "rk02_laporan_ptw"
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
            "RALAT SIMPAN:",
            error
        );


        setStatus(
            "Gagal simpan database."
        );


        alert(
            "Gagal simpan database:\n" +
            error.message
        );


        return;

    }


    setStatus(
        "Laporan berjaya disimpan ke rk02_laporan_ptw."
    );


    alert(
        "Laporan berjaya disimpan ke database."
    );

}


// =====================================================
// EXPORT EXCEL
// =====================================================

function exportExcel() {

    if (
        !laporanData ||
        laporanData.length === 0
    ) {

        alert(
            "Tiada laporan untuk diexport."
        );

        return;

    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "Library Excel tidak dimuatkan."
        );

        return;

    }


    const dataExcel =
        laporanData.map(
            (r, index) => ({

                "BIL":
                    index + 1,

                "SKB":
                    r.no_skb,

                "NAMA ANGGOTA":
                    r.nama,

                "BASIC GAJI":
                    r.basic_gaji,

                "JUMLAH KLM KHIDMAT TETAP":
                    r.jumlah_klm_tetap,

                "RM KHIDMAT TETAP":
                    r.rm_klm_tetap,

                "JUMLAH KLM TAMPUNG LUAR":
                    r.jumlah_klm_tampung_luar,

                "RM TAMPUNG LUAR":
                    r.rm_klm_tampung_luar,

                "HARI OFFDAY":
                    r.hari_offday,

                "JAM OFFDAY":
                    r.jam_offday,

                "RM OFFDAY":
                    r.rm_offday,

                "HARI CUTI AM":
                    r.hari_cuti_am,

                "JAM CUTI AM":
                    r.jam_cuti_am,

                "RM CUTI AM":
                    r.rm_cuti_am,

                "RM KESELURUHAN":
                    r.rm_keseluruhan,

                "JAM LDB":
                    r.jam_ldb,

                "RM LDB":
                    r.rm_ldb,

                "JAM CUTI TAHUN":
                    r.jam_cuti_tahun,

                "RM CUTI TAHUN":
                    r.rm_cuti_tahun,

                "JAM KLM WAJIB":
                    r.jam_klm_wajib,

                "RM KLM WAJIB":
                    r.rm_klm_wajib,

                "JAM CUTI GANTI":
                    r.jam_cuti_ganti,

                "RM CUTI GANTI":
                    r.rm_cuti_ganti,

                "JAM ESKOT":
                    r.jam_eskot,

                "RM ESKOT":
                    r.rm_eskot,

                "JAM CIT":
                    r.jam_cit,

                "RM CIT":
                    r.rm_cit,

                "JAM KURSUS":
                    r.jam_kursus,

                "RM KURSUS":
                    r.rm_kursus,

                "JAM MC":
                    r.jam_mc,

                "RM MC":
                    r.rm_mc,

                "JAM CUTI EHSAN":
                    r.jam_cuti_ehsan,

                "RM CUTI EHSAN":
                    r.rm_cuti_ehsan,

                "JAM TADBIR":
                    r.jam_tadbir,

                "RM TADBIR":
                    r.rm_tadbir,

                "JAM KAWALAN TAMBAHAN":
                    r.jam_kaw_tambahan,

                "RM KAWALAN TAMBAHAN":
                    r.rm_kaw_tambahan,

                "JAM ESKOT RK02":
                    r.jam_eskot_rk02,

                "KM ESKOT":
                    r.km_eskot,

                "MEDICAL":
                    r.medical,

                "TRAVEL":
                    r.travel

            })
        );


    const worksheet =
        XLSX.utils.json_to_sheet(
            dataExcel
        );


    worksheet["!cols"] =

        Object.keys(
            dataExcel[0]
        ).map(
            key => ({

                wch:
                    Math.max(
                        12,
                        key.length + 2
                    )

            })
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Laporan RK02"
    );


    const bulan =
        document.getElementById(
            "bulan"
        )?.value || "";


    const tahun =
        document.getElementById(
            "tahun"
        )?.value || "";


    XLSX.writeFile(
        workbook,
        `Laporan_RK02_PTW_${bulan}_${tahun}.xlsx`
    );


    setStatus(
        "Excel berjaya dijana."
    );

}


// =====================================================
// RESET
// =====================================================

function resetLaporan() {

    laporanData = [];


    const tbody =
        document.getElementById(
            "laporanBody"
        );


    if (tbody) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="41"
                    class="empty"
                >
                    Tiada data.
                </td>

            </tr>

        `;

    }


    const tfoot =
        document.getElementById(
            "laporanFoot"
        );


    if (tfoot) {

        tfoot.innerHTML = "";

    }


    setText(
        "jumlahRekod",
        "0 REKOD"
    );


    setText(
        "tajukBulan",
        "-"
    );


    setStatus(
        "Laporan telah direset."
    );

}


// =====================================================
// UTIL
// =====================================================

function nombor(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    const n =
        Number(value);


    return Number.isFinite(n)
        ? n
        : 0;

}


// =====================================================
// FORMAT NUMBER
// =====================================================

function num(
    value
) {

    return nombor(value)
        .toLocaleString(
            "ms-MY",
            {
                maximumFractionDigits: 2
            }
        );

}


// =====================================================
// FORMAT RM
// =====================================================

function rm(
    value
) {

    return nombor(value)
        .toLocaleString(
            "ms-MY",
            {

                minimumFractionDigits: 2,

                maximumFractionDigits: 2

            }
        );

}


// =====================================================
// TEXT
// =====================================================

function setText(
    id,
    value
) {

    const el =
        document.getElementById(
            id
        );


    if (el) {

        el.textContent =
            value;

    }

}


// =====================================================
// STATUS
// =====================================================

function setStatus(
    text
) {

    setText(
        "statusBox",
        text
    );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function esc(
    value
) {

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
